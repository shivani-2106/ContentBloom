import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

/**
 * Navbar — Streamlined primary SaaS navigation.
 *
 * Core destinations:
 * 1. Dashboard (/)
 * 2. Campaigns (/campaign)
 * 3. Generate Content (/generate-all)
 * 4. Content Calendar (/campaign?tab=calendar)
 * 5. Asset Library (/campaign?tab=assets)
 * 6. History (/history)
 *
 * Supporting contextual tools:
 * - Image Studio (/image-studio)
 * - Video Studio (/video-studio)
 * - Single Post (/generate)
 */
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const location = useLocation()

  const isCalendarActive = location.pathname === '/campaign' && location.search.includes('tab=calendar')
  const isAssetsActive = location.pathname === '/campaign' && location.search.includes('tab=assets')
  const isCampaignActive = location.pathname === '/campaign' && !isCalendarActive && !isAssetsActive

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-bloom-50 text-bloom-700 font-bold shadow-2xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-bloom-600 to-bloom-500 flex items-center justify-center shadow-xs shadow-bloom-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white text-sm font-extrabold tracking-tight">CB</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 text-base leading-tight tracking-tight flex items-center gap-1">
              ContentBloom <span className="text-bloom-600 font-black">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wide hidden sm:block">
              Campaign Manager
            </span>
          </div>
        </Link>

        {/* Primary Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            <span>📊</span> Dashboard
          </NavLink>

          <Link
            to="/campaign"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-150 ${
              isCampaignActive
                ? 'bg-bloom-50 text-bloom-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <span>🚀</span> Campaigns
          </Link>

          <NavLink to="/generate-all" className={navLinkClass}>
            <span>✨</span> Generate Content
          </NavLink>

          <Link
            to="/campaign?tab=calendar"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-150 ${
              isCalendarActive
                ? 'bg-bloom-50 text-bloom-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <span>📅</span> Calendar
          </Link>

          <Link
            to="/campaign?tab=assets"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-150 ${
              isAssetsActive
                ? 'bg-bloom-50 text-bloom-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <span>🗂️</span> Asset Library
          </Link>

          <NavLink to="/history" className={navLinkClass}>
            <span>📚</span> History
          </NavLink>

          {/* Contextual Studio Tools Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setToolsOpen(!toolsOpen)}
              onBlur={() => setTimeout(() => setToolsOpen(false), 200)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
            >
              <span>🛠️ Studios</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>

            {toolsOpen && (
              <div className="absolute right-0 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg animate-in fade-in slide-in-from-top-1 z-50">
                <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">
                  Media & Output Studios
                </span>
                <Link
                  to="/image-studio"
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-bloom-700"
                >
                  <span>🎨</span> Image Studio (PNG)
                </Link>
                <Link
                  to="/video-studio"
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-rose-700"
                >
                  <span>🎬</span> Video Studio (WebM ≤60s)
                </Link>
                <div className="my-1 border-t border-slate-100" />
                <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">
                  Connected Destinations
                </span>
                <Link
                  to="/resources/growth-playbook"
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-bloom-700"
                >
                  <span>📖</span> Growth Playbook
                </Link>
                <div className="my-1 border-t border-slate-100" />
                <Link
                  to="/generate"
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <span>📝</span> Single Post Generator
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Primary Header Action */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Link
            to="/campaign?create=true"
            className="btn-primary py-2 px-3.5 text-xs sm:text-sm font-bold shadow-xs"
          >
            <span>➕</span> New Campaign
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-1 shadow-lg animate-in fade-in">
          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-semibold ${
                isActive ? 'bg-bloom-50 text-bloom-700' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            📊 Dashboard
          </NavLink>

          <Link
            to="/campaign"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isCampaignActive ? 'bg-bloom-50 text-bloom-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            🚀 Campaigns
          </Link>

          <NavLink
            to="/generate-all"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-semibold ${
                isActive ? 'bg-bloom-50 text-bloom-700' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            ✨ Generate Content
          </NavLink>

          <Link
            to="/campaign?tab=calendar"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isCalendarActive ? 'bg-bloom-50 text-bloom-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            📅 30-Day Content Calendar
          </Link>

          <Link
            to="/campaign?tab=assets"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isAssetsActive ? 'bg-bloom-50 text-bloom-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            🗂️ Asset Library
          </Link>

          <NavLink
            to="/history"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-semibold ${
                isActive ? 'bg-bloom-50 text-bloom-700' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            📚 History
          </NavLink>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-3 block mb-1">
              Supporting Studios
            </span>
            <Link
              to="/image-studio"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              🎨 Image Studio (PNG)
            </Link>
            <Link
              to="/video-studio"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              🎬 Video Studio (WebM ≤60s)
            </Link>
            <Link
              to="/resources/growth-playbook"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              📖 Growth Playbook
            </Link>
          </div>

          <div className="pt-2">
            <Link
              to="/campaign?create=true"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full py-2.5 text-xs font-bold justify-center"
            >
              ➕ Create New Campaign
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
