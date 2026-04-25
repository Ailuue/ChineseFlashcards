import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest'
import { request } from '../api/client'

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
