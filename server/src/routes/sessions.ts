import { Router } from 'express'
import { eq, and, sql } from 'drizzle-orm'
import { db } from '../db'
import { studySessions } from '../db/schema'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

// POST /api/sessions — start a study session
router.post('/', async (req, res) => {
  const { userId } = req.user!
  const [session] = await db
    .insert(studySessions)
    .values({ userId })
    .returning({ id: studySessions.id })
  res.json({ id: session.id })
})

// PATCH /api/sessions/:id/end — mark a session as ended
router.patch('/:id/end', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid session id' })
    return
  }
  const { userId } = req.user!
  await db
    .update(studySessions)
    .set({ endedAt: sql`now()` })
    .where(and(eq(studySessions.id, id), eq(studySessions.userId, userId)))
  res.json({ ok: true })
})

export default router
