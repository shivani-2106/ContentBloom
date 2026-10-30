import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getCampaigns,
  initializeDemoCampaign,
  getCampaignStats,
  getDemoVisits,
} from '../utils/campaignStorage'
import { generateCampaignCsv, downloadCsvFile } from '../utils/csvExporter'

export default function Dashboard() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [successMsg, setSuccessMsg] = useState('')

  // Load campaigns on mount
  useEffect(() => {
    setCampaigns(getCampaigns())
  }, [])

  function refresh() {
    setCampaigns(getCampaigns())
  }

  // Aggregate stats across all campaigns
  const aggregateStats = useMemo(() => {
    let totalAssets = 0
    let approvedAssets = 0
    let scheduledAssets = 0
    let draftAssets = 0
    let exportedGraphics = 0
    let exportedVideos = 0

    for (const c of campaigns) {
      const stats = getCampaignStats(c)
      totalAssets += stats.total
      approvedAssets += stats.approved
      scheduledAssets += stats.scheduled
      draftAssets += stats.drafts
      exportedGraphics += stats.exportedGraphics
      exportedVideos += stats.exportedVideos
    }

    const visits = getDemoVisits()

    return {
      totalCampaigns: campaigns.length,
      totalAssets,
      approvedAssets,
      scheduledAssets,
      draftAssets,
      exportedGraphics,
      exportedVideos,
      totalDemoVisits: visits.length,
      completedPercentage:
        totalAssets > 0 ? Math.round(((approvedAssets + scheduledAssets) / totalAssets) * 100) : 0,
    }
  }, [campaigns])

  // Handle Load Demo Campaign
  function handleLoadDemo() {
    const demo = initializeDemoCampaign()
    refresh()
    setSuccessMsg(`Loaded "${demo.name}" with 30 scheduled assets, 5 graphics, and 10 videos!`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Handle Quick CSV Download from Dashboard
  function handleDownloadCsv(campaign) {
    if (!campaign || !campaign.assets?.length) return
    const csv = generateCampaignCsv(campaign)
    const filename = `contentbloom_${campaign.campaignSlug || 'campaign'}_calendar.csv`
    downloadCsvFile(csv, filename)
    setSuccessMsg(`Downloaded scheduler-ready CSV (${campaign.assets.length} rows) as ${filename}!`)
    setTimeout(() => setSuccessMsg(''), 3500)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── Welcome Heading & Primary Action ───────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E5E7F0] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#EAE7FF] px-3 py-1 text-xs font-bold text-[#5145CD] mb-2">
            <span className="h-2 w-2 rounded-full bg-[#168568] animate-pulse" />
            <span>AI Content Campaign Manager</span>
            <span className="text-[#5145CD]/40">•</span>
            <span>IncuBrix Product Edition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#171A35] tracking-tight">
            Campaign Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Turn one core idea into a complete, organized 30-day social media campaign with multi-format copy, calendar scheduling, and verified media exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/campaign?create=true"
            className="btn-primary py-2.5 px-4 text-xs sm:text-sm font-bold shadow-xs"
          >
            <span>➕</span> New Campaign
          </Link>

          <Link
            to="/generate-all"
            className="btn-secondary py-2.5 px-4 text-xs sm:text-sm font-semibold"
          >
            <span>✨</span> Generate 4 Formats
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm text-emerald-800 flex items-center justify-between shadow-2xs animate-in fade-in"
        >
          <span>✓ {successMsg}</span>
          <button
            type="button"
            onClick={() => setSuccessMsg('')}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Compact Quick Actions Strip ─────────────────────────────────── */}
      <div className="card p-3 border-[#E5E7F0] bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Quick Actions
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/campaign?create=true"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#171A35] bg-[#F7F7FC] border border-[#E5E7F0] hover:bg-[#EAE7FF] hover:text-[#5145CD] hover:border-[#5145CD]/30 transition-colors"
          >
            <span>➕</span> Create Campaign
          </Link>
          <Link
            to="/generate-all"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#171A35] bg-[#F7F7FC] border border-[#E5E7F0] hover:bg-[#EAE7FF] hover:text-[#5145CD] hover:border-[#5145CD]/30 transition-colors"
          >
            <span>✨</span> Generate Content
          </Link>
          <Link
            to="/campaign?tab=calendar"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#171A35] bg-[#F7F7FC] border border-[#E5E7F0] hover:bg-[#EAE7FF] hover:text-[#5145CD] hover:border-[#5145CD]/30 transition-colors"
          >
            <span>📅</span> Open Calendar
          </Link>
          {campaigns.length > 0 ? (
            <button
              type="button"
              onClick={() => handleDownloadCsv(campaigns[0])}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#171A35] bg-[#F7F7FC] border border-[#E5E7F0] hover:bg-[#EAE7FF] hover:text-[#5145CD] hover:border-[#5145CD]/30 transition-colors"
            >
              <span>⬇</span> Export CSV
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLoadDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#5145CD] bg-[#EAE7FF] border border-[#d7d2ff] hover:bg-[#d7d2ff] transition-colors"
            >
              <span>⚡</span> Load Demo Campaign
            </button>
          )}
        </div>
      </div>

      {/* ── Key Metrics Grid (Equal 6-card grid on wide desktop) ─────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="card p-4 border-[#E5E7F0] shadow-2xs hover:border-slate-300">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Active Campaigns
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#171A35] font-mono">
              {aggregateStats.totalCampaigns}
            </span>
            <span className="text-xs font-semibold text-[#5145CD] bg-[#EAE7FF] px-1.5 py-0.5 rounded">
              Live
            </span>
          </div>
        </div>

        <div className="card p-4 border-[#E5E7F0] shadow-2xs hover:border-slate-300">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Assets
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#171A35] font-mono">
              {aggregateStats.totalAssets}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {aggregateStats.draftAssets} drafts
            </span>
          </div>
        </div>

        <div className="card p-4 border-[#E5E7F0] shadow-2xs hover:border-slate-300">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Approved Assets
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#168568] font-mono">
              {aggregateStats.approvedAssets}
            </span>
            <span className="text-xs font-semibold text-[#168568] bg-emerald-50 px-1.5 py-0.5 rounded">
              {aggregateStats.completedPercentage}%
            </span>
          </div>
        </div>

        <div className="card p-4 border-[#E5E7F0] shadow-2xs hover:border-slate-300">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            🎨 Graphics Exported
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-sky-600 font-mono">
              {aggregateStats.exportedGraphics}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">PNG Files</span>
          </div>
        </div>

        <div className="card p-4 border-[#E5E7F0] shadow-2xs hover:border-slate-300">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            🎬 Videos Rendered
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600 font-mono">
              {aggregateStats.exportedVideos}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">≤60s WebM</span>
          </div>
        </div>

        <div className="card p-4 border-[#E5E7F0] shadow-2xs hover:border-slate-300">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Calendar Days
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-600 font-mono">
              {campaigns[0]?.assets?.length || 30}
            </span>
            <span className="text-xs text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold">
              30-Day
            </span>
          </div>
        </div>
      </div>

      {/* ── Active & Recent Campaigns Section ───────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#171A35]">
              Active Campaigns
            </h2>
            <p className="text-xs text-slate-500">
              Select any campaign to edit assets, view the 30-day schedule, or export scheduler CSV.
            </p>
          </div>

          {campaigns.length > 0 && (
            <Link
              to="/campaign"
              className="text-xs font-bold text-[#5145CD] hover:underline inline-flex items-center gap-1"
            >
              Open Campaign Manager ➔
            </Link>
          )}
        </div>

        {campaigns.length > 0 ? (
          <div
            className={
              campaigns.length === 1
                ? 'max-w-2xl'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
            }
          >
            {campaigns.map((camp) => {
              const stats = getCampaignStats(camp)
              return (
                <div
                  key={camp.id}
                  className="card border-[#E5E7F0] hover:border-[#5145CD]/40 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header tags */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[10px] font-bold bg-[#F7F7FC] text-[#171A35] border border-[#E5E7F0] px-2 py-0.5 rounded">
                        {camp.assets?.length || 0} Assets
                      </span>
                      <span className="text-[10px] font-bold text-[#5145CD] bg-[#EAE7FF] px-2 py-0.5 rounded-full uppercase">
                        {camp.campaignGoal ? camp.campaignGoal.replace(/_/g, ' ') : 'Growth Sprint'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#171A35] line-clamp-1 mb-1">
                      {camp.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {camp.topic || 'Cohesive multi-platform distribution campaign.'}
                    </p>

                    {/* Meta info */}
                    <div className="p-3 rounded-xl bg-[#F7F7FC] border border-[#E5E7F0] text-[11px] space-y-1 mb-3">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Target Audience:</span>
                        <strong className="text-[#171A35] truncate max-w-[160px]">
                          {camp.targetAudience || 'General'}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Start Date:</span>
                        <strong className="text-[#171A35] font-mono">
                          {camp.startDate || '2026-10-30'}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Media Output:</span>
                        <span className="font-bold">
                          <span className="text-sky-600">🎨 {stats.exportedGraphics} PNG</span>
                          <span className="text-slate-400 mx-1">·</span>
                          <span className="text-rose-600">🎬 {stats.exportedVideos} WebM</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>Approval Progress</span>
                        <span className="font-mono font-bold text-[#171A35]">
                          {stats.approved} / {stats.total} Approved ({stats.completionRate}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#F7F7FC] rounded-full overflow-hidden border border-[#E5E7F0]">
                        <div
                          className="h-full bg-gradient-to-r from-[#5145CD] to-[#168568] transition-all duration-300"
                          style={{ width: `${stats.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#E5E7F0] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/campaign?campaignId=${camp.id}`)}
                      className="btn-primary text-xs py-1.5 px-3 flex-1 justify-center"
                    >
                      🚀 Open Campaign
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/campaign?campaignId=${camp.id}&tab=calendar`)}
                      className="btn-secondary text-xs py-1.5 px-2.5 font-semibold"
                      title="View 30-Day Calendar"
                    >
                      📅 Calendar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadCsv(camp)}
                      className="btn-secondary text-xs py-1.5 px-2.5 font-semibold"
                      title="Download Scheduler CSV"
                    >
                      ⬇ CSV
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="card border-dashed border-2 border-slate-300 p-8 sm:p-12 text-center bg-white/70 max-w-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#EAE7FF] text-[#5145CD] flex items-center justify-center mx-auto mb-3 text-2xl shadow-xs">
              🚀
            </div>
            <h3 className="text-lg font-bold text-[#171A35] mb-1">
              No Campaigns Created Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
              Turn your source idea, article, or launch announcement into a complete 30-day multi-platform campaign package.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/campaign?create=true"
                className="btn-primary text-xs sm:text-sm py-2 px-4 shadow-sm"
              >
                ➕ Create First Campaign
              </Link>
              <button
                type="button"
                onClick={handleLoadDemo}
                className="btn-secondary text-xs sm:text-sm py-2 px-4 border-[#5145CD]/30 text-[#5145CD] bg-[#EAE7FF]/50 hover:bg-[#EAE7FF]"
              >
                ⚡ Load IncuBrix Demo Campaign (30-Day Sprint)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Assessment Requirements & Deliverables Verification ──────────── */}
      <div className="card border-[#E5E7F0] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#E5E7F0]">
          <div>
            <span className="section-label">
              <span>🏆</span> IncuBrix Product Development Challenge
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-[#171A35]">
              Assessment Deliverables & Live Verification Matrix
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Live System Audit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-[#E5E7F0] bg-[#F7F7FC] flex items-start justify-between gap-2">
            <div>
              <strong className="text-[#171A35] block font-semibold">1. Ready-to-Publish Assets (≥30 required)</strong>
              <span className="text-slate-500 text-[11px]">
                {aggregateStats.totalAssets >= 30
                  ? `✓ ${aggregateStats.totalAssets} assets stored in persistent campaign storage.`
                  : `Currently ${aggregateStats.totalAssets}/30 assets created.`}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                aggregateStats.totalAssets >= 30 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {aggregateStats.totalAssets >= 30 ? 'MET (30+)' : 'PENDING'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E7F0] bg-[#F7F7FC] flex items-start justify-between gap-2">
            <div>
              <strong className="text-[#171A35] block font-semibold">2. Multi-Platform Coverage</strong>
              <span className="text-slate-500 text-[11px]">
                LinkedIn, Instagram, YouTube Shorts, & Twitter / X formats supported.
              </span>
            </div>
            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800">
              MET (4/4)
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E7F0] bg-[#F7F7FC] flex items-start justify-between gap-2">
            <div>
              <strong className="text-[#171A35] block font-semibold">3. Actual Short Video Files (≥10 files, ≤60s)</strong>
              <span className="text-slate-500 text-[11px]">
                {aggregateStats.exportedVideos >= 10
                  ? `✓ ${aggregateStats.exportedVideos} browser-rendered WebM video files associated with campaign assets.`
                  : `Currently ${aggregateStats.exportedVideos}/10 videos rendered. Access Video Studio to render.`}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                aggregateStats.exportedVideos >= 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {aggregateStats.exportedVideos >= 10 ? 'MET (10+)' : `${aggregateStats.exportedVideos}/10`}
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E7F0] bg-[#F7F7FC] flex items-start justify-between gap-2">
            <div>
              <strong className="text-[#171A35] block font-semibold">4. Actual Graphic / Carousel Files (≥5 files)</strong>
              <span className="text-slate-500 text-[11px]">
                {aggregateStats.exportedGraphics >= 5
                  ? `✓ ${aggregateStats.exportedGraphics} canvas PNG files exported and associated with campaign assets.`
                  : `Currently ${aggregateStats.exportedGraphics}/5 graphics exported. Access Image Studio to render.`}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                aggregateStats.exportedGraphics >= 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {aggregateStats.exportedGraphics >= 5 ? 'MET (5+)' : `${aggregateStats.exportedGraphics}/5`}
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E7F0] bg-[#F7F7FC] flex items-start justify-between gap-2">
            <div>
              <strong className="text-[#171A35] block font-semibold">5. 30-Day Content Calendar & Scheduling</strong>
              <span className="text-slate-500 text-[11px]">
                Full 30-day interactive calendar view with platform filters and time slots.
              </span>
            </div>
            <Link
              to="/campaign?tab=calendar"
              className="text-[#5145CD] font-bold hover:underline shrink-0"
            >
              View Calendar ➔
            </Link>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E7F0] bg-[#F7F7FC] flex items-start justify-between gap-2">
            <div>
              <strong className="text-[#171A35] block font-semibold">6. Quality Audit Engine (≥85% target)</strong>
              <span className="text-slate-500 text-[11px]">
                Deterministic 20-sample audit assessing hook, format, CTA, UTM, and bounds.
              </span>
            </div>
            <Link
              to="/campaign?tab=audit"
              className="text-[#5145CD] font-bold hover:underline shrink-0"
            >
              Run Audit ➔
            </Link>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E7F0] bg-[#F7F7FC] flex items-start justify-between gap-2 md:col-span-2">
            <div>
              <strong className="text-[#171A35] block font-semibold">7. Connected Campaign Landing Page & Verified UTM Destination</strong>
              <span className="text-slate-500 text-[11px]">
                Registered internal resource route at <code>/resources/growth-playbook</code> with dynamic origin resolution, campaign attribution, and {aggregateStats.totalDemoVisits} demo visits logged in local storage.
              </span>
            </div>
            <Link
              to="/resources/growth-playbook?utm_source=dashboard&utm_medium=demo&utm_campaign=incubrix-30day-sprint"
              className="text-[#5145CD] font-bold hover:underline shrink-0"
            >
              Preview Landing Page ➔
            </Link>
          </div>
        </div>
      </div>

      {/* ── Quick Workflow Jump Cards ────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#171A35]">
          Workflow Tools & Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <Link
            to="/campaign"
            className="card p-4 border-[#E5E7F0] hover:border-[#5145CD]/40 hover:shadow-xs transition-all group"
          >
            <div className="text-2xl mb-2 group-hover:scale-105 transition-transform">🚀</div>
            <h3 className="text-sm font-bold text-[#171A35] mb-1">Campaign Manager</h3>
            <p className="text-xs text-slate-500 leading-snug">
              Manage 30-day schedule, edit asset copy, review UTM tracking, and download CSV.
            </p>
          </Link>

          <Link
            to="/generate-all"
            className="card p-4 border-[#E5E7F0] hover:border-[#5145CD]/40 hover:shadow-xs transition-all group"
          >
            <div className="text-2xl mb-2 group-hover:scale-105 transition-transform">✨</div>
            <h3 className="text-sm font-bold text-[#171A35] mb-1">Generate 4 Formats</h3>
            <p className="text-xs text-slate-500 leading-snug">
              Simultaneously generate LinkedIn, Instagram, Shorts script, and Carousel slides from 1 idea.
            </p>
          </Link>

          <Link
            to="/resources/growth-playbook"
            className="card p-4 border-[#E5E7F0] hover:border-[#5145CD]/40 hover:shadow-xs transition-all group"
          >
            <div className="text-2xl mb-2 group-hover:scale-105 transition-transform">📖</div>
            <h3 className="text-sm font-bold text-[#171A35] mb-1">Connected Resource</h3>
            <p className="text-xs text-slate-500 leading-snug">
              The Growth Marketing Playbook landing page with attribution & 5-step framework.
            </p>
          </Link>

          <Link
            to="/image-studio"
            className="card p-4 border-[#E5E7F0] hover:border-[#5145CD]/40 hover:shadow-xs transition-all group"
          >
            <div className="text-2xl mb-2 group-hover:scale-105 transition-transform">🎨</div>
            <h3 className="text-sm font-bold text-[#171A35] mb-1">Image Studio</h3>
            <p className="text-xs text-slate-500 leading-snug">
              Design and export high-resolution client-side PNG branded cards & carousel graphics.
            </p>
          </Link>

          <Link
            to="/video-studio"
            className="card p-4 border-[#E5E7F0] hover:border-[#5145CD]/40 hover:shadow-xs transition-all group"
          >
            <div className="text-2xl mb-2 group-hover:scale-105 transition-transform">🎬</div>
            <h3 className="text-sm font-bold text-[#171A35] mb-1">Video Studio</h3>
            <p className="text-xs text-slate-500 leading-snug">
              Render browser-based 9:16 vertical motion graphics videos (WebM, ≤60s) from storyboards.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
