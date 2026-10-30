import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Generate from './pages/Generate'
import Results from './pages/Results'
import GenerateAll from './pages/GenerateAll'
import ImageStudio from './pages/ImageStudio'
import VideoStudio from './pages/VideoStudio'
import CampaignStudio from './pages/CampaignStudio'
import History from './pages/History'

/**
 * App — root component.
 *
 * Routes:
 *   /            → Dashboard
 *   /generate    → Single-format content generation
 *   /results     → Editable content + regenerate + improve
 *   /generate-all → Generate four formats from one idea
 *   /image-studio → AI image prompt & visual concept studio
 *   /video-studio → Video script & storyboard production studio
 *   /campaign    → 30-Asset campaign & social media scheduler
 *   /history     → Saved content library
 *   *            → Redirect to dashboard
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/results" element={<Results />} />
            <Route path="/generate-all" element={<GenerateAll />} />
            <Route path="/image-studio" element={<ImageStudio />} />
            <Route path="/video-studio" element={<VideoStudio />} />
            <Route path="/campaign" element={<CampaignStudio />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200">
          © 2026 ContentBloom AI · Built for IncuBrix Assessment
        </footer>
      </div>
    </BrowserRouter>
  )
}
