import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { api, type AuthUser } from '../api/client'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function loadInitialState(): { user: AuthUser | null; token: string | null } {
  const token = localStorage.getItem('token')
  const raw = localStorage.getItem('user')
  if (!token || !raw) return { user: null, token: null }
  try {
    return { user: JSON.parse(raw) as AuthUser, token }
  } catch {
    return { user: null, token: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadInitialState()
  const [user, setUser] = useState<AuthUser | null>(initial.user)
  const [token, setToken] = useState<string | null>(initial.token)

  const persist = useCallback((u: AuthUser, t: string) => {
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    setToken(t)
  }, [])

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await api.login(username, password)
      persist(res.user, res.token)
    },
    [persist],
  )

  const register = useCallback(
    async (username: string, password: string) => {
      const res = await api.register(username, password)
      persist(res.user, res.token)
    },
    [persist],
  )

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
