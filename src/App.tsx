import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TweaksProvider } from './context/TweaksContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Dashboard from './screens/Dashboard'
import StudyScreen from './screens/StudyScreen'
import DeckBrowser from './screens/DeckBrowser'
import StatsScreen from './screens/StatsScreen'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

const App = () => (
  <TweaksProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<LoginScreen />} />
          <Route path="register" element={<RegisterScreen />} />
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="study" element={<StudyScreen />} />
            <Route path="decks" element={<DeckBrowser />} />
            <Route path="stats" element={<StatsScreen />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </TweaksProvider>
)

export default App
