const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Request failed')
  return data as T
}

export interface AuthUser {
  id: number
  username: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export interface Word {
  id: number
  simplified: string
  traditional: string
  pinyin: string
  tones: number[]
  meaning: string
  deck: string
  deckId: number
}

export interface WordsResponse {
  words: Word[]
  count: number
  total: number
  offset: number
  limit: number
}

export interface DeckInfo {
  id: number
  name: string
  description: string | null
  level: string | null
  wordCount: number
  learnedCount: number
}

export const api = {
  register: (username: string, password: string) => request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),

  login: (username: string, password: string) => request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),

  me: () => request<AuthUser>('/api/auth/me'),

  session: (count: number) => request<{ words: Word[]; total: number }>(
    `/api/progress/session?count=${count}`,
  ),

  recordReview: (wordId: number, correct: boolean) => request<{ progress: unknown }>(
    `/api/progress/${wordId}/review`,
    { method: 'POST', body: JSON.stringify({ correct }) },
  ),

  activity: () => request<{ activity: Record<string, number> }>('/api/progress/activity'),

  stats: () => request<{
    streak: number;
    learnedCount: number;
    totalWords: number;
    todayAccuracy: number | null;
    todayCorrect: number;
    todayTotal: number;
    timeTodaySeconds: number;
    decksTodayCount: number;
    lastReviewedAt: string | null;
    recentWords: { simplified: string; traditional: string; pinyin: string; tones: number[]; meaning: string; deck: string; lastReviewCorrect: boolean | null }[];
  }>('/api/progress/stats'),

  dailyMix: () => request<{ words: Word[] }>('/api/progress/daily-mix'),

  startSession: () => request<{ id: number }>('/api/sessions', { method: 'POST' }),

  endSession: (id: number) => request<{ ok: boolean }>(`/api/sessions/${id}/end`, { method: 'PATCH', keepalive: true }),

  decks: () => request<{ decks: DeckInfo[] }>('/api/decks'),

  words: (params?: { limit?: number; deck?: string; q?: string }) => {
    const qs = new URLSearchParams()
    if (params?.limit != null) qs.set('limit', String(params.limit))
    if (params?.deck) qs.set('deck', params.deck)
    if (params?.q) qs.set('q', params.q)
    const query = qs.toString()
    return request<WordsResponse>(query ? `/api/words?${query}` : '/api/words')
  },
}
