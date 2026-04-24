import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { users } from '../db/schema'
import { requireAuth, signToken } from '../middleware/auth'

const router = Router()

const RegisterSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'letters, numbers, underscore only'),
  password: z.string().min(8),
})

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
    return
  }

  const { username, password } = parsed.data

  const existing = await db.query.users.findFirst({ where: eq(users.username, username) })
  if (existing) {
    res.status(409).json({ error: 'Username already taken' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const [user] = await db
    .insert(users)
    .values({ username, passwordHash })
    .returning({ id: users.id, username: users.username })

  const token = signToken({ userId: user.id, username: user.username })
  res.status(201).json({ user, token })
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

  const token = signToken({ userId: user.id, username: user.username })
  res.json({ user: { id: user.id, username: user.username }, token })
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

export default router
