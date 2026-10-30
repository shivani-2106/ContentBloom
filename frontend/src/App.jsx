import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Dashboard from './pages/Dashboard'
import Generate from './pages/Generate'
import Results from './pages/Results'
import GenerateAll from './pages/GenerateAll'
import ImageStudio from './pages/ImageStudio'
import VideoStudio from './pages/VideoStudio'
import CampaignStudio from './pages/CampaignStudio'
import History from './pages/History'
import GrowthPlaybook from './pages/GrowthPlaybook'

/**
 * App — root component with persistent left sidebar layout.
 *
 * Routes wrapped in AppLayout:
 *   /            → Dashboard
 *   /generate    → Single-format content generation
 *   /results     → Editable content + regenerate + improve
 *   /generate-all → Generate four formats from one idea
 *   /image-studio → AI image prompt & visual concept studio
 *   /video-studio → Video script & storyboard production studio
 *   /campaign    → 30-Asset campaign & social media scheduler
 *   /history     → Saved content library
 *
 * Standalone editorial resource route:
 *   /resources/growth-playbook → Connected campaign resource landing page
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone Connected Landing Page (Editorial Resource Layout) */}
        <Route path="/resources/growth-playbook" element={<GrowthPlaybook />} />

        {/* Workspace & Studios (Persistent Left Sidebar Layout) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/results" element={<Results />} />
          <Route path="/generate-all" element={<GenerateAll />} />
          <Route path="/image-studio" element={<ImageStudio />} />
          <Route path="/video-studio" element={<VideoStudio />} />
          <Route path="/campaign" element={<CampaignStudio />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
