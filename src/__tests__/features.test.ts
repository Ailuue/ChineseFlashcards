import {
  describe, it, expect, vi, afterEach,
} from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('features', () => {
  it('mnemonic is off when VITE_FEATURE_MNEMONIC is unset', async () => {
    vi.resetModules()
    const { features } = await import('../config/features')
    expect(features.mnemonic).toBe(false)
  })

  it('mnemonic is on when VITE_FEATURE_MNEMONIC is "true"', async () => {
    vi.stubEnv('VITE_FEATURE_MNEMONIC', 'true')
    vi.resetModules()
    const { features } = await import('../config/features')
    expect(features.mnemonic).toBe(true)
  })

  it('mnemonic is off when VITE_FEATURE_MNEMONIC is "1"', async () => {
    vi.stubEnv('VITE_FEATURE_MNEMONIC', '1')
    vi.resetModules()
    const { features } = await import('../config/features')
    expect(features.mnemonic).toBe(false)
  })

  it('mnemonic is off when VITE_FEATURE_MNEMONIC is "false"', async () => {
    vi.stubEnv('VITE_FEATURE_MNEMONIC', 'false')
    vi.resetModules()
    const { features } = await import('../config/features')
    expect(features.mnemonic).toBe(false)
  })
})
