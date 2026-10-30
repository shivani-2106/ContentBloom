import { useState, useEffect } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'

/**
 * AppLayout — Persistent Left Sidebar Navigation Layout for ContentBloom AI.
 *
 * Implements:
 * 1. Persistent desktop sidebar (approx. 256px) with fixed positioning.
 * 2. Optional desktop collapse/expand toggle.
 * 3. Mobile top bar with hamburger menu and full responsive slide-in drawer.
 * 4. Distinct WORKSPACE and CREATIVE STUDIO navigation groups.
 * 5. Indigo (#5145CD) + Soft Lavender (#EAE7FF) active state indicators.
 * 6. Non-overflowing main content container.
 */

const NAV_GROUPS = [
  {
    title: 'WORKSPACE',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '📊',
        path: '/',
        exact: true,
      },
      {
        id: 'campaigns',
        label: 'Campaigns',
        icon: '🚀',
        path: '/campaign',
        exact: false,
      },
      {
        id: 'generate_all',
        label: 'Generate Content',
        icon: '✨',
        path: '/generate-all',
        exact: true,
      },
      {
        id: 'calendar',
        label: '30-Day Calendar',
        icon: '📅',
        path: '/campaign?tab=calendar',
        exact: false,
      },
      {
        id: 'assets',
        label: 'Asset Library',
        icon: '🗂️',
        path: '/campaign?tab=assets',
        exact: false,
      },
      {
        id: 'history',
        label: 'Content History',
        icon: '📚',
        path: '/history',
        exact: true,
      },
    ],
  },
  {
    title: 'CREATIVE STUDIO',
    items: [
      {
        id: 'image_studio',
        label: 'Image Studio',
        badge: 'PNG',
        icon: '🎨',
        path: '/image-studio',
        exact: true,
      },
      {
        id: 'video_studio',
        label: 'Video Studio',
        badge: '≤60s',
        icon: '🎬',
        path: '/video-studio',
        exact: true,
      },
    ],
  },
  {
    title: 'RESOURCES',
    items: [
      {
        id: 'growth_playbook',
        label: 'Growth Playbook',
        badge: 'Resource',
        icon: '📖',
        path: '/resources/growth-playbook',
        exact: true,
      },
      {
        id: 'single_post',
        label: 'Single Post',
        icon: '📝',
        path: '/generate',
        exact: true,
      },
    ],
  },
]

