import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest'
import { request, api } from '../api/client'

const mockFetch = (ok: boolean, body: unknown) => vi.fn().mockResolvedValue({
  ok,
  json: () => Promise.resolve(body),
})

beforeEach(() => { localStorage.clear() })
afterEach(() => { vi.restoreAllMocks() })

describe('request', () => {
  it('returns parsed JSON on success', async () => {
    vi.stubGlobal('fetch', mockFetch(true, { hello: 'world' }))
    const result = await request('/test')
    expect(result).toEqual({ hello: 'world' })
  })

  it('throws the server error message on non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetch(false, { error: 'Not found' }))
    await expect(request('/test')).rejects.toThrow('Not found')
  })

  it('falls back to "Request failed" when error field is missing', async () => {
    vi.stubGlobal('fetch', mockFetch(false, {}))
    await expect(request('/test')).rejects.toThrow('Request failed')
  })

  it('includes Authorization header when a token is in localStorage', async () => {
    localStorage.setItem('token', 'abc123')
    const spy = mockFetch(true, {})
    vi.stubGlobal('fetch', spy)
    await request('/test')
    const [, opts] = spy.mock.calls[0] as [string, RequestInit]
    expect((opts.headers as Record<string, string>)['Authorization']).toBe('Bearer abc123')
  })

  it('omits Authorization header when no token is stored', async () => {
    const spy = mockFetch(true, {})
    vi.stubGlobal('fetch', spy)
    await request('/test')
    const [, opts] = spy.mock.calls[0] as [string, RequestInit]
    expect((opts.headers as Record<string, string>)['Authorization']).toBeUndefined()
  })

  it('merges caller-supplied headers with defaults', async () => {
    const spy = mockFetch(true, {})
    vi.stubGlobal('fetch', spy)
    await request('/test', { headers: { 'X-Custom': 'value' } })
    const [, opts] = spy.mock.calls[0] as [string, RequestInit]
    expect((opts.headers as Record<string, string>)['X-Custom']).toBe('value')
    expect((opts.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })
})

// ── streamMnemonic ───────────────────────────────────────────────────────────

const encoder = new TextEncoder()

function makeReaderMock(chunks: string[]) {
  let i = 0
  return {
    read: vi.fn().mockImplementation(() => {
      if (i < chunks.length) {
        return Promise.resolve({ done: false as const, value: encoder.encode(chunks[i++]) })
      }
      return Promise.resolve({ done: true as const, value: undefined })
    }),
  }
}

function mockSSEFetch(chunks: string[]) {
  return vi.fn().mockResolvedValue({
    ok: true,
    body: { getReader: () => makeReaderMock(chunks) },
  })
}

const word = { simplified: '你', pinyin: 'nǐ', meaning: 'you' }

describe('streamMnemonic', () => {
  it('delivers text chunks and calls onDone on [DONE]', async () => {
    vi.stubGlobal('fetch', mockSSEFetch([
      'data: {"text":"Hello"}\n\n',
      'data: {"text":" world"}\n\n',
      'data: [DONE]\n\n',
    ]))
    const chunks: string[] = []
    const onDone = vi.fn()
    const onError = vi.fn()
    await api.streamMnemonic(word, (c) => chunks.push(c), onDone, onError)
    expect(chunks).toEqual(['Hello', ' world'])
    expect(onDone).toHaveBeenCalledOnce()
    expect(onError).not.toHaveBeenCalled()
  })

  it('calls onDone when stream ends without a [DONE] sentinel', async () => {
    vi.stubGlobal('fetch', mockSSEFetch(['data: {"text":"Hi"}\n\n']))
    const onDone = vi.fn()
    await api.streamMnemonic(word, () => {}, onDone, () => {})
    expect(onDone).toHaveBeenCalledOnce()
  })

  it('calls onError when fetch returns a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, body: null }))
    const onError = vi.fn()
    await api.streamMnemonic(word, () => {}, () => {}, onError)
    expect(onError).toHaveBeenCalledWith('Failed to connect')
  })

  it('calls onError when response body is null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, body: null }))
    const onError = vi.fn()
    await api.streamMnemonic(word, () => {}, () => {}, onError)
    expect(onError).toHaveBeenCalledWith('Failed to connect')
  })

  it('calls onError on server error payload and does not call onDone', async () => {
    vi.stubGlobal('fetch', mockSSEFetch([
      'data: {"error":"Failed to generate mnemonic"}\n\n',
    ]))
    const onDone = vi.fn()
    const onError = vi.fn()
    await api.streamMnemonic(word, () => {}, onDone, onError)
    expect(onError).toHaveBeenCalledWith('Failed to generate mnemonic')
    expect(onDone).not.toHaveBeenCalled()
  })

  it('handles SSE data split across multiple read() calls', async () => {
    vi.stubGlobal('fetch', mockSSEFetch([
      'data: {"tex',
      't":"Hi"}\n\ndata: [DONE]\n\n',
    ]))
    const chunks: string[] = []
    await api.streamMnemonic(word, (c) => chunks.push(c), () => {}, () => {})
    expect(chunks).toEqual(['Hi'])
  })

  it('ignores malformed JSON lines and continues processing', async () => {
    vi.stubGlobal('fetch', mockSSEFetch([
      'data: not-valid-json\n\n',
      'data: {"text":"OK"}\n\n',
      'data: [DONE]\n\n',
    ]))
    const chunks: string[] = []
    const onDone = vi.fn()
    await api.streamMnemonic(word, (c) => chunks.push(c), onDone, () => {})
    expect(chunks).toEqual(['OK'])
    expect(onDone).toHaveBeenCalled()
  })

  it('sends Authorization header when a token is in localStorage', async () => {
    localStorage.setItem('token', 'mytoken')
    const spy = mockSSEFetch(['data: [DONE]\n\n'])
    vi.stubGlobal('fetch', spy)
    await api.streamMnemonic(word, () => {}, () => {}, () => {})
    const [, opts] = spy.mock.calls[0] as [string, RequestInit]
    expect((opts.headers as Record<string, string>)['Authorization']).toBe('Bearer mytoken')
  })

  it('sends word data as JSON in the request body', async () => {
    const spy = mockSSEFetch(['data: [DONE]\n\n'])
    vi.stubGlobal('fetch', spy)
    await api.streamMnemonic(word, () => {}, () => {}, () => {})
    const [, opts] = spy.mock.calls[0] as [string, RequestInit]
    expect(JSON.parse(opts.body as string)).toEqual(word)
  })
})
