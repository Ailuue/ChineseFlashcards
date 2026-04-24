import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import wordsRoutes from './routes/words'
import decksRoutes from './routes/decks'
import progressRoutes from './routes/progress'

const app = express()
const PORT = process.env.PORT ?? 3001

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/words', wordsRoutes)
app.use('/api/decks', decksRoutes)
app.use('/api/progress', progressRoutes)

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`)
})