export default function AppLayout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('cb_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })

  // Persist collapse preference
  useEffect(() => {
    try {
      localStorage.setItem('cb_sidebar_collapsed', String(isCollapsed))
    } catch {
      // ignore
    }
  }, [isCollapsed])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.search])

  // Helper to check if a navigation item is currently active
  function isItemActive(item) {
    if (item.path === '/') {
      return location.pathname === '/'
    }
    if (item.path === '/campaign') {
      return (
        location.pathname === '/campaign' &&
        !location.search.includes('tab=calendar') &&
        !location.search.includes('tab=assets')
      )
    }
    if (item.path === '/campaign?tab=calendar') {
      return location.pathname === '/campaign' && location.search.includes('tab=calendar')
    }
    if (item.path === '/campaign?tab=assets') {
      return location.pathname === '/campaign' && location.search.includes('tab=assets')
    }
    return location.pathname === item.path
  }

  return (
    <div className="min-h-screen bg-[#F7F7FC] text-[#171A35] flex antialiased">
      {/* ── DESKTOP PERSISTENT SIDEBAR ─────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-30 bg-white border-r border-[#E5E7F0] transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        aria-label="Application sidebar"
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#E5E7F0] shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 group overflow-hidden"
            title="ContentBloom AI"
          >
            <div className="w-9 h-9 rounded-xl bg-[#5145CD] flex items-center justify-center text-white text-sm font-extrabold shadow-xs shadow-[#5145CD]/20 group-hover:scale-105 transition-transform shrink-0">
              CB
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-[#171A35] text-base leading-tight tracking-tight truncate flex items-center gap-1">
                  ContentBloom <span className="text-[#5145CD] font-black">AI</span>
                </span>
                <span className="text-[11px] text-slate-400 font-semibold tracking-wide truncate">
                  AI Content Workspace
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items (Scrollable if height constrained) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              {!isCollapsed ? (
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                  {group.title}
                </div>
              ) : (
                <div className="w-8 mx-auto border-t border-[#E5E7F0] my-2" />
              )}

              {group.items.map((item) => {
                const active = isItemActive(item)
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 relative ${
                      active
                        ? 'bg-[#EAE7FF] text-[#5145CD] shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-[#171A35] hover:bg-slate-100/80 font-medium'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <span className="text-base shrink-0 leading-none">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          active
                            ? 'bg-white text-[#5145CD]'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#E5E7F0] bg-white space-y-2 shrink-0">
          {!isCollapsed ? (
            <div className="p-2.5 rounded-xl border border-[#E5E7F0] bg-[#F7F7FC] flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#168568] animate-pulse" />
                  <span className="text-[11px] font-bold text-[#171A35] truncate uppercase tracking-wider">
                    IncuBrix Edition
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Product Assessment</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#5145CD] bg-[#EAE7FF] px-1.5 py-0.5 rounded">
                v2.0
              </span>
            </div>
          ) : (
            <div className="text-center py-1" title="IncuBrix Edition v2.0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#168568] inline-block animate-pulse" />
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-slate-500 hover:text-[#171A35] hover:bg-slate-100 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span>{isCollapsed ? '👉' : '👈'}</span>
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* ── MOBILE DRAWER NAVIGATION ──────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#171A35]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-white flex flex-col shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-[#E5E7F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5145CD] flex items-center justify-center text-white text-xs font-extrabold shadow-xs">
                  CB
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-[#171A35] text-sm">
                    ContentBloom <span className="text-[#5145CD]">AI</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    AI Content Workspace
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 text-slate-500 hover:text-[#171A35] hover:bg-slate-100 rounded-lg"
                aria-label="Close sidebar menu"
              >
                ✕
              </button>
            </div>

            {/* Drawer Items */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
              {NAV_GROUPS.map((group) => (
                <div key={group.title} className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                    {group.title}
                  </div>
                  {group.items.map((item) => {
                    const active = isItemActive(item)
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          active
                            ? 'bg-[#EAE7FF] text-[#5145CD] font-bold shadow-2xs'
                            : 'text-slate-700 hover:text-[#171A35] hover:bg-slate-100/80'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              active
                                ? 'bg-white text-[#5145CD]'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#E5E7F0] bg-[#F7F7FC]">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#168568] animate-pulse" />
                <span className="text-xs font-bold text-[#171A35]">IncuBrix Product Edition</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Turn ideas into complete 30-day organized social campaigns.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ─────────────────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'md:pl-20' : 'md:pl-64'
        } overflow-x-hidden`}
      >
        {/* Mobile Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7F0] px-4 h-14 flex items-center justify-between md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:text-[#171A35] hover:bg-slate-100 rounded-lg focus:outline-none"
            aria-label="Open navigation sidebar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#5145CD] flex items-center justify-center text-white text-xs font-black">
              CB
            </div>
            <span className="font-extrabold text-[#171A35] text-sm">
              ContentBloom <span className="text-[#5145CD]">AI</span>
            </span>
          </Link>

          <Link
            to="/campaign?create=true"
            className="btn-primary py-1 px-2.5 text-xs font-bold"
          >
            ➕ New
          </Link>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 w-full min-w-0">
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="text-center py-4 px-4 text-xs text-slate-400 border-t border-[#E5E7F0] bg-white">
          © 2026 ContentBloom AI · Built for IncuBrix Assessment
        </footer>
      </div>
    </div>
  )
}

