import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

/**
 * Navbar — responsive top navigation bar shown on every page.
 */
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-bloom-50 text-bloom-700 font-semibold shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-bloom-600 via-bloom-500 to-accent-500 flex items-center justify-center shadow-sm shadow-bloom-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white text-sm font-extrabold tracking-tight">CB</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight">
              ContentBloom<span className="text-bloom-600"> AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
              Multi-Format Content Studio
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            <span>🏠</span> Home
          </NavLink>

          <NavLink to="/generate-all" className={navLinkClass}>
            <span>✨</span> 4-in-1 Studio
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-bloom-100 text-bloom-700">
              Hot
            </span>
          </NavLink>

          <NavLink to="/video-studio" className={navLinkClass}>
            <span>🎬</span> Video Studio
          </NavLink>

          <NavLink to="/image-studio" className={navLinkClass}>
            <span>🎨</span> Image Studio
          </NavLink>

          <NavLink to="/campaign" className={navLinkClass}>
            <span>🚀</span> Campaign (30-Day)
          </NavLink>

          <NavLink to="/generate" className={navLinkClass}>
            <span>📝</span> Single Post
          </NavLink>

          <NavLink to="/history" className={navLinkClass}>
            <span>📚</span> History
          </NavLink>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Link
            to="/generate-all"
            className="btn-primary py-2 px-3.5 text-xs sm:text-sm shadow-sm"
          >
            <span>✨</span> Create 4 Formats
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
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-1 shadow-lg animate-in fade-in slide-in-from-top-2">
          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive ? 'bg-bloom-50 text-bloom-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            🏠 Home Dashboard
          </NavLink>

          <NavLink
            to="/generate-all"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                isActive ? 'bg-bloom-50 text-bloom-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <span>✨ Generate All (4 Formats)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-bloom-100 text-bloom-700">
              Featured
            </span>
          </NavLink>

          <NavLink
            to="/video-studio"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive ? 'bg-bloom-50 text-bloom-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            🎬 Video Script & Storyboard Studio
          </NavLink>

          <NavLink
            to="/image-studio"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive ? 'bg-bloom-50 text-bloom-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            🎨 Image & Visual Concept Studio
          </NavLink>

          <NavLink
            to="/campaign"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive ? 'bg-bloom-50 text-bloom-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            🚀 30-Asset Campaign & Scheduler
          </NavLink>

          <NavLink
            to="/generate"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive ? 'bg-bloom-50 text-bloom-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            📝 Single Post Generator
          </NavLink>

          <NavLink
            to="/history"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive ? 'bg-bloom-50 text-bloom-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            📚 Content Library & History
          </NavLink>

          <div className="pt-2">
            <Link
              to="/generate-all"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full py-2.5 text-center text-sm"
            >
              ✨ Create 4 Formats Now
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
