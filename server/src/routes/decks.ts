import { Router } from 'express'
import { eq, and, count, sql, inArray } from 'drizzle-orm'
import { db } from '../db'
import { decks, words, userProgress } from '../db/schema'
import { requireAuth } from '../middleware/auth'
import { allowedLevels } from '../utils/level'

const router = Router()
router.use(requireAuth)

// GET /api/decks
router.get('/', async (req, res) => {
  const { userId } = req.user!

  const rows = await db
    .select({
      id: decks.id,
      name: decks.name,
      description: decks.description,
      level: decks.level,
      isSystem: decks.isSystem,
      wordCount: count(words.id),
      learnedCount: sql<number>`count(case when ${userProgress.correct} > 0 then 1 end)`.mapWith(Number),
      createdAt: decks.createdAt,
    })
    .from(decks)
    .leftJoin(words, eq(words.deckId, decks.id))
    .leftJoin(userProgress, and(eq(userProgress.wordId, words.id), eq(userProgress.userId, userId)))
    .where(inArray(decks.level, allowedLevels(req.user!.hskLevel ?? 1)))
    .groupBy(decks.id)
    .orderBy(decks.id)

  res.json({ decks: rows })
})

// GET /api/decks/:id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid deck id' })
    return
  }

  const deck = await db.query.decks.findFirst({
    where: eq(decks.id, id),
    with: { words: true },
  })

  if (!deck) {
    res.status(404).json({ error: 'Deck not found' })
    return
  }

  res.json(deck)
})

export default router
