import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { eq, count } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { users } from '../db/schema'
import { requireAuth, signToken } from '../middleware/auth'

const router = Router()

const RegisterSchema = z.object({
  username: z.string().min(3).max(16).regex(/^[a-zA-Z0-9_]+$/, 'letters, numbers, underscore only'),
  password: z.string().min(8).max(128),
})

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

const HskLevelSchema = z.object({
  level: z.number().int().min(1).max(6),
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
    return
  }

  const { username, password } = parsed.data
  const rawIp = process.env.NODE_ENV !== 'development' ? (req.ip ?? null) : null
  const whitelist = (process.env.WHITELISTED_IPS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const ip = rawIp && whitelist.includes(rawIp) ? null : rawIp

  try {
    const [existing, [ipCount]] = await Promise.all([
      db.query.users.findFirst({ where: eq(users.username, username) }),
      ip
        ? db.select({ n: count() }).from(users).where(eq(users.registeredFromIp, ip))
        : Promise.resolve([{ n: 0 }]),
    ])

    if (existing) {
      res.status(409).json({ error: 'Username already taken' })
      return
    }

    if ((ipCount?.n ?? 0) >= 2) {
      res.status(429).json({ error: 'Account creation limit reached for this network' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const [user] = await db
      .insert(users)
      .values({ username, passwordHash, registeredFromIp: ip })
      .returning({ id: users.id, username: users.username, hskLevel: users.hskLevel })

    const token = signToken({ userId: user.id, username: user.username, hskLevel: user.hskLevel })
    res.status(201).json({ user, token })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed — please try again' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
    return
  }

  const { username, password } = parsed.data
  const user = await db.query.users.findFirst({ where: eq(users.username, username) })
  if (!user) {
    res.status(401).json({ error: 'Invalid username or password' })
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid username or password' })
    return
  }

  const token = signToken({ userId: user.id, username: user.username, hskLevel: user.hskLevel })
  res.json({ user: { id: user.id, username: user.username, hskLevel: user.hskLevel }, token })
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, req.user!.userId),
    columns: { passwordHash: false },
  })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json(user)
})

// PATCH /api/auth/hsk-level
router.patch('/hsk-level', requireAuth, async (req, res) => {
  const parsed = HskLevelSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Level must be an integer between 1 and 6' })
    return
  }

  const [user] = await db
    .update(users)
    .set({ hskLevel: parsed.data.level })
    .where(eq(users.id, req.user!.userId))
    .returning({ id: users.id, username: users.username, hskLevel: users.hskLevel })

  const token = signToken({ userId: user.id, username: user.username, hskLevel: user.hskLevel })
  res.json({ user, token })
})

export default router
