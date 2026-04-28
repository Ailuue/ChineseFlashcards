import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import rateLimit from 'express-rate-limit'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many mnemonic requests, slow down' },
})

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

router.post('/mnemonic', aiLimiter, async (req, res) => {
  const { simplified, pinyin, meaning } = req.body
  if (!simplified || !pinyin || !meaning) {
    res.status(400).json({ error: 'Missing word data' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 256,
      system: 'You write vivid 2-3 sentence mnemonic stories for Chinese characters. Connect the character\'s visual shape or components to its meaning. No preamble — go straight into the story.',
      messages: [{
        role: 'user',
        content: `Mnemonic for: ${simplified} (${pinyin}) — "${meaning}"`,
      }],
    })

    req.on('close', () => { stream.abort() })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate mnemonic' })}\n\n`)
    res.end()
  }
})

export default router
