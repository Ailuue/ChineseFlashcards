import { Router } from 'express'
import { eq, count } from 'drizzle-orm'
import { db } from '../db'
import { decks, words } from '../db/schema'

const router = Router()

// GET /api/decks
router.get('/', async (_req, res) => {
  const rows = await db
    .select({
      id: decks.id,
      name: decks.name,
      description: decks.description,
      level: decks.level,
      isSystem: decks.isSystem,
      wordCount: count(words.id),
      createdAt: decks.createdAt,
    })
    .from(decks)
    .leftJoin(words, eq(words.deckId, decks.id))
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
