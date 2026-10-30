import { Link } from 'react-router-dom'

const PLATFORMS = [
  {
    emoji: '💼',
    title: 'LinkedIn Post',
    desc: 'Professional thought-leadership posts with hooks, structured insights, and engaging calls to action for your professional network.',
    gradient: 'from-blue-600 to-indigo-700',
    tag: 'Thought Leadership',
  },
  {
    emoji: '📸',
    title: 'Instagram Caption',
    desc: 'Scroll-stopping aesthetic captions crafted with emotional hooks, conversational body text, and strategic hashtag placements.',
    gradient: 'from-pink-500 via-rose-500 to-purple-600',
    tag: 'Social Engagement',
  },
  {
    emoji: '🎬',
    title: 'YouTube Shorts',
    desc: 'High-retention 9:16 short-video scripts complete with a 3-second hook, visual cues, scene pacing, and audio prompts.',
    gradient: 'from-red-500 to-red-700',
    tag: 'Short-Form Video',
  },
  {
    emoji: '🎨',
    title: 'Carousel Slides',
    desc: 'Structured slide-by-slide storytelling with bold slide headlines, bite-sized body copy, and a high-converting finale slide.',
    gradient: 'from-violet-500 to-purple-700',
    tag: 'Slide Storyboard',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Input Your Idea',
    desc: 'Paste a blog post, article, lecture notes, or rough outline. Set your tone, audience, and length.',
  },
  {
    step: '02',
    title: 'AI Adapts to 4 Formats',
    desc: 'Google Gemini simultaneously generates platform-tailored copy for LinkedIn, Instagram, Shorts, and Carousels.',
  },
  {
    step: '03',
    title: 'Preview, Edit & Export',
    desc: 'Inspect interactive platform-accurate previews, edit copy in real time, and download individual or bundled text files.',
  },
]

const HIGHLIGHTS = [
  {
    icon: '⚡',
    title: '1-Click Multi-Format',
    desc: 'Stop rewriting content 4 times. Generate all major formats from one source in seconds.',
  },
  {
    icon: '📱',
    title: 'Realistic Previews',
    desc: 'Preview how your content will look on LinkedIn, Instagram, 9:16 Shorts, and Carousel slides.',
  },
  {
    icon: '🔄',
    title: 'Regenerate & Improve',
    desc: 'Iterate endlessly. Ask AI to polish hooks, readability, or tone with one click.',
  },
  {
    icon: '💾',
    title: 'Grouped History',
    desc: 'Every generation is saved locally as an organized bundle. Revisit, re-edit, or re-export anytime.',
  },
]

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-bloom-700 via-bloom-600 to-accent-600 py-20 sm:py-28 px-4 text-white">
        {/* Subtle background glow circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent-400/20 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-4 py-1.5 text-xs sm:text-sm font-medium text-white mb-6 border border-white/20 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ContentBloom AI Studio</span>
            <span className="text-white/40">•</span>
            <span className="text-bloom-100">Powered by Google Gemini</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6">
            From one source idea
            <br />
            <span className="bg-gradient-to-r from-bloom-100 via-white to-pink-200 bg-clip-text text-transparent">
              to four publish-ready formats.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-bloom-100 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Repurpose your articles, notes, and outlines into high-performing{' '}
            <strong className="text-white font-semibold">LinkedIn posts</strong>,{' '}
            <strong className="text-white font-semibold">Instagram captions</strong>,{' '}
            <strong className="text-white font-semibold">YouTube Shorts scripts</strong>, and{' '}
            <strong className="text-white font-semibold">Carousels</strong> — all in one click.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/generate-all"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl
                         bg-white text-bloom-800 font-bold px-8 py-3.5 text-base sm:text-lg
                         hover:bg-bloom-50 hover:shadow-xl active:scale-[0.98] transition-all shadow-lg"
            >
              <span>✨</span>
              <span>Generate All 4 Formats</span>
              <svg className="h-5 w-5 text-bloom-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            <Link
              to="/generate"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl
                         bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 text-base
                         border border-white/20 backdrop-blur-sm transition-all"
            >
              <span>📝</span>
              <span>Single Format Post</span>
            </Link>
          </div>

          {/* Micro stats banner */}
          <div className="mt-14 pt-8 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">4-in-1</p>
              <p className="text-xs text-bloom-200 mt-1">Multi-format export</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-bloom-200 mt-1">Editable previews</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">4 Tones</p>
              <p className="text-xs text-bloom-200 mt-1">Audience targeted</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">Local</p>
              <p className="text-xs text-bloom-200 mt-1">Private history store</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4 Supported Formats ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="section-label justify-center">Tailored Content Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for where your audience spends time
          </h2>
          <p className="text-slate-600 mt-3 text-base">
            Each format follows algorithm-friendly conventions, proven engagement patterns, and native platform aesthetics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLATFORMS.map((p) => (
            <div
              key={p.title}
              className="card flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md transition-all duration-200 border-slate-200"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.gradient}
                                flex items-center justify-center text-2xl shadow-sm text-white`}
                  >
                    {p.emoji}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {p.tag}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-bloom-600 transition-colors">
                  {p.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{p.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-bloom-600">
                <span>View platform preview</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Value Props / Features Grid ──────────────────────────────────── */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
                <span className="text-2xl mb-3 block">{h.icon}</span>
                <h4 className="font-bold text-slate-900 text-base mb-1.5">{h.title}</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="section-label justify-center">Effortless Workflow</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How ContentBloom works</h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Three streamlined steps from raw text to publish-ready distribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {STEPS.map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="w-13 h-13 rounded-2xl bg-bloom-100 border-2 border-bloom-300 flex items-center justify-center mb-5 text-bloom-700 font-black text-lg shadow-xs">
                  {s.step}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Box */}
          <div className="mt-14 p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-bloom-600 via-bloom-700 to-accent-600 text-white text-center shadow-lg">
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Ready to bloom your content everywhere?
            </h3>
            <p className="text-bloom-100 max-w-xl mx-auto mb-6 text-sm sm:text-base">
              Start with one idea and get four platform-customized outputs in under ten seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/generate-all"
                className="btn-primary bg-white text-bloom-800 hover:bg-bloom-50 text-base py-3 px-8 shadow-md"
              >
                ✨ Launch 4-in-1 Studio
              </Link>
              <Link
                to="/history"
                className="btn-secondary bg-bloom-800/40 text-white border-white/20 hover:bg-bloom-800/60 text-base py-3 px-6"
              >
                📚 Open Saved Library
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
