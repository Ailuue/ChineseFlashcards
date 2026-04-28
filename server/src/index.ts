import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth'
import wordsRoutes from './routes/words'
import decksRoutes from './routes/decks'
import progressRoutes from './routes/progress'
import sessionRoutes from './routes/sessions'
import aiRoutes from './routes/ai'

const app = express()
const PORT = process.env.PORT ?? 3001

// ── Middleware ──────────────────────────────────────────────────────────────
app.set('trust proxy', 1)
app.use(helmet())

const allowedOrigins = (process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173').split(',').map((o) => o.trim())
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json())

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
})

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/words', wordsRoutes)
app.use('/api/decks', decksRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/ai', aiRoutes)

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
