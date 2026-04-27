import { Router } from 'express'
import { eq, ilike, count, inArray, and } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { words, decks } from '../db/schema'
import { requireAuth } from '../middleware/auth'
import { allowedLevels } from '../utils/level'

const router = Router()
router.use(requireAuth)

const QuerySchema = z.object({
  deck: z.string().optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
})

// GET /api/words
router.get('/', async (req, res) => {
  const parsed = QuerySchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query parameters' })
    return
  }

  const { deck, q, limit, offset } = parsed.data
  const levelFilter = inArray(decks.level, allowedLevels(req.user!.hskLevel ?? 1))

  let whereClause
  if (deck) whereClause = and(levelFilter, eq(decks.name, deck))
  else if (q) whereClause = and(levelFilter, ilike(words.simplified, `%${q}%`))
  else whereClause = levelFilter

  const [countResult, rows] = await Promise.all([
    db
      .select({ total: count() })
      .from(words)
      .innerJoin(decks, eq(words.deckId, decks.id))
      .where(whereClause)
      .then((r) => r[0]),
    db
      .select({
        id: words.id,
        simplified: words.simplified,
        traditional: words.traditional,
        pinyin: words.pinyin,
        tones: words.tones,
        meaning: words.meaning,
        deck: decks.name,
        deckId: words.deckId,
      })
      .from(words)
      .innerJoin(decks, eq(words.deckId, decks.id))
      .where(whereClause)
      .orderBy(words.id)
      .limit(limit)
      .offset(offset),
  ])

  res.json({
    words: rows,
    count: rows.length,
    total: countResult?.total ?? 0,
    offset,
    limit,
  })
})

// GET /api/words/:id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid word id' })
    return
  }

  const word = await db.query.words.findFirst({
    where: eq(words.id, id),
    with: { deck: true },
  })

  if (!word) {
    res.status(404).json({ error: 'Word not found' })
    return
  }

  res.json(word)
})

export default router
