import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import DotaPredictor from './pages/DotaPredictor.jsx'
import LeaguePredictor from './pages/LeaguePredictor.jsx'
import HokPredictor from './pages/HokPredictor.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dota2" element={<DotaPredictor />} />
        <Route path="/league" element={<LeaguePredictor />} />
        <Route path="/hok" element={<HokPredictor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App