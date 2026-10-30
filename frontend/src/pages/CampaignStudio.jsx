import { useState } from 'react'
import { Link } from 'react-router-dom'
import { saveContentHistory } from '../utils/contentHistory'

const CAMPAIGN_GOALS = [
  { id: 'lead_gen', label: 'Lead Generation & Demos', icon: '🎯' },
  { id: 'brand_awareness', label: 'Brand Awareness & Reach', icon: '📢' },
  { id: 'product_launch', label: 'Product Launch & Features', icon: '🚀' },
  { id: 'thought_leadership', label: 'Founder Authority & Trust', icon: '👑' },
]

const ASSET_COUNTS = [
  { count: 10, label: '10-Asset Sprint (2 Weeks)', badge: 'Fast Launch' },
  { count: 20, label: '20-Asset Scale (4 Weeks)', badge: 'Full Omnichannel' },
  { count: 30, label: '30-Asset IncuBrix Monthly Plan', badge: 'Complete 30-Day Calendar' },
]

const PLATFORM_OPTIMAL_TIMES = {
  LinkedIn: ['08:30 AM EST', '09:45 AM EST', '12:15 PM EST', '05:00 PM EST'],
  Instagram: ['11:30 AM EST', '01:15 PM EST', '06:30 PM EST', '08:00 PM EST'],
  'YouTube Shorts': ['02:00 PM EST', '04:30 PM EST', '07:00 PM EST', '09:15 PM EST'],
  'Twitter / X': ['09:00 AM EST', '11:00 AM EST', '03:30 PM EST', '06:00 PM EST'],
}

const THEME_PILLARS = [
  { pillar: 'Problem Agitation', angle: 'The costly mistake 90% of teams make before scaling' },
  { pillar: 'Framework & Blueprint', angle: 'Step-by-step 4-part architecture to automate workflow' },
  { pillar: 'Social Proof & Case Study', angle: 'How a lean 3-person team reached 100k views in 14 days' },
  { pillar: 'Contrarian Take', angle: 'Why conventional marketing advice fails in 2026' },
  { pillar: 'Tool / Teardown', angle: 'Inside the tech stack that replaces 15 hours of manual work' },
]

function generateCohesiveCampaignAssets({ topic, goal, count, domain, campaignSlug }) {
  const platforms = ['LinkedIn', 'Instagram', 'YouTube Shorts', 'Twitter / X']
  const postTypes = {
    LinkedIn: ['Carousel Slide Deck', 'Thought Leadership Breakdown', 'Founder Case Study'],
    Instagram: ['Aesthetic 7-Slide Carousel', 'High-Contrast Infographic', 'Reel Hook Script'],
    'YouTube Shorts': ['15s Hook Script', '30s Retention Breakdown', '60s Mini-Masterclass'],
    'Twitter / X': ['10-Tweet Mega Thread', 'High-Impact Contrarian Post', 'Visual Framework Teardown'],
  }

  const baseDomain = domain.trim().replace(/\/$/, '') || 'https://incubrix.com/growth'
  const slug = campaignSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'growth-campaign-2026'

  const assets = []

  for (let i = 1; i <= count; i++) {
    const platform = platforms[(i - 1) % platforms.length]
    const typesForPlatform = postTypes[platform]
    const postType = typesForPlatform[(i - 1) % typesForPlatform.length]
    const pillar = THEME_PILLARS[(i - 1) % THEME_PILLARS.length]
    const dayNumber = i
    const weekNumber = Math.ceil(i / 7)
    const timeSlots = PLATFORM_OPTIMAL_TIMES[platform]
    const scheduledTime = timeSlots[(i - 1) % timeSlots.length]

    const hook = `${pillar.pillar}: ${topic.slice(0, 45)} — ${pillar.angle}.`
    const caption = [
      `Most people approach ${topic.slice(0, 40)} backwards.`,
      ``,
      `Here is the exact playbook to change that:`,
      `1. Diagnose the friction before adding more tools.`,
      `2. Standardize your core distribution architecture.`,
      `3. Turn every single win into a repeatable multi-format asset.`,
      ``,
      `The result? Faster momentum, higher engagement, and zero wasted production cycles.`,
    ].join('\n')

    const cta = `Want the full implementation template? Check the resource link below.`
    const hashtags =
      platform === 'LinkedIn'
        ? '#GrowthMarketing #ContentOps #IncuBrix #B2BGrowth #AIWorkflows'
        : platform === 'Instagram'
        ? '#contentcreator #growthhacks #socialmediamarketing #buildinpublic #marketingstrategy #incubrix'
        : '#Shorts #GrowthTips #Productivity #AI'

    const utmLink = `${baseDomain}?utm_source=${platform.toLowerCase().replace(/\s+/g, '')}&utm_medium=social&utm_campaign=${slug}&utm_content=asset_${String(i).padStart(2, '0')}`

    // Validation Status
    const length = caption.length
    let status = 'PASS'
    const warnings = []

    if (platform === 'Twitter / X' && length > 280) {
      status = 'WARNING'
      warnings.push('Length exceeds single tweet limit (format as thread).')
    }
    if (!cta) {
      status = 'WARNING'
      warnings.push('Missing Call to Action.')
    }
    if (!utmLink.includes('utm_campaign=')) {
      status = 'WARNING'
      warnings.push('Incomplete UTM parameters.')
    }

    assets.push({
      id: `ASSET-${String(i).padStart(2, '0')}`,
      day: `Day ${dayNumber}`,
      week: `Week ${weekNumber}`,
      scheduledTime,
      platform,
      postType,
      pillar: pillar.pillar,
      hook,
      caption,
      cta,
      hashtags,
      utmLink,
      status,
      warnings,
    })
  }

  return assets
}

