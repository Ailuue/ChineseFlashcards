import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TweaksProvider } from './context/TweaksContext'
import Layout from './components/Layout'
import Dashboard from './screens/Dashboard'
import StudyScreen from './screens/StudyScreen'
import DeckBrowser from './screens/DeckBrowser'
import StatsScreen from './screens/StatsScreen'

const App = () => (
  <TweaksProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="study" element={<StudyScreen />} />
          <Route path="decks" element={<DeckBrowser />} />
          <Route path="stats" element={<StatsScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </TweaksProvider>
)

export default App
