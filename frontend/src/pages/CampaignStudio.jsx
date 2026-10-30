import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  addCampaignAsset,
  updateCampaignAsset,
  removeCampaignAsset,
  updateAssetStatus,
  getCampaignStats,
  calculateScheduledDate,
  buildUtmUrl,
  buildCohesiveCampaignAssets,
  initializeDemoCampaign,
  getDefaultDestinationUrl,
  isRegisteredDestination,
  getCampaignVisitStats,
  CAMPAIGN_STATUSES,
  THEME_PILLARS,
  PLATFORM_OPTIMAL_TIMES,
} from '../utils/campaignStorage'
import { runCampaignAudit, PLATFORM_LIMITS } from '../utils/qualityAudit'
import { generateCampaignCsv, downloadCsvFile } from '../utils/csvExporter'
import { saveContentHistory } from '../utils/contentHistory'

const CAMPAIGN_GOALS = [
  { id: 'lead_gen', label: 'Lead Generation & Demos', icon: '🎯' },
  { id: 'brand_awareness', label: 'Brand Awareness & Reach', icon: '📢' },
  { id: 'product_launch', label: 'Product Launch & Features', icon: '🚀' },
  { id: 'thought_leadership', label: 'Founder Authority & Trust', icon: '👑' },
]

export default function CampaignStudio() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Storage and Campaign Selection State
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Tab State: 'overview' | 'calendar' | 'assets' | 'audit'
  const initialTab = searchParams.get('tab') || 'overview'
  const [activeTab, setActiveTab] = useState(
    ['overview', 'calendar', 'assets', 'audit'].includes(initialTab) ? initialTab : 'overview'
  )

  // Filters State
  const [selectedPlatform, setSelectedPlatform] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedWeek, setSelectedWeek] = useState('ALL')

  // Active Asset & Editor Modal/Drawer State
  const [activeAssetId, setActiveAssetId] = useState(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  // Quality Audit State
  const [auditResult, setAuditResult] = useState(null)
  const [auditSeed, setAuditSeed] = useState(42)

  // Form State for Creating New Campaign
  const [formName, setFormName] = useState('')
  const [formTopic, setFormTopic] = useState('')
  const [formAudience, setFormAudience] = useState('Founders, Creators, & Growth Teams')
  const [formGoal, setFormGoal] = useState('lead_gen')
  const [formDuration, setFormDuration] = useState(30)
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [formDestinationUrl, setFormDestinationUrl] = useState(getDefaultDestinationUrl())
  const [formCampaignSlug, setFormCampaignSlug] = useState('incubrix-30day-sprint')

  // Feedback notifications
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [copiedKey, setCopiedKey] = useState('')

  // Load campaigns from storage
  function refreshCampaigns(targetId = null) {
    const list = getCampaigns()
    setCampaigns(list)
    if (list.length > 0) {
      if (targetId && list.some((c) => c.id === targetId)) {
        setSelectedCampaignId(targetId)
      } else if (!selectedCampaignId || !list.some((c) => c.id === selectedCampaignId)) {
        setSelectedCampaignId(list[0].id)
      }
    } else {
      setSelectedCampaignId(null)
    }
  }

  useEffect(() => {
    const list = getCampaigns()
    setCampaigns(list)

    const urlCampaignId = searchParams.get('campaignId')
    const urlCreate = searchParams.get('create') === 'true'
    const urlAssetId = searchParams.get('assetId')
    const urlTab = searchParams.get('tab')

    if (urlTab && ['overview', 'calendar', 'assets', 'audit'].includes(urlTab)) {
      setActiveTab(urlTab)
    }

    if (urlCreate) {
      setIsCreatingNew(true)
    } else if (urlCampaignId && list.some((c) => c.id === urlCampaignId)) {
      setSelectedCampaignId(urlCampaignId)
    } else if (list.length > 0) {
      setSelectedCampaignId(list[0].id)
    }

    if (urlAssetId) {
      setActiveAssetId(urlAssetId)
      setIsEditorOpen(true)
    }

    if (location.state?.topic) {
      setFormTopic(location.state.topic)
      setIsCreatingNew(true)
    }
    if (location.state?.targetAudience) {
      setFormAudience(location.state.targetAudience)
    }
    if (location.state?.name) {
      setFormName(location.state.name)
    }
  }, [searchParams, location.state])

  // Active Campaign Object
  const activeCampaign = useMemo(() => {
    if (!selectedCampaignId) return campaigns[0] || null
    return campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0] || null
  }, [campaigns, selectedCampaignId])

  // Campaign Statistics
  const stats = useMemo(() => {
    return getCampaignStats(activeCampaign)
  }, [activeCampaign])

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    if (!activeCampaign || !Array.isArray(activeCampaign.assets)) return []
    return activeCampaign.assets.filter((asset) => {
      if (selectedPlatform !== 'ALL' && asset.platform !== selectedPlatform) return false
      if (selectedStatus !== 'ALL' && asset.status !== selectedStatus) return false
      if (selectedWeek !== 'ALL') {
        const weekNum = Math.ceil((asset.dayNumber || 1) / 7)
        if (`Week ${weekNum}` !== selectedWeek) return false
      }
      return true
    })
  }, [activeCampaign, selectedPlatform, selectedStatus, selectedWeek])

  // Active Asset for Editor
  const activeAsset = useMemo(() => {
    if (!activeCampaign || !activeCampaign.assets?.length) return null
    return activeCampaign.assets.find((a) => a.id === activeAssetId) || activeCampaign.assets[0]
  }, [activeCampaign, activeAssetId])

  // Automatically run Quality Audit when audit tab is clicked if not yet run
  useEffect(() => {
    if (activeTab === 'audit' && activeCampaign && !auditResult) {
      const res = runCampaignAudit(activeCampaign, 20, auditSeed)
      setAuditResult(res)
    }
  }, [activeTab, activeCampaign, auditResult, auditSeed])

  // Create Campaign Action
  function handleCreateCampaign(e) {
    e.preventDefault()
    if (!formTopic.trim() || !formName.trim()) {
      setErrorMsg('Please provide a campaign name and topic.')
      return
    }

    const campaignId = `camp_${Date.now().toString(36)}`
    const generatedAssets = buildCohesiveCampaignAssets({
      campaignId,
      name: formName.trim(),
      topic: formTopic.trim(),
      goal: formGoal,
      count: Number(formDuration) || 30,
      startDate: formStartDate,
      destinationUrl: formDestinationUrl.trim(),
      campaignSlug: formCampaignSlug.trim() || 'campaign-2026',
      targetAudience: formAudience.trim(),
    })

    const newCampaign = createCampaign({
      id: campaignId,
      name: formName.trim(),
      topic: formTopic.trim(),
      targetAudience: formAudience.trim(),
      campaignGoal: formGoal,
      startDate: formStartDate,
      durationDays: Number(formDuration) || 30,
      destinationUrl: formDestinationUrl.trim(),
      campaignSlug: formCampaignSlug.trim() || 'campaign-2026',
      assets: generatedAssets,
    })

    saveContentHistory({
      topic: formTopic.trim(),
      isCampaignPackage: true,
      contentType: 'campaign_package',
      campaignName: formName.trim(),
      campaignId: newCampaign.id,
      goal: formGoal,
      assetCount: generatedAssets.length,
      startDate: formStartDate,
      content: `[Campaign Package: ${formName.trim()}]\nGenerated ${generatedAssets.length} publication-ready multi-platform assets with UTM tracking and posting schedule.`,
    })

    refreshCampaigns(newCampaign.id)
    setIsCreatingNew(false)
    setActiveTab('overview')
    setSuccessMsg(`Created campaign "${newCampaign.name}" with ${generatedAssets.length} scheduled assets!`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Load Demo Campaign
  function handleLoadDemo() {
    const demo = initializeDemoCampaign()
    refreshCampaigns(demo.id)
    setIsCreatingNew(false)
    setActiveTab('overview')
    setSuccessMsg(`Loaded IncuBrix Demo Campaign with 30 scheduled assets, 5 graphics, and 10 videos!`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Delete Campaign Action
  function handleDeleteCampaign() {
    if (!activeCampaign) return
    const name = activeCampaign.name
    deleteCampaign(activeCampaign.id)
    setShowDeleteModal(false)
    refreshCampaigns()
    setSuccessMsg(`Deleted campaign "${name}".`)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // Update Asset Field
  function handleAssetFieldChange(field, value) {
    if (!activeCampaign || !activeAsset) return
    const updated = updateCampaignAsset(activeCampaign.id, activeAsset.id, { [field]: value })
    if (updated) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === activeCampaign.id
            ? { ...c, assets: c.assets.map((a) => (a.id === activeAsset.id ? updated : a)) }
            : c
        )
      )
    }
  }

  // Update Asset Status
  function handleStatusChange(status) {
    if (!activeCampaign || !activeAsset) return
    const updated = updateAssetStatus(activeCampaign.id, activeAsset.id, status)
    if (updated) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === activeCampaign.id
            ? { ...c, assets: c.assets.map((a) => (a.id === activeAsset.id ? updated : a)) }
            : c
        )
      )
      setSuccessMsg(`Asset ${activeAsset.id} marked as ${status}!`)
      setTimeout(() => setSuccessMsg(''), 2500)
    }
  }

  // Remove Single Asset
  function handleRemoveAsset(assetId) {
    if (!activeCampaign) return
    if (!window.confirm(`Are you sure you want to remove asset ${assetId}?`)) return
    removeCampaignAsset(activeCampaign.id, assetId)
    const updatedCamp = getCampaignById(activeCampaign.id)
    setCampaigns((prev) => prev.map((c) => (c.id === activeCampaign.id ? updatedCamp : c)))
    if (updatedCamp.assets.length > 0) {
      setActiveAssetId(updatedCamp.assets[0].id)
    }
    setSuccessMsg(`Removed asset ${assetId}.`)
    setTimeout(() => setSuccessMsg(''), 2500)
  }

  // Add Asset to Campaign
  function handleAddAsset() {
    if (!activeCampaign) return
    const nextDay = activeCampaign.assets.length + 1
    const newAsset = addCampaignAsset(activeCampaign.id, {
      dayNumber: nextDay,
      platform: 'LinkedIn',
      contentType: 'Thought Leadership Breakdown',
      title: `Day ${nextDay}: New Strategy Asset`,
      hook: `Strategy Breakdown: High-leverage execution tactics for Day ${nextDay}.`,
      caption: `Here is how to optimize execution in 3 actionable steps:\n1. Standardize.\n2. Repurpose.\n3. Automate.`,
      callToAction: `Check out the complete resource link below.`,
      scheduledTime: '09:00 AM EST',
      status: 'Draft',
    })
    const updatedCamp = getCampaignById(activeCampaign.id)
    setCampaigns((prev) => prev.map((c) => (c.id === activeCampaign.id ? updatedCamp : c)))
    setActiveAssetId(newAsset.id)
    setIsEditorOpen(true)
    setSuccessMsg(`Added Day ${nextDay} asset!`)
    setTimeout(() => setSuccessMsg(''), 2500)
  }

  // Export CSV
  function handleExportCsv() {
    if (!activeCampaign || !activeCampaign.assets?.length) return
    const csvContent = generateCampaignCsv(activeCampaign)
    const filename = `contentbloom_${activeCampaign.campaignSlug || 'campaign'}_calendar.csv`
    downloadCsvFile(csvContent, filename)
    setSuccessMsg(`Exported scheduler-ready CSV (${activeCampaign.assets.length} rows) as ${filename}!`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Run Quality Audit
  function handleRunAudit() {
    if (!activeCampaign || !activeCampaign.assets?.length) return
    const nextSeed = auditSeed + 1
    setAuditSeed(nextSeed)
    const result = runCampaignAudit(activeCampaign, 20, nextSeed)
    setAuditResult(result)
    setActiveTab('audit')
    setSuccessMsg(`Quality audit complete on 20 sampled assets! Pass Rate: ${result.passRate}%`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Copy helper
  async function handleCopy(text, key) {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 2000)
    } catch {
      // Fallback
    }
  }

  // Open asset editor modal/drawer
  function openAssetEditor(asset) {
    setActiveAssetId(asset.id)
    setIsEditorOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ── Top Header & Campaign Selector Bar ─────────────────────────── */}
      <div className="card border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Campaign:
            </span>

            {campaigns.length > 0 ? (
              <select
                value={selectedCampaignId || ''}
                onChange={(e) => {
                  setSelectedCampaignId(e.target.value)
                  setIsCreatingNew(false)
                }}
                className="input-field py-1.5 px-3 text-xs sm:text-sm font-bold max-w-sm"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.assets?.length || 0} Assets)
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-400 font-medium">No campaigns created yet</span>
            )}

            <button
              type="button"
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="btn-primary text-xs py-1.5 px-3 font-bold"
            >
              {isCreatingNew ? '← Back to Active Campaign' : '➕ Create New Campaign'}
            </button>

            {campaigns.length === 0 && (
              <button
                type="button"
                onClick={handleLoadDemo}
                className="btn-secondary text-xs py-1.5 px-3 border-bloom-300 text-bloom-700 font-bold"
              >
                ⚡ Load Demo Campaign
              </button>
            )}
          </div>

          {activeCampaign && !isCreatingNew && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="btn-secondary text-xs py-1.5 px-3 font-bold border-slate-300 text-slate-700"
                title="Download CSV for Social Schedulers"
              >
                ⬇ Export CSV
              </button>

              <button
                type="button"
                onClick={handleRunAudit}
                className="btn-secondary text-xs py-1.5 px-3 font-bold border-bloom-300 text-bloom-700 bg-bloom-50/70"
                title="Run Deterministic 20-Sample Quality Audit"
              >
                🔍 Audit Quality
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Campaign"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Feedback Notifications ─────────────────────────────────────── */}
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

      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm text-rose-800 flex items-center justify-between shadow-2xs animate-in fade-in"
        >
          <span>⚠️ {errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-rose-700 hover:text-rose-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── CREATE CAMPAIGN FORM ────────────────────────────────────────── */}
      {isCreatingNew ? (
        <form onSubmit={handleCreateCampaign} className="card border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="section-label">
              <span>🚀</span> Campaign Setup Workflow
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Create 30-Day Multi-Platform Campaign
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter your campaign topic, target audience, and campaign goal to generate a complete 30-day schedule across LinkedIn, Instagram, YouTube Shorts, and Twitter/X.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="input-field text-sm"
                placeholder="e.g. IncuBrix AI Content Sprint 2026"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={formAudience}
                onChange={(e) => setFormAudience(e.target.value)}
                className="input-field text-sm"
                placeholder="e.g. B2B Founders, Marketing Leaders, Growth Teams"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Core Campaign Topic / Long-Form Source Content
            </label>
            <textarea
              rows={4}
              value={formTopic}
              onChange={(e) => setFormTopic(e.target.value)}
              className="input-field text-sm leading-relaxed"
              placeholder="Paste your source idea, article excerpt, product value proposition, or launch announcement..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Objective
              </label>
              <select
                value={formGoal}
                onChange={(e) => setFormGoal(e.target.value)}
                className="input-field text-xs"
              >
                {CAMPAIGN_GOALS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.icon} {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Schedule Duration
              </label>
              <select
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value))}
                className="input-field text-xs"
              >
                <option value={30}>30 Days (Full Month Sprint)</option>
                <option value={14}>14 Days (Bi-weekly Sprint)</option>
                <option value={7}>7 Days (1-Week Launch)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Campaign Start Date
              </label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="input-field text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                UTM Campaign Slug
              </label>
              <input
                type="text"
                value={formCampaignSlug}
                onChange={(e) => setFormCampaignSlug(e.target.value)}
                className="input-field text-xs font-mono"
                placeholder="incubrix-30day"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Destination URL (For UTM Generation)
              </label>
              <button
                type="button"
                onClick={() => setFormDestinationUrl(getDefaultDestinationUrl())}
                className="text-[11px] font-semibold text-bloom-600 hover:text-bloom-700"
              >
                Reset to Connected Resource Page
              </button>
            </div>
            <input
              type="url"
              value={formDestinationUrl}
              onChange={(e) => setFormDestinationUrl(e.target.value)}
              className="input-field text-xs font-mono"
              placeholder={getDefaultDestinationUrl()}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Connected internal landing page: <code>/resources/growth-playbook</code>.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <button
              type="submit"
              className="btn-primary flex-1 py-3 text-sm justify-center font-bold shadow-md"
            >
              🚀 Generate {formDuration}-Asset Cohesive Campaign Schedule
            </button>
            {campaigns.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="btn-secondary py-3 px-6 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : activeCampaign ? (
        <>
          {/* ── CAMPAIGN HERO & PROGRESS BANNER ──────────────────────────── */}
          <div className="card bg-gradient-to-r from-slate-900 via-slate-950 to-bloom-950 text-white border-slate-800 shadow-md p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono bg-bloom-500 text-slate-950 font-black px-2 py-0.5 rounded">
                    {stats.total} ASSETS SCHEDULED
                  </span>
                  <span className="text-xs text-slate-300">
                    Starts: <strong className="text-white font-mono">{activeCampaign.startDate}</strong>
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-xs text-slate-300">
                    Slug: <code className="text-bloom-300 font-mono">{activeCampaign.campaignSlug}</code>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {activeCampaign.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-1 max-w-2xl">
                  {activeCampaign.topic}
                </p>
              </div>

              {/* Counts Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-xs text-center shrink-0">
                <div className="px-2">
                  <span className="text-[11px] text-slate-400 block font-medium">Text Drafts</span>
                  <span className="text-lg font-bold text-slate-200">{stats.drafts}</span>
                </div>
                <div className="px-2">
                  <span className="text-[11px] text-slate-400 block font-medium">Approved</span>
                  <span className="text-lg font-bold text-emerald-400">{stats.approved}</span>
                </div>
                <div className="px-2">
                  <span className="text-[11px] text-slate-400 block font-medium">🎨 Graphics</span>
                  <span className="text-lg font-bold text-sky-400">{stats.exportedGraphics}</span>
                </div>
                <div className="px-2">
                  <span className="text-[11px] text-slate-400 block font-medium">🎬 Videos</span>
                  <span className="text-lg font-bold text-rose-400">{stats.exportedVideos}</span>
                </div>
              </div>
            </div>

            {/* Campaign Progress Bar */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2 w-full max-w-md">
                <span className="font-semibold text-slate-400">Approval Progress:</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-bloom-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-white">{stats.completionRate}%</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-300">
                <span>
                  Ready for Review: <strong className="text-white">{stats.readyForReview}</strong>
                </span>
                <span>
                  Scheduled: <strong className="text-white">{stats.scheduled}</strong>
                </span>
                <span>
                  Audience: <strong className="text-white truncate max-w-[140px]">{activeCampaign.targetAudience}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* ── NAVIGATION TABS (Overview, Calendar, Assets, Quality Audit) ─── */}
          <div className="border-b border-slate-200 flex items-center justify-between gap-4 overflow-x-auto pb-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'border-bloom-600 text-bloom-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>📊</span> Overview
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'calendar'
                    ? 'border-bloom-600 text-bloom-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>📅</span> 30-Day Calendar
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('assets')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'assets'
                    ? 'border-bloom-600 text-bloom-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>📋</span> Asset Library ({activeCampaign.assets?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'audit'
                    ? 'border-bloom-600 text-bloom-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>🔍</span> Quality Audit
                {auditResult && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                      auditResult.passRate >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {auditResult.passRate}%
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleAddAsset}
                className="btn-secondary text-xs py-1.5 px-3 font-semibold"
              >
                ➕ Add Asset
              </button>
            </div>
          </div>

          {/* ── TAB 1: OVERVIEW ────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Campaign Strategy & Parameters Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card border-slate-200 p-5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Goal & Positioning
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {CAMPAIGN_GOALS.find((g) => g.id === activeCampaign.campaignGoal)?.label || 'Lead Generation'}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Targeted for <strong>{activeCampaign.targetAudience}</strong>.
                  </p>
                  <div className="text-[11px] font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Destination:</span>
                      {isRegisteredDestination(activeCampaign.destinationUrl) ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          ✓ Verified Route
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">External URL</span>
                      )}
                    </div>
                    <p className="text-[10px] break-all text-slate-800">
                      {activeCampaign.destinationUrl}
                    </p>
                    {isRegisteredDestination(activeCampaign.destinationUrl) && (
                      <Link
                        to="/resources/growth-playbook"
                        className="text-[11px] font-bold text-bloom-600 hover:text-bloom-800 inline-block mt-0.5"
                      >
                        Preview Connected Resource Page ➔
                      </Link>
                    )}
                  </div>
                </div>

                <div className="card border-slate-200 p-5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Distribution Coverage
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    4 Core Social Platforms
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span>💼 LinkedIn (Thought Leadership)</span>
                      <strong className="font-mono">
                        {activeCampaign.assets?.filter((a) => a.platform === 'LinkedIn').length} assets
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>📸 Instagram (Carousel / Card)</span>
                      <strong className="font-mono">
                        {activeCampaign.assets?.filter((a) => a.platform === 'Instagram').length} assets
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>🎬 YouTube Shorts (9:16 Video)</span>
                      <strong className="font-mono">
                        {activeCampaign.assets?.filter((a) => a.platform === 'YouTube Shorts').length} assets
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>🐦 Twitter / X (Framework / Take)</span>
                      <strong className="font-mono">
                        {activeCampaign.assets?.filter((a) => a.platform === 'Twitter / X').length} assets
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="card border-slate-200 p-5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Media Readiness
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Exported Media Assets
                  </h3>
                  <p className="text-xs text-slate-600 mb-3">
                    Branded PNG graphics and browser-rendered WebM motion videos linked directly to schedule.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-sky-50 border border-sky-100">
                      <span className="text-[10px] text-sky-800 font-bold block">🎨 Graphics</span>
                      <strong className="text-sky-900 font-mono text-base">{stats.exportedGraphics}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
                      <span className="text-[10px] text-rose-800 font-bold block">🎬 Videos (≤60s)</span>
                      <strong className="text-rose-900 font-mono text-base">{stats.exportedVideos}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategy Pillars Summary */}
              <div className="card border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Content Pillar Architecture
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  {THEME_PILLARS.slice(0, 4).map((p, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70">
                      <span className="font-bold text-slate-900 block mb-0.5">{p.pillar}</span>
                      <p className="text-slate-500 text-[11px] leading-snug">{p.angle}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions to Calendar / Assets / Audit */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  className="btn-primary text-xs py-2 px-4"
                >
                  📅 Open 30-Day Content Calendar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('assets')}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  📋 View Full Asset Library
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  ⬇ Download Scheduler CSV
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 2: 30-DAY CONTENT CALENDAR ─────────────────────────────── */}
          {activeTab === 'calendar' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Calendar Filter Toolbar */}
              <div className="card border-slate-200 bg-white p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Week filter */}
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-bold mr-1">Week:</span>
                  {['ALL', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'].map((wk) => (
                    <button
                      key={wk}
                      type="button"
                      onClick={() => setSelectedWeek(wk)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedWeek === wk
                          ? 'bg-bloom-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {wk}
                    </button>
                  ))}
                </div>

                {/* Platform Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-bold mr-1">Platform:</span>
                  {['ALL', 'LinkedIn', 'Instagram', 'YouTube Shorts', 'Twitter / X'].map((plt) => (
                    <button
                      key={plt}
                      type="button"
                      onClick={() => setSelectedPlatform(plt)}
                      className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                        selectedPlatform === plt
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {plt}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold">Status:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="input-field py-1 px-2 text-xs"
                  >
                    <option value="ALL">All Statuses</option>
                    {CAMPAIGN_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 30-Day Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {filteredAssets.map((asset) => {
                  const isVideo = asset.platform === 'YouTube Shorts'
                  const isGraphic = asset.platform === 'Instagram' || asset.platform === 'LinkedIn'

                  return (
                    <div
                      key={asset.id}
                      onClick={() => openAssetEditor(asset)}
                      className="card border-slate-200 hover:border-bloom-400 p-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between min-h-[140px] text-left group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-mono text-[10px] font-black text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                            Day {asset.dayNumber}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              asset.platform === 'LinkedIn'
                                ? 'bg-blue-100 text-blue-700'
                                : asset.platform === 'Instagram'
                                ? 'bg-pink-100 text-pink-700'
                                : asset.platform === 'YouTube Shorts'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {asset.platform === 'YouTube Shorts' ? 'Shorts' : asset.platform}
                          </span>
                        </div>

                        <div className="text-[10px] font-mono text-slate-500 mb-1">
                          📅 {asset.scheduledDate} · {asset.scheduledTime}
                        </div>

                        <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-tight group-hover:text-bloom-600 transition-colors">
                          {asset.hook}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        {/* Media Pills */}
                        <div className="flex items-center gap-1">
                          {isGraphic && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                asset.exportedGraphic?.exportedAt
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              🎨 {asset.exportedGraphic?.exportedAt ? 'PNG' : 'PNG?'}
                            </span>
                          )}
                          {isVideo && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                asset.exportedVideo?.exportedAt
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              🎬 {asset.exportedVideo?.exportedAt ? `${asset.exportedVideo.durationSeconds}s` : 'WebM?'}
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-[10px] font-bold ${
                            asset.status === 'Approved'
                              ? 'text-emerald-600'
                              : asset.status === 'Scheduled'
                              ? 'text-blue-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {asset.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── TAB 3: ASSET LIBRARY TABLE ─────────────────────────────────── */}
          {activeTab === 'assets' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Asset Library Table View */}
              <div className="card border-slate-200 bg-white p-0 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Asset Inventory ({filteredAssets.length} Assets)
                    </h3>
                    <p className="text-slate-400 text-[11px]">
                      Complete scheduled social assets with copy, tracking parameters, and media links.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="input-field py-1 px-2 text-xs"
                    >
                      <option value="ALL">All Platforms</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Instagram">Instagram</option>
                      <option value="YouTube Shorts">YouTube Shorts</option>
                      <option value="Twitter / X">Twitter / X</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="btn-secondary text-xs py-1 px-2.5 font-bold"
                    >
                      ⬇ Export CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3">Day / ID</th>
                        <th className="p-3">Platform</th>
                        <th className="p-3">Content Type</th>
                        <th className="p-3">Scheduled Slot</th>
                        <th className="p-3">Hook / Headline</th>
                        <th className="p-3">Media Status</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAssets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-900">
                            Day {asset.dayNumber}
                            <span className="block text-[10px] text-slate-400 font-normal">{asset.id}</span>
                          </td>

                          <td className="p-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                asset.platform === 'LinkedIn'
                                  ? 'bg-blue-100 text-blue-700'
                                  : asset.platform === 'Instagram'
                                  ? 'bg-pink-100 text-pink-700'
                                  : asset.platform === 'YouTube Shorts'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {asset.platform}
                            </span>
                          </td>

                          <td className="p-3 text-slate-600 font-medium">
                            {asset.contentType}
                          </td>

                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {asset.scheduledDate}
                            <span className="block text-[10px] text-slate-400">{asset.scheduledTime}</span>
                          </td>

                          <td className="p-3 max-w-xs">
                            <p className="text-slate-900 font-semibold line-clamp-1 leading-snug">
                              {asset.hook}
                            </p>
                          </td>

                          <td className="p-3">
                            <div className="flex flex-col gap-1">
                              {asset.exportedGraphic?.exportedAt ? (
                                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 inline-flex items-center gap-1">
                                  <span>🎨</span> PNG Exported
                                </span>
                              ) : (
                                (asset.platform === 'Instagram' || asset.platform === 'LinkedIn') && (
                                  <span className="text-[10px] text-slate-400">
                                    Graphic pending
                                  </span>
                                )
                              )}

                              {asset.exportedVideo?.exportedAt ? (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 inline-flex items-center gap-1">
                                  <span>🎬</span> WebM ({asset.exportedVideo.durationSeconds}s)
                                </span>
                              ) : (
                                asset.platform === 'YouTube Shorts' && (
                                  <span className="text-[10px] text-slate-400">
                                    Video pending
                                  </span>
                                )
                              )}
                            </div>
                          </td>

                          <td className="p-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                asset.status === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : asset.status === 'Scheduled'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {asset.status}
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openAssetEditor(asset)}
                                className="btn-secondary text-xs py-1 px-2.5 font-bold"
                              >
                                ✏️ Edit
                              </button>

                              <Link
                                to={`/image-studio?campaignId=${activeCampaign.id}&assetId=${asset.id}`}
                                className="p-1 rounded text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                                title="Open in Image Studio"
                              >
                                🎨
                              </Link>

                              <Link
                                to={`/video-studio?campaignId=${activeCampaign.id}&assetId=${asset.id}`}
                                className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                                title="Open in Video Studio"
                              >
                                🎬
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: QUALITY AUDIT ENGINE ───────────────────────────────── */}
          {activeTab === 'audit' && (
            <div className="space-y-6 animate-in fade-in">
              {auditResult ? (
                <div className="card border-bloom-200 bg-white p-6 shadow-sm space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-bloom-100 text-bloom-700 flex items-center justify-center text-xl font-bold">
                        🔍
                      </div>
                      <div>
                        <h2 className="text-lg font-extrabold text-slate-900">
                          Quality Audit Engine & Compliance Matrix
                        </h2>
                        <p className="text-xs text-slate-500">
                          Evaluated <strong>{auditResult.sampleSize} random assets</strong> from pool of {auditResult.totalEligible} · Target: ≥85%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Deterministic Pass Rate
                        </span>
                        <span
                          className={`text-2xl font-black font-mono ${
                            auditResult.passRate >= 85 ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {auditResult.passRate}%
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleRunAudit}
                        className="btn-primary text-xs py-2 px-3 font-bold"
                      >
                        🔄 Re-evaluate Sample
                      </button>
                    </div>
                  </div>

                  {/* Sample Disclosure & Status */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <p>
                      <strong>Audited Asset IDs:</strong>{' '}
                      <span className="font-mono text-slate-600">
                        {auditResult.selectedAssetIds?.join(', ') || 'None'}
                      </span>
                    </p>
                    <p className="mt-1 text-slate-500">
                      Assessment target: <strong>≥85% pass rate</strong>. Scores are evaluated against transparent criteria: Hook strength, Platform formatting, CTA presence, UTM compliance, and Character boundaries.
                    </p>
                  </div>

                  {/* Rules Pass Rates Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {Object.entries(auditResult.rulePassRates || {}).map(([ruleKey, rate]) => (
                      <div key={ruleKey} className="p-3 rounded-xl border border-slate-100 bg-slate-50/80 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">
                          {ruleKey.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`text-base font-black font-mono ${
                            rate >= 85 ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {rate}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Per-Asset Audit Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <div className="max-h-80 overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 sticky top-0 text-[10px] font-bold text-slate-600 uppercase">
                          <tr>
                            <th className="p-2.5">Asset</th>
                            <th className="p-2.5">Platform</th>
                            <th className="p-2.5">Result</th>
                            <th className="p-2.5">Evaluated Rules & Checks</th>
                            <th className="p-2.5">Media Readiness</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {auditResult.results?.map((res) => (
                            <tr
                              key={res.assetId}
                              onClick={() => {
                                const matched = activeCampaign.assets.find((a) => a.id === res.assetId)
                                if (matched) openAssetEditor(matched)
                              }}
                              className="hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                              <td className="p-2.5 font-mono font-bold text-slate-900">{res.assetId}</td>
                              <td className="p-2.5">{res.platform}</td>
                              <td className="p-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                    res.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {res.passed ? 'PASS' : 'FAIL'}
                                </span>
                              </td>
                              <td className="p-2.5 text-slate-600">
                                {res.issues.length === 0 ? (
                                  <span className="text-emerald-700 font-medium">✓ All checks passed</span>
                                ) : (
                                  res.issues.map((iss, idx) => (
                                    <span key={idx} className="block text-[11px] text-amber-700">
                                      • {iss.rule}: {iss.message}
                                    </span>
                                  ))
                                )}
                              </td>
                              <td className="p-2.5 text-slate-500 font-medium">{res.mediaNote}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {auditResult.recommendations?.length > 0 && (
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <span className="font-bold block mb-1">💡 Actionable Optimization Recommendations:</span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {auditResult.recommendations.slice(0, 4).map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 card border-slate-200">
                  <span className="text-3xl block mb-2">🔍</span>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Quality Audit Not Yet Run
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                    Evaluate 20 random campaign assets against social media and assessment compliance rules.
                  </p>
                  <button
                    type="button"
                    onClick={handleRunAudit}
                    className="btn-primary text-xs py-2 px-4 font-bold"
                  >
                    Run Quality Audit (20 Assets)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── ASSET EDITOR MODAL / DRAWER ──────────────────────────────── */}
          {isEditorOpen && activeAsset && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
              <div className="card bg-white max-w-2xl w-full border-slate-200 p-6 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {activeAsset.id}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Day {activeAsset.dayNumber} · {activeAsset.platform}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {activeAsset.scheduledDate} · {activeAsset.scheduledTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `${activeAsset.hook}\n\n${activeAsset.caption}\n\n${activeAsset.callToAction}\n\nLink: ${activeAsset.utmUrl}\n\n${activeAsset.hashtags}`,
                          `active-${activeAsset.id}`
                        )
                      }
                      className="btn-secondary text-xs py-1 px-2.5"
                    >
                      {copiedKey === `active-${activeAsset.id}` ? '✓ Copied' : '📋 Copy All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditorOpen(false)}
                      className="text-slate-400 hover:text-slate-600 font-bold p-1 text-base"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Status & Schedule Controls */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Workflow Status
                    </label>
                    <select
                      value={activeAsset.status || 'Draft'}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="input-field py-1 px-2 text-xs font-semibold"
                    >
                      {CAMPAIGN_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      value={activeAsset.scheduledDate || ''}
                      onChange={(e) => handleAssetFieldChange('scheduledDate', e.target.value)}
                      className="input-field py-1 px-2 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Studio Tools Integration Box */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-bloom-50 via-sky-50 to-purple-50 border border-bloom-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-700 block tracking-wider">
                    Supporting Studio Actions
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/image-studio?campaignId=${activeCampaign.id}&assetId=${activeAsset.id}`}
                      className="btn-secondary text-xs py-2 px-3 justify-center bg-white font-bold border-sky-300 text-sky-800 shadow-2xs hover:bg-sky-50"
                    >
                      <span>🎨</span> Create Graphic (PNG)
                    </Link>

                    <Link
                      to={`/video-studio?campaignId=${activeCampaign.id}&assetId=${activeAsset.id}`}
                      className="btn-secondary text-xs py-2 px-3 justify-center bg-white font-bold border-rose-300 text-rose-800 shadow-2xs hover:bg-rose-50"
                    >
                      <span>🎬</span> Create Video (WebM ≤60s)
                    </Link>
                  </div>

                  {/* Exported Status Display */}
                  <div className="text-xs pt-1 space-y-1">
                    {activeAsset.exportedGraphic?.exportedAt && (
                      <div className="p-1.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[11px] flex items-center justify-between">
                        <span>✓ Graphic: {activeAsset.exportedGraphic.filename}</span>
                        <span className="text-[10px] text-emerald-700">PNG</span>
                      </div>
                    )}
                    {activeAsset.exportedVideo?.exportedAt && (
                      <div className="p-1.5 rounded bg-rose-100 text-rose-900 font-mono text-[11px] flex items-center justify-between">
                        <span>✓ Video: {activeAsset.exportedVideo.durationSeconds}s ({activeAsset.exportedVideo.filename})</span>
                        <span className="text-[10px] text-rose-700">WebM</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hook / Headline */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Opening Hook / Headline
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {activeAsset.hook?.length || 0} chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={activeAsset.hook || ''}
                    onChange={(e) => handleAssetFieldChange('hook', e.target.value)}
                    className="input-field text-xs font-semibold leading-relaxed"
                  />
                </div>

                {/* Caption */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Caption Copy
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {activeAsset.caption?.length || 0} chars (Max: {PLATFORM_LIMITS[activeAsset.platform]?.maxCaption || 3000})
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={activeAsset.caption || ''}
                    onChange={(e) => handleAssetFieldChange('caption', e.target.value)}
                    className="input-field text-xs leading-relaxed"
                  />
                </div>

                {/* Script / Body */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                    Scene Script / Slide Structure
                  </span>
                  <textarea
                    rows={3}
                    value={activeAsset.body || ''}
                    onChange={(e) => handleAssetFieldChange('body', e.target.value)}
                    className="input-field text-xs font-mono leading-relaxed"
                  />
                </div>

                {/* CTA & Hashtags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      Call To Action (CTA)
                    </span>
                    <input
                      type="text"
                      value={activeAsset.callToAction || activeAsset.cta || ''}
                      onChange={(e) => handleAssetFieldChange('callToAction', e.target.value)}
                      className="input-field text-xs"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      Hashtags
                    </span>
                    <input
                      type="text"
                      value={activeAsset.hashtags || ''}
                      onChange={(e) => handleAssetFieldChange('hashtags', e.target.value)}
                      className="input-field text-xs font-mono"
                    />
                  </div>
                </div>

                {/* UTM Tracking Link */}
                {(() => {
                  const currentUtm = activeAsset.utmUrl || activeAsset.utmLink || ''
                  const isVerified = isRegisteredDestination(currentUtm)
                  const assetVisits = getCampaignVisitStats(activeAsset.id)

                  return (
                    <div className={`p-3 rounded-xl border ${isVerified ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <span className={`text-[10px] uppercase font-bold flex items-center gap-1 ${isVerified ? 'text-emerald-800' : 'text-slate-600'}`}>
                          {isVerified ? (
                            <>
                              <span>✓</span>
                              <span>Verified Destination & UTM Tracking URL</span>
                            </>
                          ) : (
                            <span>Campaign Destination URL (External / Unregistered)</span>
                          )}
                        </span>

                        <div className="flex items-center gap-2">
                          {currentUtm && (
                            <a
                              href={currentUtm}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-bloom-600 hover:text-bloom-800 hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>Open Destination</span>
                              <span>↗</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopy(currentUtm, `utm-${activeAsset.id}`)}
                            className="text-xs font-bold text-bloom-600 hover:text-bloom-700"
                          >
                            {copiedKey === `utm-${activeAsset.id}` ? '✓ Copied' : 'Copy URL'}
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] font-mono text-slate-700 break-all select-all">
                        {currentUtm || 'No tracking URL configured'}
                      </p>

                      {assetVisits.totalVisits > 0 && (
                        <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[10px] text-emerald-800">
                          <span className="font-semibold">
                            📊 Local Demo Visits Tracked: <strong>{assetVisits.totalVisits}</strong>
                          </span>
                          <span className="text-emerald-700 font-mono">
                            Last visit: {new Date(assetVisits.lastVisitAt).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })()}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-16 card border-slate-200 bg-white shadow-2xs">
          <span className="text-4xl block mb-3">🚀</span>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Campaigns Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Create your first 30-day campaign package to plan, schedule, and cross-link multi-platform assets.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className="btn-primary text-xs sm:text-sm py-2 px-4"
            >
              ➕ Create First Campaign
            </button>
            <button
              type="button"
              onClick={handleLoadDemo}
              className="btn-secondary text-xs sm:text-sm py-2 px-4 border-bloom-300 text-bloom-700 font-bold"
            >
              ⚡ Load IncuBrix Demo Campaign
            </button>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ───────────────────────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="card bg-white max-w-md w-full border-slate-200 p-6 shadow-2xl animate-in fade-in space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Delete Campaign?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong>"{activeCampaign?.name}"</strong>? All {activeCampaign?.assets?.length || 0} scheduled assets and export associations will be permanently removed.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCampaign}
                className="btn-primary bg-rose-600 hover:bg-rose-700 text-white text-xs py-2 px-4 font-bold"
              >
                Delete Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
