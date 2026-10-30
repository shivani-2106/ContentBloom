import { useEffect, useState, useMemo, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { getCampaigns } from '../utils/campaignStorage'
import { recordDemoVisit } from '../utils/demoAnalytics'
import {
  resolveAssetFromUtm,
  resolveResourceTemplate,
  RESOURCE_TEMPLATES,
} from '../utils/resourceTemplates'

const FRAMEWORK_STEPS = [
  {
    step: '01',
    name: 'Research & Core Thesis',
    tag: 'Foundation',
    icon: '🔬',
    headline: 'Identify high-leverage bottlenecks and audience friction points',
    description:
      'High-performing campaigns do not start with blank-canvas social posts. They start with a validated core insight—a costly operational bottleneck, a contrarian framework, or quantitative case study findings. Validate the underlying thesis before generating distribution variants.',
    keyAction: 'Isolate 1 primary problem, 1 concrete framework, and 1 measurable outcome.',
  },
  {
    step: '02',
    name: 'Create the Master Source',
    tag: 'Substance',
    icon: '📝',
    headline: 'Draft one comprehensive, uncompromised reference asset',
    description:
      'Write a single authoritative piece of long-form source content—a 1,000-word blueprint, technical teardown, or release overview. This master document serves as the single source of truth for all downstream platform adaptations.',
    keyAction: 'Ensure clear step-by-step logic, specific terminology, and actionable takeaways.',
  },
  {
    step: '03',
    name: 'Multi-Format Adaptation',
    tag: 'Repurpose',
    icon: '✨',
    headline: 'Synthesize platform-native formats without generic copy-pasting',
    description:
      'Never cross-post the same text across platforms. Decompose the master source into tailored formats: structured 1–2 sentence paragraphs for LinkedIn, visual slide cards for Instagram carousels, paced 3-part scripts for YouTube Shorts, and concise threads for Twitter/X.',
    keyAction: 'Respect platform norms: hook formulas, line spacing, and duration constraints.',
  },
  {
    step: '04',
    name: 'Synchronized 30-Day Scheduling',
    tag: 'Distribution',
    icon: '📅',
    headline: 'Orchestrate a continuous calendar cadence across peak engagement windows',
    description:
      'Distribute your assets systematically across a 30-day timeline. Map high-depth thought leadership posts to weekday mornings (08:30–09:45 AM EST), visual carousels to midday breaks (11:30 AM–01:15 PM EST), and retention shorts to afternoon algorithmic peaks.',
    keyAction: 'Maintain steady frequency without burning out audience attention.',
  },
  {
    step: '05',
    name: 'Attribute & Measure',
    tag: 'UTM Tracking',
    icon: '📊',
    headline: 'Tag every destination link with granular UTM parameters',
    description:
      'Close the feedback loop between social impressions and qualified resource visits. Tag every CTA with verified source, medium, campaign, and content tags to clearly identify which specific days, hooks, and formats deliver pipeline.',
    keyAction: 'Standardize naming conventions: utm_source, utm_medium, utm_campaign, utm_content.',
  },
]

const PLATFORM_ROLES = [
  {
    platform: 'LinkedIn',
    badge: 'Authority & Pipeline',
    icon: '💼',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    primaryGoal: 'Establish founder and company thought leadership, build industry trust, and drive high-intent demo requests.',
    optimalFormat: 'Structured 1–2 sentence insights, document carousels with teardowns, and actionable case study narratives.',
    timing: 'Tuesday–Thursday · 08:30–09:45 AM EST',
  },
  {
    platform: 'Instagram',
    badge: 'Visual Proof & Brand Affinity',
    icon: '📸',
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-200',
    primaryGoal: 'Drive high-volume visual engagement, educate mobile audiences through save-worthy carousels, and showcase product aesthetics.',
    optimalFormat: 'Multi-slide portrait carousels (1080×1350), high-contrast infographic cards, and behind-the-scenes engineering snapshots.',
    timing: 'Daily · 11:30 AM–01:15 PM & 07:00 PM EST',
  },
  {
    platform: 'YouTube Shorts',
    badge: 'Algorithmic Discovery & Retention',
    icon: '🎬',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    primaryGoal: 'Tap algorithmic reach, capture top-of-funnel attention with kinetic motion, and direct viewers to long-form resources.',
    optimalFormat: 'Vertical 9:16 scripts (≤60s) with 3-second tension hooks, kinetic on-screen subtitles, and crisp call-to-actions.',
    timing: 'Monday–Friday · 02:00–04:30 PM EST',
  },
  {
    platform: 'Twitter / X',
    badge: 'Real-Time Discourse & Feedback',
    icon: '🐦',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    primaryGoal: 'Test new hook angles in real time, build in public, and engage niche technical communities.',
    optimalFormat: 'Bite-sized contrarian hot takes, 5-tweet actionable threads, and framework diagram breakdowns.',
    timing: 'Weekdays · 09:00 AM & 03:30 PM EST',
  },
]

const CHECKLIST_ITEMS = [
  { id: 'c1', label: 'Single core concept documented with problem, framework, and clear benefit' },
  { id: 'c2', label: '4 platform-specific adaptations generated with platform-native formatting' },
  { id: 'c3', label: 'Opening hooks evaluated for immediate attention-grabbing clarity (≥15 chars)' },
  { id: 'c4', label: 'Tracking URLs generated with verified destination and UTM tags' },
  { id: 'c5', label: 'Visual media (1080p PNG cards & ≤60s WebM videos) rendered and linked' },
  { id: 'c6', label: 'Complete 30-day content calendar confirmed and exported to scheduler-ready CSV' },
]

export default function GrowthPlaybook() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const hasRecordedRef = useRef(false)

  // Read UTM parameters
  const utmSource = searchParams.get('utm_source') || ''
  const utmMedium = searchParams.get('utm_medium') || ''
  const utmCampaign = searchParams.get('utm_campaign') || ''
  const utmContent = searchParams.get('utm_content') || ''

  const hasUtm = Boolean(utmSource || utmCampaign)

  // Local demo visit state
  const [visitRecorded, setVisitRecorded] = useState(false)
  const [checkedItems, setCheckedItems] = useState({
    c1: true,
    c2: true,
    c3: true,
    c4: true,
    c5: true,
    c6: true,
  })

  // Resolve matching campaign and asset deterministically from UTM tags
  const { campaign: matchedCampaign, asset: matchedAsset, isFallback } = useMemo(() => {
    const list = getCampaigns()
    return resolveAssetFromUtm(list, utmCampaign, utmContent)
  }, [utmCampaign, utmContent])

  // Select context-aware resource template matching the asset's CTA/promise
  const template = useMemo(() => {
    return resolveResourceTemplate(matchedAsset)
  }, [matchedAsset])

  // Record visit once on mount with deduplication guard
  useEffect(() => {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true

    const record = recordDemoVisit({
      path: '/resources/growth-playbook',
      utmSource: utmSource || 'direct',
      utmMedium: utmMedium || 'none',
      utmCampaign: utmCampaign || 'none',
      utmContent: utmContent || 'none',
      campaignId: matchedCampaign?.id || null,
      assetId: matchedAsset?.id || null,
    })

    if (record) {
      setVisitRecorded(true)
    }
  }, [utmSource, utmMedium, utmCampaign, utmContent, matchedCampaign, matchedAsset])

  // Primary CTA: Return to relevant campaign
  function handleExploreCampaign() {
    if (matchedCampaign) {
      if (matchedAsset) {
        navigate(`/campaign?campaignId=${matchedCampaign.id}&assetId=${matchedAsset.id}`)
      } else {
        navigate(`/campaign?campaignId=${matchedCampaign.id}`)
      }
    } else {
      navigate('/campaign')
    }
  }

  // Secondary CTA: Back to ContentBloom AI dashboard
  function handleBackToDashboard() {
    navigate('/')
  }

  function toggleCheck(id) {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen bg-[#F7F7FC] text-[#171A35] antialiased">
      {/* ── RESOURCE BRAND HEADER ──────────────────────────────────────── */}
      <nav className="bg-white border-b border-[#E5E7F0] sticky top-0 z-40 backdrop-blur-md bg-white/95 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#5145CD] flex items-center justify-center text-white text-xs font-black shadow-xs">
              CB
            </div>
            <div>
              <span className="font-extrabold text-[#171A35] text-sm leading-tight block">
                ContentBloom <span className="text-[#5145CD]">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide block">
                Growth Resource Center
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleBackToDashboard}
              className="btn-secondary py-1.5 px-3 text-xs font-semibold"
            >
              Back to ContentBloom AI
            </button>

            <button
              type="button"
              onClick={handleExploreCampaign}
              className="btn-primary py-1.5 px-3.5 text-xs font-bold shadow-xs"
            >
              Explore Campaign Workflow ➔
            </button>
          </div>
        </div>
      </nav>

      {/* ── ATTRIBUTION BANNER (Honest UTM Detection) ─────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {hasUtm ? (
          <div className="p-4 rounded-2xl border border-[#5145CD]/30 bg-gradient-to-r from-[#EAE7FF]/60 via-white to-[#F7F7FC] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{template.icon}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase bg-[#5145CD] text-white px-2 py-0.5 rounded">
                    Connected Campaign Source
                  </span>
                  <span className="text-xs font-bold text-[#171A35]">
                    Opened from your <strong className="capitalize text-[#5145CD]">{utmSource || 'Social'}</strong> campaign
                  </span>
                  {matchedAsset && (
                    <span className="text-[10px] font-mono font-bold bg-white text-[#5145CD] px-2 py-0.5 rounded border border-[#5145CD]/20">
                      Day {matchedAsset.dayNumber} · {matchedAsset.platform}
                    </span>
                  )}
                  {isFallback && utmContent && (
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Fallback Mode
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-1">
                  Campaign: <strong className="text-[#171A35]">{matchedCampaign?.name || utmCampaign}</strong>
                  {utmMedium && <span className="text-slate-400"> · Medium: <code>{utmMedium}</code></span>}
                  {utmContent && <span className="text-slate-400"> · Asset Tag: <code>{utmContent}</code></span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {visitRecorded && (
                <span className="text-[11px] font-semibold text-[#168568] bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span>✓</span> Demo Visit Logged
                </span>
              )}
              {matchedAsset && (
                <button
                  type="button"
                  onClick={handleExploreCampaign}
                  className="text-xs font-bold text-[#5145CD] hover:underline"
                >
                  View Connected Asset
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-[#E5E7F0] bg-white shadow-2xs flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>🌐</span>
              <span>
                <strong>Direct / Organic Access:</strong> Viewing The Growth Marketing Resource Center.
              </span>
            </div>
            {matchedCampaign && (
              <button
                type="button"
                onClick={handleExploreCampaign}
                className="text-[#5145CD] font-bold hover:underline"
              >
                Open Active Campaign ➔
              </button>
            )}
          </div>
        )}

        {/* Clear fallback disclosure banner when utm_content was provided but could not be matched */}
        {isFallback && utmContent && (
          <div className="mt-3 p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900 flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              <strong>Notice:</strong> Specific asset identifier <code>{utmContent}</code> was not found in the active campaign. Showing the general Growth Marketing Playbook.
            </span>
          </div>
        )}
      </div>

      {/* ── DYNAMIC HERO SECTION (Matched to Asset & CTA) ─────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-3xl">
          {/* Contextual Asset Label */}
          {matchedAsset ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EAE7FF] px-3.5 py-1 text-xs font-bold text-[#5145CD] mb-4 border border-[#5145CD]/20">
              <span>{template.icon}</span>
              <span>Day {matchedAsset.dayNumber} · {matchedAsset.platform} Resource</span>
              <span className="text-[#5145CD]/40">•</span>
              <span>{template.typeLabel}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-200/80 px-3 py-1 text-xs font-bold text-slate-700 mb-4">
              <span>{template.icon}</span>
              <span>{template.heroEyebrow}</span>
              <span className="text-slate-400">•</span>
              <span>{template.typeLabel}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl font-black text-[#171A35] tracking-tight leading-[1.15]">
            {template.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            {template.subtitle}
          </p>

          {/* Contextual Callout: Originating Promise */}
          {matchedAsset && (
            <div className="mt-6 p-4 rounded-2xl bg-white border border-[#E5E7F0] shadow-xs">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-[#171A35] flex items-center gap-1.5">
                  <span>📍</span> Connected from {matchedAsset.platform} Post
                </span>
                <span className="font-mono text-[10px] text-slate-500 bg-[#F7F7FC] px-2 py-0.5 rounded border border-[#E5E7F0]">
                  Day {matchedAsset.dayNumber} · {matchedAsset.id}
                </span>
              </div>
              <p className="text-xs text-slate-600 italic mb-2.5 border-l-2 border-[#5145CD] pl-2.5">
                "{matchedAsset.hook}"
              </p>
              <div className="text-[11px] font-semibold text-[#5145CD] bg-[#EAE7FF]/70 p-2.5 rounded-xl border border-[#5145CD]/20 flex items-start gap-1.5">
                <span className="shrink-0 text-sm">🎯</span>
                <span><strong>Fulfilled Promise:</strong> {matchedAsset.callToAction}</span>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExploreCampaign}
              className="btn-primary py-2.5 px-5 text-sm font-bold shadow-sm"
            >
              Explore Campaign Workflow ➔
            </button>
            <button
              type="button"
              onClick={handleBackToDashboard}
              className="btn-secondary py-2.5 px-4 text-sm font-semibold"
            >
              Back to ContentBloom AI
            </button>
          </div>
        </div>
      </section>

      {/* ── DEDICATED CONTEXTUAL RESOURCE BODY ───────────────────────────── */}
      {/* 1. Practical Implementation Guide */}
      {template.id === 'playbook_guide' && (
        <section className="bg-white border-y border-[#E5E7F0] py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
              <span className="section-label">
                <span>📘</span> Tactical Milestones
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171A35]">
                4-Phase Campaign Execution Roadmap
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                {template.overview}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {template.milestones.map((m) => (
                <div
                  key={m.phase}
                  className="card border-[#E5E7F0] bg-[#F7F7FC] p-6 hover:border-[#5145CD]/40 hover:bg-white transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[#5145CD] bg-[#EAE7FF] px-2.5 py-0.5 rounded">
                      {m.phase}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      Deliverable
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#171A35]">{m.title}</h3>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E5E7F0] text-xs font-mono font-semibold text-[#5145CD]">
                    ✓ {m.deliverable}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {m.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. Strategic Framework (5-Step Deep Dive) */}
      {template.id === 'framework' && (
        <section className="bg-white border-y border-[#E5E7F0] py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
              <span className="section-label">
                <span>⚡</span> The Core Methodology
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171A35]">
                The 5-Step Content Distribution Framework
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                {template.overview}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {template.steps.map((s) => (
                <div
                  key={s.step}
                  className="card border-[#E5E7F0] bg-[#F7F7FC] p-6 flex flex-col justify-between hover:border-[#5145CD]/40 hover:bg-white transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-black text-[#5145CD] bg-[#EAE7FF] px-2 py-0.5 rounded">
                        STEP {s.step}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {s.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#171A35] leading-tight mb-2">
                      {s.name}
                    </h3>

                    <p className="text-xs font-semibold text-slate-700 mb-2">
                      {s.headline}
                    </p>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {s.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Execution Checklist Criteria */}
      {template.id === 'checklist' && (
        <section className="bg-white border-y border-[#E5E7F0] py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
              <span className="section-label">
                <span>✅</span> Quality Criteria
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171A35]">
                6 Pre-Publishing Verification Standards
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                {template.overview}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {template.criteria.map((c, i) => (
                <div
                  key={c.category}
                  className="card border-[#E5E7F0] bg-[#F7F7FC] p-5 hover:border-emerald-300 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#168568] uppercase tracking-wider">
                      {c.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">#{i + 1}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#171A35]">
                    {c.requirement}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {c.standard}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. 7 High-Leverage Growth Rules */}
      {template.id === 'quick_tips' && (
        <section className="bg-white border-y border-[#E5E7F0] py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
              <span className="section-label">
                <span>💡</span> Tactical Principles
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171A35]">
                7 High-Leverage Multi-Platform Growth Rules
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                {template.overview}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {template.rules.map((r) => (
                <div
                  key={r.num}
                  className="card border-[#E5E7F0] bg-[#F7F7FC] p-5 hover:border-amber-300 hover:bg-white transition-all space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      RULE {r.num}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#171A35] leading-snug">
                    {r.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {r.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Tech Stack & Teardown */}
      {template.id === 'teardown_stack' && (
        <section className="bg-white border-y border-[#E5E7F0] py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
              <span className="section-label">
                <span>🛠️</span> Architecture Breakdown
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171A35]">
                Inside the ContentOps Automation Stack
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                {template.overview}
              </p>
            </div>

            <div className="space-y-4">
              {template.stackLayers.map((layer, idx) => (
                <div
                  key={layer.layer}
                  className="card border-[#E5E7F0] bg-[#F7F7FC] p-5 hover:border-sky-300 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                        LAYER {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-[#171A35]">{layer.layer}</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {layer.function}
                    </p>
                  </div>
                  <div className="shrink-0 p-3 rounded-xl bg-white border border-[#E5E7F0] text-xs font-mono font-bold text-[#5145CD]">
                    ⚙️ {layer.tooling}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. General Playbook Fallback */}
      {template.id === 'general_playbook' && (
        <section className="bg-white border-y border-[#E5E7F0] py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
              <span className="section-label">
                <span>⚡</span> The Core Methodology
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171A35]">
                The 5-Step Campaign Architecture
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Research → Create → Repurpose → Publish → Measure. A repeatable operating system for turning substantive ideas into high-retention distribution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FRAMEWORK_STEPS.map((s) => (
                <div
                  key={s.step}
                  className="card border-[#E5E7F0] bg-[#F7F7FC] p-6 flex flex-col justify-between hover:border-[#5145CD]/40 hover:bg-white transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-black text-[#5145CD] bg-[#EAE7FF] px-2 py-0.5 rounded">
                        STEP {s.step}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {s.tag}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{s.icon}</span>
                      <h3 className="text-base font-bold text-[#171A35] leading-tight">
                        {s.name}
                      </h3>
                    </div>

                    <p className="text-xs font-semibold text-slate-700 mb-2">
                      {s.headline}
                    </p>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {s.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#E5E7F0] text-[11px] text-slate-700">
                    <strong className="text-[#171A35] block mb-0.5 font-semibold">Key Action:</strong>
                    {s.keyAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PLATFORM ROLES & CAMPAIGN OBJECTIVES ──────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div>
          <span className="section-label">
            <span>🎯</span> Platform Specialization
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171A35]">
            How Platforms Serve Different Campaign Objectives
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Never force the same format into every channel. Each platform commands different user mindsets, dwell times, and algorithmic mechanics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLATFORM_ROLES.map((p) => (
            <div
              key={p.platform}
              className="card border-[#E5E7F0] bg-white p-6 shadow-2xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-[#171A35] leading-tight">
                      {p.platform}
                    </h3>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.badgeClass}`}>
                      {p.badge}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <strong className="text-[#171A35] block font-semibold">Primary Objective:</strong>
                  <p className="text-slate-600 leading-relaxed mt-0.5">{p.primaryGoal}</p>
                </div>

                <div>
                  <strong className="text-[#171A35] block font-semibold">Optimal Content Archetype:</strong>
                  <p className="text-slate-600 leading-relaxed mt-0.5">{p.optimalFormat}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F7F7FC] border border-[#E5E7F0] font-mono text-[11px] text-slate-600">
                  ⏰ Optimal Cadence: {p.timing}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRACTICAL CAMPAIGN EXECUTION CHECKLIST ─────────────────────── */}
      <section className="bg-[#171A35] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-[#FF786B] tracking-wider">
                ✓ Assessment & Operations Readiness
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Campaign Manager Pre-Publishing Checklist
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Verify these 6 essential criteria before launching a scheduled 30-day distribution sprint:
              </p>
            </div>

            <div className="space-y-2.5">
              {CHECKLIST_ITEMS.map((item) => (
                <label
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checkedItems[item.id])}
                    onChange={() => { }}
                    className="mt-0.5 h-4 w-4 rounded accent-[#5145CD] cursor-pointer"
                  />
                  <span className={`text-xs sm:text-sm leading-relaxed ${checkedItems[item.id] ? 'text-slate-200' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExploreCampaign}
                className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold bg-[#5145CD] hover:bg-[#4336b8] text-white shadow-md"
              >
                Open Campaign Manager ➔
              </button>
              <button
                type="button"
                onClick={handleBackToDashboard}
                className="btn-secondary py-2.5 px-4 text-xs sm:text-sm bg-transparent text-white border-slate-700 hover:bg-slate-800"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER & HONEST DEMO NOTICE ─────────────────────────────────── */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-[#E5E7F0] text-center text-xs text-slate-400 space-y-2">
        <p>
          © 2026 ContentBloom AI · Built for the IncuBrix Product Development Challenge.
        </p>
        <p className="text-[11px] text-slate-400 max-w-xl mx-auto leading-relaxed">
          <strong>Demo Telemetry Disclosure:</strong> Visit attribution on this page is logged client-side in browser storage (<code>contentbloom_demo_visits_v1</code>) for challenge evaluation. No external network requests or third-party trackers are utilized.
        </p>
      </footer>
    </div>
  )
}