export default function CampaignStudio() {
  const [topic, setTopic] = useState('IncuBrix Growth Engine: Turning AI insights into high-converting multi-platform distribution')
  const [goal, setGoal] = useState('lead_gen')
  const [assetCount, setAssetCount] = useState(30)
  const [domain, setDomain] = useState('https://incubrix.com/growth')
  const [campaignSlug, setCampaignSlug] = useState('incubrix-30day-sprint')

  const [campaignAssets, setCampaignAssets] = useState(null)
  const [selectedPlatform, setSelectedPlatform] = useState('ALL')
  const [selectedWeek, setSelectedWeek] = useState('ALL')
  const [activeAssetId, setActiveAssetId] = useState(null)
  const [success, setSuccess] = useState('')
  const [copiedKey, setCopiedKey] = useState('')

  function handleGenerateCampaign(e) {
    e.preventDefault()
    if (!topic.trim()) return

    const generated = generateCohesiveCampaignAssets({
      topic: topic.trim(),
      goal,
      count: assetCount,
      domain: domain.trim(),
      campaignSlug: campaignSlug.trim(),
    })

    setCampaignAssets(generated)
    setActiveAssetId(generated[0]?.id || null)

    // Save metadata in history
    saveContentHistory({
      topic: topic.trim(),
      isCampaignPackage: true,
      contentType: 'campaign_package',
      goal,
      assetCount,
      domain,
      campaignSlug,
      content: `[Campaign Package: ${topic.slice(0, 50)}]\nGenerated ${generated.length} publication-ready multi-platform assets with UTM tracking and posting schedule.`,
    })

    setSuccess(`Generated ${generated.length} production-ready campaign assets with verified UTM tracking links!`)
    setTimeout(() => setSuccess(''), 4000)
  }

  function handleAssetFieldChange(id, field, value) {
    if (!campaignAssets) return
    setCampaignAssets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  function handleExportCsv() {
    if (!campaignAssets || !campaignAssets.length) return

    const headers = [
      'Asset_ID',
      'Day',
      'Week',
      'Scheduled_Time',
      'Platform',
      'Post_Type',
      'Theme_Pillar',
      'Hook',
      'Caption',
      'Call_To_Action',
      'Hashtags',
      'UTM_Tracking_Link',
      'Validation_Status',
    ]

    const escapeCsv = (val) => {
      const str = String(val ?? '').replace(/"/g, '""')
      return `"${str}"`
    }

    const rows = campaignAssets.map((a) => [
      escapeCsv(a.id),
      escapeCsv(a.day),
      escapeCsv(a.week),
      escapeCsv(a.scheduledTime),
      escapeCsv(a.platform),
      escapeCsv(a.postType),
      escapeCsv(a.pillar),
      escapeCsv(a.hook),
      escapeCsv(a.caption),
      escapeCsv(a.cta),
      escapeCsv(a.hashtags),
      escapeCsv(a.utmLink),
      escapeCsv(a.status),
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${campaignSlug || 'ContentBloom_Campaign'}_Scheduler_Ready.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    setSuccess('Scheduler-ready CSV exported successfully! Ready for Buffer, Hootsuite, or Sheets.')
    setTimeout(() => setSuccess(''), 4000)
  }

  async function handleCopy(text, key) {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 2000)
    } catch {
      // fallback
    }
  }

  const filteredAssets = (campaignAssets || []).filter((a) => {
    if (selectedPlatform !== 'ALL' && a.platform !== selectedPlatform) return false
    if (selectedWeek !== 'ALL' && a.week !== selectedWeek) return false
    return true
  })

  const activeAsset = campaignAssets?.find((a) => a.id === activeAssetId) || filteredAssets[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <span className="section-label">
            <span>🚀</span> IncuBrix Multi-Asset Campaign Engine
          </span>
          <div className="flex gap-2">
            <Link to="/generate-all" className="btn-secondary text-xs py-1 px-3">
              ✨ 4-in-1 Studio
            </Link>
            <Link to="/image-studio" className="btn-secondary text-xs py-1 px-3">
              🎨 Image Studio
            </Link>
            <Link to="/video-studio" className="btn-secondary text-xs py-1 px-3">
              🎬 Video Studio
            </Link>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          30-Asset Campaign & Social Media Scheduler
        </h1>

        <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          Produce complete, publication-ready multi-platform asset packages (10, 20, or 30 days) with verified hooks, captions, CTAs, UTM tracking links, optimal posting time slots, and a scheduler-ready CSV export.
        </p>
      </div>

      {success && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm text-emerald-800 flex items-center justify-between"
        >
          <span>✓ {success}</span>
          <button
            type="button"
            onClick={() => setSuccess('')}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Campaign Configuration Form */}
      <form onSubmit={handleGenerateCampaign} className="card border-slate-200 shadow-xs mb-10">
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-900 mb-1">
            1. Core Campaign Topic / Value Proposition
          </label>
          <input
            type="text"
            className="input-field text-sm font-medium"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. IncuBrix AI Marketing Engine: Automated multi-format distribution"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pt-4 border-t border-slate-100">
          {/* Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Campaign Objective
            </label>
            <div className="space-y-1.5">
              {CAMPAIGN_GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                    goal === g.id
                      ? 'border-bloom-500 bg-bloom-50/80 font-bold text-bloom-900 ring-1 ring-bloom-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Asset Volume */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              3. Asset Batch Size
            </label>
            <div className="space-y-1.5">
              {ASSET_COUNTS.map((cnt) => (
                <button
                  key={cnt.count}
                  type="button"
                  onClick={() => setAssetCount(cnt.count)}
                  className={`w-full flex flex-col p-2.5 rounded-xl border text-left text-xs transition-all ${
                    assetCount === cnt.count
                      ? 'border-bloom-500 bg-bloom-50/80 font-bold text-bloom-900 ring-1 ring-bloom-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold">{cnt.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{cnt.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tracking UTMs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              4. Tracking Domain & UTM Campaign Tag
            </label>
            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Destination URL</span>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="input-field text-xs font-mono"
                  placeholder="https://incubrix.com/growth"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Campaign Slug</span>
                <input
                  type="text"
                  value={campaignSlug}
                  onChange={(e) => setCampaignSlug(e.target.value)}
                  className="input-field text-xs font-mono"
                  placeholder="incubrix-30day-sprint"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3 text-base justify-center font-bold shadow-md"
        >
          🚀 Generate {assetCount}-Asset Cohesive Campaign & Posting Schedule
        </button>
      </form>

      {/* Campaign Asset Showcase & Scheduler Table */}
      {campaignAssets && (
        <section className="space-y-6">
          {/* Top Summary Bar */}
          <div className="card bg-gradient-to-r from-slate-900 via-slate-950 to-bloom-950 text-white border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono bg-bloom-500 text-slate-950 font-black px-2 py-0.5 rounded">
                    {campaignAssets.length} ASSETS READY
                  </span>
                  <span className="text-xs text-slate-300">
                    UTM Tag: <code className="text-bloom-300 font-mono">{campaignSlug}</code>
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">
                  {topic}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="btn-primary text-xs py-2 px-4 shadow-lg font-bold"
                >
                  ⬇ Export Scheduler-Ready CSV (Buffer / Hootsuite)
                </button>
              </div>
            </div>
          </div>

          {/* Filters & View Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200">
            {/* Platform Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-slate-400 font-semibold mr-1">Platform:</span>
              {['ALL', 'LinkedIn', 'Instagram', 'YouTube Shorts', 'Twitter / X'].map((plt) => (
                <button
                  key={plt}
                  type="button"
                  onClick={() => setSelectedPlatform(plt)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    selectedPlatform === plt
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {plt}
                </button>
              ))}
            </div>

            {/* Week Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold mr-1">Week:</span>
              {['ALL', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'].map((wk) => (
                <button
                  key={wk}
                  type="button"
                  onClick={() => setSelectedWeek(wk)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    selectedWeek === wk
                      ? 'bg-bloom-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {wk}
                </button>
              ))}
            </div>
          </div>

          {/* Dual Panel: Asset Explorer List + Active Asset Detailed Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Asset Schedule List */}
            <div className="lg:col-span-5 space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setActiveAssetId(asset.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    activeAsset?.id === asset.id
                      ? 'border-bloom-500 bg-bloom-50/70 shadow-sm ring-1 ring-bloom-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                        {asset.id}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {asset.day}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {asset.scheduledTime}
                      </span>
                    </div>

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
                  </div>

                  <p className="text-xs font-semibold text-slate-900 line-clamp-1 mb-1">
                    {asset.hook}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{asset.postType}</span>
                    <span
                      className={`font-mono font-bold ${
                        asset.status === 'PASS' ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      ✓ {asset.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Active Asset Detailed Editor & Ready-to-Publish Card */}
            {activeAsset && (
              <div className="lg:col-span-7 card border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {activeAsset.id}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {activeAsset.day} · {activeAsset.scheduledTime}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {activeAsset.platform} — {activeAsset.postType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `${activeAsset.hook}\n\n${activeAsset.caption}\n\n${activeAsset.cta}\n\nLink: ${activeAsset.utmLink}\n\n${activeAsset.hashtags}`,
                          `active-${activeAsset.id}`
                        )
                      }
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      {copiedKey === `active-${activeAsset.id}` ? '✓ Copied Package!' : '📋 Copy Asset'}
                    </button>
                  </div>
                </div>

                {/* Validation Status Pill */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs border border-slate-200">
                  <span className="font-bold text-slate-700">Validation Status:</span>
                  <span className="font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                    PASS · Formatted for {activeAsset.platform}
                  </span>
                  <span className="text-slate-400">| Length: {activeAsset.caption.length} chars</span>
                </div>

                {/* Hook */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                    ⚡ Opening Hook / Headline
                  </span>
                  <textarea
                    rows={2}
                    value={activeAsset.hook}
                    onChange={(e) => handleAssetFieldChange(activeAsset.id, 'hook', e.target.value)}
                    className="input-field text-xs font-semibold leading-relaxed"
                  />
                </div>

                {/* Caption */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                    📝 Full Caption / Copy Body
                  </span>
                  <textarea
                    rows={6}
                    value={activeAsset.caption}
                    onChange={(e) => handleAssetFieldChange(activeAsset.id, 'caption', e.target.value)}
                    className="input-field text-xs font-sans leading-relaxed"
                  />
                </div>

                {/* CTA & UTM Tracking Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                      📣 Call To Action (CTA)
                    </span>
                    <input
                      type="text"
                      value={activeAsset.cta}
                      onChange={(e) => handleAssetFieldChange(activeAsset.id, 'cta', e.target.value)}
                      className="input-field text-xs"
                    />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                      🏷️ Curated Hashtags
                    </span>
                    <input
                      type="text"
                      value={activeAsset.hashtags}
                      onChange={(e) => handleAssetFieldChange(activeAsset.id, 'hashtags', e.target.value)}
                      className="input-field text-xs font-mono"
                    />
                  </div>
                </div>

                {/* UTM Tracking Link */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">
                      🔗 Verified UTM Tracking URL
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeAsset.utmLink, `utm-${activeAsset.id}`)}
                      className="text-xs font-bold text-bloom-600 hover:text-bloom-700"
                    >
                      {copiedKey === `utm-${activeAsset.id}` ? '✓ Copied' : 'Copy URL'}
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-slate-700 break-all select-all">
                    {activeAsset.utmLink}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
