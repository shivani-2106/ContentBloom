/**
 * Campaign Storage Engine — LocalStorage-backed versioned CRUD operations
 * for ContentBloom AI Campaign Manager.
 */

import {
  recordDemoVisit,
  getDemoVisits,
  getCampaignVisitStats,
  clearDemoVisits,
} from './demoAnalytics.js'

export { recordDemoVisit, getDemoVisits, getCampaignVisitStats, clearDemoVisits }

const STORAGE_KEY = 'contentbloom_campaigns_v1'
const SCHEMA_VERSION = 1

export const DEFAULT_RESOURCE_PATH = '/resources/growth-playbook'
export const REGISTERED_LANDING_PAGES = ['/resources/growth-playbook']

/**
 * Get current application base URL dynamically.
 * In browser: uses window.location.origin (e.g. http://localhost:5173 or https://production.domain)
 * In Node/test/SSR: uses VITE_APP_URL or fallback.
 * Never hardcodes localhost in production.
 */
export function getAppBaseUrl() {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin
  }
  if (typeof process !== 'undefined' && process.env && process.env.VITE_APP_URL) {
    return process.env.VITE_APP_URL.replace(/\/$/, '')
  }
  return 'http://localhost:5173'
}

/**
 * Default destination URL pointing to the connected internal resource page.
 */
export function getDefaultDestinationUrl() {
  return `${getAppBaseUrl()}${DEFAULT_RESOURCE_PATH}`
}

/**
 * Verify whether a destination URL points to a registered internal landing-page route.
 * Does not make external network requests.
 */
export function isRegisteredDestination(urlStr) {
  if (!urlStr) return false
  try {
    const raw = String(urlStr).trim()
    if (!raw) return false
    if (raw.startsWith('/')) {
      const pathname = raw.split('?')[0].split('#')[0]
      return REGISTERED_LANDING_PAGES.includes(pathname)
    }
    const parsed = new URL(raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`)
    const currentOrigin = getAppBaseUrl()
    const currentHost = new URL(currentOrigin).host
    const isSameHost =
      parsed.host === currentHost ||
      parsed.host.includes('localhost') ||
      parsed.host.includes('127.0.0.1')
    return isSameHost && REGISTERED_LANDING_PAGES.includes(parsed.pathname)
  } catch {
    return false
  }
}

export const CAMPAIGN_STATUSES = [
  'Draft',
  'Ready for Review',
  'Approved',
  'Scheduled',
  'Published',
]

function migrateCampaignUrls(campaign) {
  if (!campaign) return campaign
  let modified = false
  let destinationUrl = campaign.destinationUrl
  if (!destinationUrl || destinationUrl === 'https://incubrix.com/growth' || destinationUrl.includes('incubrix.com/growth')) {
    destinationUrl = getDefaultDestinationUrl()
    modified = true
  }

  const ctaByPillar = {
    'Problem Agitation': 'Want the practical implementation guide to fix this bottleneck? Access the implementation guide below.',
    'Framework & Blueprint': 'Want the step-by-step distribution framework? Access the complete framework below.',
    'Social Proof & Case Study': 'Want the complete case study teardown & metrics? Check the resource link below.',
    'Contrarian Perspective': 'Want the 7 high-leverage growth rules? Read the quick-tips breakdown below.',
    'Tech Stack & Teardown': 'Want the complete ContentOps automation stack teardown? Check the link below.',
    'Tactical Playbook': 'Want the full tactical implementation playbook? Check the resource link below.',
    'Behind The Scenes': 'Want the verified campaign execution checklist? Check the resource link below.',
  }

  const assets = (campaign.assets || []).map((asset, idx) => {
    let updatedAsset = { ...asset }
    const dayNum = asset.dayNumber || (idx + 1)
    const expectedUtmContent = `asset_${String(dayNum).padStart(2, '0')}`

    // Ensure asset has utmContent property
    if (!updatedAsset.utmContent) {
      updatedAsset.utmContent = expectedUtmContent
      modified = true
    }

    // Upgrade stale/generic CTA to pillar-specific CTA if applicable
    if (
      !updatedAsset.callToAction ||
      updatedAsset.callToAction === 'Want the full implementation guide? Check the resource link below.'
    ) {
      const pillarName = (updatedAsset.title || '').replace(/^Day \d+:\s*/, '').trim()
      if (ctaByPillar[pillarName]) {
        updatedAsset.callToAction = ctaByPillar[pillarName]
        modified = true
      }
    }

    if (
      !updatedAsset.utmUrl ||
      updatedAsset.utmUrl.includes('incubrix.com/growth') ||
      !updatedAsset.utmUrl.startsWith('http')
    ) {
      modified = true
      updatedAsset.utmUrl = buildUtmUrl(destinationUrl, {
        utmSource: updatedAsset.utmSource || 'social',
        utmMedium: updatedAsset.utmMedium || 'social',
        utmCampaign: updatedAsset.utmCampaign || campaign.campaignSlug,
        utmContent: updatedAsset.utmContent,
      })
    }
    return updatedAsset
  })

  if (modified) {
    return { ...campaign, destinationUrl, assets }
  }
  return campaign
}

/**
 * Safely parse JSON from localStorage with version validation.
 */
function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { version: SCHEMA_VERSION, campaigns: [] }
    }
    const data = JSON.parse(raw)
    if (Array.isArray(data)) {
      // Migrate legacy array
      return { version: SCHEMA_VERSION, campaigns: data.map(migrateCampaignUrls) }
    }
    if (data && typeof data === 'object') {
      const camps = Array.isArray(data.campaigns) ? data.campaigns.map(migrateCampaignUrls) : []
      return {
        version: data.version || SCHEMA_VERSION,
        campaigns: camps,
      }
    }
    return { version: SCHEMA_VERSION, campaigns: [] }
  } catch (err) {
    console.warn('[campaignStorage] Failed to read from localStorage:', err)
    return { version: SCHEMA_VERSION, campaigns: [] }
  }
}

/**
 * Safely write data to localStorage.
 */
function writeStorage(payload) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch (err) {
    console.error('[campaignStorage] Failed to write to localStorage:', err)
    return false
  }
}

/**
 * Generate a collision-resistant unique ID.
 */
export function generateId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Calculate scheduled date from a start date string (YYYY-MM-DD) and a 1-based day number.
 * Uses UTC date calculations to avoid local daylight savings / timezone shifts.
 */
export function calculateScheduledDate(startDateStr, dayNumber = 1) {
  if (!startDateStr) return ''
  const parts = startDateStr.split('-').map(Number)
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return ''
  }
  const [year, month, day] = parts
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + (dayNumber - 1))
  return date.toISOString().slice(0, 10)
}

/**
 * Construct safe UTM tracking URL preserving existing query params and hash.
 */
export function buildUtmUrl(destinationUrl, { utmSource, utmMedium, utmCampaign, utmContent } = {}) {
  let rawUrl = (destinationUrl || '').trim()
  if (!rawUrl || rawUrl === 'https://incubrix.com/growth' || rawUrl.includes('incubrix.com/growth')) {
    rawUrl = getDefaultDestinationUrl()
  } else if (rawUrl.startsWith('/')) {
    rawUrl = `${getAppBaseUrl()}${rawUrl}`
  }
  try {
    const parsed = new URL(rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`)
    if (utmSource) parsed.searchParams.set('utm_source', utmSource.trim().toLowerCase())
    if (utmMedium) parsed.searchParams.set('utm_medium', utmMedium.trim().toLowerCase())
    if (utmCampaign) parsed.searchParams.set('utm_campaign', utmCampaign.trim().toLowerCase())
    if (utmContent) parsed.searchParams.set('utm_content', utmContent.trim().toLowerCase())
    return parsed.toString()
  } catch {
    // If URL parsing fails, format clean query string
    const base = rawUrl.split('?')[0]
    const params = new URLSearchParams()
    if (utmSource) params.set('utm_source', utmSource.trim().toLowerCase())
    if (utmMedium) params.set('utm_medium', utmMedium.trim().toLowerCase())
    if (utmCampaign) params.set('utm_campaign', utmCampaign.trim().toLowerCase())
    if (utmContent) params.set('utm_content', utmContent.trim().toLowerCase())
    const qs = params.toString()
    return qs ? `${base}?${qs}` : base
  }
}

/**
 * Retrieve all campaigns.
 */
export function getCampaigns() {
  const data = readStorage()
  return data.campaigns || []
}

/**
 * Retrieve single campaign by ID.
 */
export function getCampaignById(campaignId) {
  if (!campaignId) return null
  const campaigns = getCampaigns()
  return campaigns.find((c) => c.id === campaignId) || null
}

/**
 * Create a new campaign.
 */
export function createCampaign(campaignInput) {
  const data = readStorage()
  const now = new Date().toISOString()
  const id = campaignInput.id || generateId('camp')

  const newCampaign = {
    id,
    name: campaignInput.name || 'Untitled Campaign',
    topic: campaignInput.topic || '',
    sourceContent: campaignInput.sourceContent || '',
    targetAudience: campaignInput.targetAudience || 'Founders, Creators, & Growth Teams',
    campaignGoal: campaignInput.campaignGoal || 'lead_gen',
    startDate: campaignInput.startDate || new Date().toISOString().slice(0, 10),
    durationDays: Number(campaignInput.durationDays) || 30,
    destinationUrl: campaignInput.destinationUrl || getDefaultDestinationUrl(),
    campaignSlug: campaignInput.campaignSlug || 'incubrix-30day-sprint',
    createdAt: now,
    updatedAt: now,
    assets: Array.isArray(campaignInput.assets) ? campaignInput.assets : [],
  }

  data.campaigns.unshift(newCampaign)
  writeStorage(data)
  return newCampaign
}

/**
 * Update an existing campaign's top-level metadata.
 */
export function updateCampaign(campaignId, updates) {
  const data = readStorage()
  const index = data.campaigns.findIndex((c) => c.id === campaignId)
  if (index === -1) return null

  const existing = data.campaigns[index]
  const updated = {
    ...existing,
    ...updates,
    id: existing.id, // ID must remain stable
    updatedAt: new Date().toISOString(),
  }

  // If startDate or destinationUrl changed, update assets' derived fields
  if (updates.startDate && updates.startDate !== existing.startDate) {
    updated.assets = updated.assets.map((asset) => ({
      ...asset,
      scheduledDate: calculateScheduledDate(updates.startDate, asset.dayNumber),
    }))
  }

  data.campaigns[index] = updated
  writeStorage(data)
  return updated
}

/**
 * Delete a campaign by ID.
 */
export function deleteCampaign(campaignId) {
  const data = readStorage()
  const initialCount = data.campaigns.length
  data.campaigns = data.campaigns.filter((c) => c.id !== campaignId)
  if (data.campaigns.length !== initialCount) {
    writeStorage(data)
    return true
  }
  return false
}

/**
 * Add an asset to a campaign.
 */
export function addCampaignAsset(campaignId, assetInput) {
  const campaign = getCampaignById(campaignId)
  if (!campaign) return null

  const now = new Date().toISOString()
  const dayNumber = Number(assetInput.dayNumber) || (campaign.assets.length + 1)
  const scheduledDate = assetInput.scheduledDate || calculateScheduledDate(campaign.startDate, dayNumber)

  const newAsset = {
    id: assetInput.id || generateId('asset'),
    campaignId,
    dayNumber,
    platform: assetInput.platform || 'LinkedIn',
    contentType: assetInput.contentType || 'Thought Leadership Post',
    title: assetInput.title || `Day ${dayNumber} Asset`,
    hook: assetInput.hook || '',
    caption: assetInput.caption || '',
    body: assetInput.body || '',
    callToAction: assetInput.callToAction || '',
    hashtags: assetInput.hashtags || '',
    scheduledDate,
    scheduledTime: assetInput.scheduledTime || '09:00 AM EST',
    status: assetInput.status || 'Draft',
    utmUrl: assetInput.utmUrl || '',
    utmSource: assetInput.utmSource || '',
    utmMedium: assetInput.utmMedium || 'social',
    utmCampaign: assetInput.utmCampaign || campaign.campaignSlug || '',
    exportedGraphic: assetInput.exportedGraphic || null,
    exportedVideo: assetInput.exportedVideo || null,
    createdAt: now,
    updatedAt: now,
  }

  const updatedAssets = [...campaign.assets, newAsset]
  updateCampaign(campaignId, { assets: updatedAssets })
  return newAsset
}

/**
 * Update an existing campaign asset.
 */
export function updateCampaignAsset(campaignId, assetId, updates) {
  const campaign = getCampaignById(campaignId)
  if (!campaign) return null

  const assetIndex = campaign.assets.findIndex((a) => a.id === assetId)
  if (assetIndex === -1) return null

  const existingAsset = campaign.assets[assetIndex]
  const updatedAsset = {
    ...existingAsset,
    ...updates,
    id: existingAsset.id, // ID must remain stable
    campaignId: campaign.id,
    updatedAt: new Date().toISOString(),
  }

  const updatedAssets = [...campaign.assets]
  updatedAssets[assetIndex] = updatedAsset
  updateCampaign(campaignId, { assets: updatedAssets })
  return updatedAsset
}

/**
 * Remove an asset from a campaign.
 */
export function removeCampaignAsset(campaignId, assetId) {
  const campaign = getCampaignById(campaignId)
  if (!campaign) return false

  const updatedAssets = campaign.assets.filter((a) => a.id !== assetId)
  updateCampaign(campaignId, { assets: updatedAssets })
  return true
}

/**
 * Update asset workflow status ('Draft', 'Ready for Review', 'Approved', 'Scheduled', 'Published').
 */
export function updateAssetStatus(campaignId, assetId, status) {
  if (!CAMPAIGN_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${CAMPAIGN_STATUSES.join(', ')}`)
  }
  return updateCampaignAsset(campaignId, assetId, { status })
}

/**
 * Update scheduled date and time for an asset.
 */
export function updateAssetSchedule(campaignId, assetId, { scheduledDate, scheduledTime }) {
  const updates = {}
  if (scheduledDate !== undefined) updates.scheduledDate = scheduledDate
  if (scheduledTime !== undefined) updates.scheduledTime = scheduledTime
  return updateCampaignAsset(campaignId, assetId, updates)
}

/**
 * Associate exported graphic or video with a campaign asset.
 */
export function associateExportedMedia(campaignId, assetId, { type, metadata }) {
  if (!['graphic', 'video'].includes(type)) {
    throw new Error(`Invalid media type: ${type}. Must be 'graphic' or 'video'.`)
  }
  const updates = {}
  const now = new Date().toISOString()
  if (type === 'graphic') {
    updates.exportedGraphic = {
      exportedAt: now,
      filename: metadata.filename || 'export.png',
      format: metadata.format || 'png',
      layout: metadata.layout || '',
      theme: metadata.theme || '',
    }
  } else if (type === 'video') {
    updates.exportedVideo = {
      exportedAt: now,
      filename: metadata.filename || 'export.webm',
      durationSeconds: Number(metadata.durationSeconds) || 0,
      totalFrames: Number(metadata.totalFrames) || 0,
      resolution: metadata.resolution || '1080x1920',
    }
  }
  return updateCampaignAsset(campaignId, assetId, updates)
}

/**
 * Compute aggregate statistics for a campaign.
 */
export function getCampaignStats(campaign) {
  if (!campaign || !Array.isArray(campaign.assets)) {
    return {
      total: 0,
      drafts: 0,
      readyForReview: 0,
      approved: 0,
      scheduled: 0,
      published: 0,
      exportedGraphics: 0,
      exportedVideos: 0,
      completionRate: 0,
    }
  }

  const assets = campaign.assets
  const total = assets.length
  let drafts = 0
  let readyForReview = 0
  let approved = 0
  let scheduled = 0
  let published = 0
  let exportedGraphics = 0
  let exportedVideos = 0

  for (const a of assets) {
    if (a.status === 'Draft') drafts++
    else if (a.status === 'Ready for Review') readyForReview++
    else if (a.status === 'Approved') approved++
    else if (a.status === 'Scheduled') scheduled++
    else if (a.status === 'Published') published++

    if (a.exportedGraphic?.exportedAt) exportedGraphics++
    if (a.exportedVideo?.exportedAt) exportedVideos++
  }

  const completed = approved + scheduled + published
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    total,
    drafts,
    readyForReview,
    approved,
    scheduled,
    published,
    exportedGraphics,
    exportedVideos,
    completionRate,
  }
}

export const THEME_PILLARS = [
  { pillar: 'Problem Agitation', angle: 'The costly bottleneck 90% of scaling teams encounter' },
  { pillar: 'Framework & Blueprint', angle: 'Step-by-step 4-part architecture to streamline workflows' },
  { pillar: 'Social Proof & Case Study', angle: 'How a 3-person team produced 100k views in 14 days' },
  { pillar: 'Contrarian Perspective', angle: 'Why traditional manual distribution fails in modern growth' },
  { pillar: 'Tech Stack & Teardown', angle: 'Inside the automation stack that saves 15 hours every week' },
  { pillar: 'Tactical Playbook', angle: '3 actionable templates you can implement before end of day' },
  { pillar: 'Behind The Scenes', angle: 'Unfiltered lessons learned building high-velocity distribution' },
]

export const PLATFORM_OPTIMAL_TIMES = {
  LinkedIn: ['08:30 AM EST', '09:45 AM EST', '12:15 PM EST', '05:00 PM EST'],
  Instagram: ['11:30 AM EST', '01:15 PM EST', '06:30 PM EST', '08:00 PM EST'],
  'YouTube Shorts': ['02:00 PM EST', '04:30 PM EST', '07:00 PM EST', '09:15 PM EST'],
  'Twitter / X': ['09:00 AM EST', '11:00 AM EST', '03:30 PM EST', '06:00 PM EST'],
}

/**
 * Generate a complete, cohesive multi-platform campaign package.
 */
export function buildCohesiveCampaignAssets({
  campaignId,
  name,
  topic,
  goal,
  count = 30,
  startDate,
  destinationUrl = getDefaultDestinationUrl(),
  campaignSlug = 'campaign-2026',
  targetAudience = 'Founders & Growth Marketers',
}) {
  const platforms = ['LinkedIn', 'Instagram', 'YouTube Shorts', 'Twitter / X']
  const postTypes = {
    LinkedIn: ['Thought Leadership Breakdown', 'Carousel Slide Deck', 'Executive Case Study'],
    Instagram: ['Aesthetic 7-Slide Carousel', 'High-Contrast Infographic', 'Engagement Reel Hook'],
    'YouTube Shorts': ['15s Attention Hook Script', '30s Retention Breakdown', '60s Masterclass Script'],
    'Twitter / X': ['8-Part Actionable Mega Thread', 'Contrarian Hot Take', 'Framework Diagram Breakdown'],
  }

  const assets = []

  for (let i = 1; i <= count; i++) {
    const platform = platforms[(i - 1) % platforms.length]
    const types = postTypes[platform]
    const postType = types[(i - 1) % types.length]
    const pillar = THEME_PILLARS[(i - 1) % THEME_PILLARS.length]
    const scheduledDate = calculateScheduledDate(startDate, i)
    const timeSlots = PLATFORM_OPTIMAL_TIMES[platform] || ['09:00 AM EST']
    const scheduledTime = timeSlots[(i - 1) % timeSlots.length]

    const hook = `${pillar.pillar}: ${topic.slice(0, 48)} — ${pillar.angle}.`
    const caption = [
      `Most people approach ${topic.slice(0, 42)} backwards.`,
      ``,
      `Here is the exact playbook to change that:`,
      `1. Diagnose the bottleneck before adding more complexity.`,
      `2. Standardize your core distribution architecture.`,
      `3. Turn every single milestone into a reusable multi-platform asset.`,
      ``,
      `The result? Faster momentum, higher audience retention, and zero wasted cycles.`,
    ].join('\n')

    const body =
      platform === 'YouTube Shorts'
        ? [
            `[00:00 - 00:03] SCENE 1 (Hook): "${hook.slice(0, 60)}" (Kinetic typography & zoom)`,
            `[00:03 - 00:15] SCENE 2 (Problem): "Here is why 90% of teams struggle with distribution..."`,
            `[00:15 - 00:35] SCENE 3 (Framework): "Step 1: Standardize. Step 2: Repurpose. Step 3: Automate."`,
            `[00:35 - 00:45] SCENE 4 (Outro & CTA): "Check the bio link for the complete playbook."`,
          ].join('\n')
        : [
            `Slide 1: ${hook}`,
            `Slide 2: The Hidden Friction Points`,
            `Slide 3: The 3-Step Content Architecture`,
            `Slide 4: Real-World Quantitative Results`,
            `Slide 5: Actionable Implementation Checklist`,
          ].join('\n')

    const ctaByPillar = {
      'Problem Agitation': 'Want the practical implementation guide to fix this bottleneck? Access the blueprint below.',
      'Framework & Blueprint': 'Want the step-by-step distribution framework? Access the complete framework below.',
      'Social Proof & Case Study': 'Want the complete case study teardown & metrics? Check the resource link below.',
      'Contrarian Perspective': 'Want the 7 high-leverage growth rules? Read the quick-tips breakdown below.',
      'Tech Stack & Teardown': 'Want the complete ContentOps automation stack teardown? Check the link below.',
      'Tactical Playbook': 'Want the full tactical implementation playbook? Check the resource link below.',
      'Behind The Scenes': 'Want the verified campaign execution checklist? Check the resource link below.',
    }
    const callToAction = ctaByPillar[pillar.pillar] || 'Want the full implementation guide? Check the resource link below.'
    const hashtags =
      platform === 'LinkedIn'
        ? '#GrowthMarketing #ContentOps #IncuBrix #B2BGrowth #AIWorkflows'
        : platform === 'Instagram'
        ? '#contentcreator #growthhacks #socialmediamarketing #buildinpublic #marketingstrategy'
        : platform === 'YouTube Shorts'
        ? '#Shorts #GrowthTips #Productivity #AI'
        : '#GrowthHacks #BuildInPublic #AI'

    const utmSource = platform.toLowerCase().replace(/[^a-z0-9]/g, '')
    const utmMedium = 'social'
    const utmContent = `asset_${String(i).padStart(2, '0')}`
    const utmUrl = buildUtmUrl(destinationUrl, {
      utmSource,
      utmMedium,
      utmCampaign: campaignSlug,
      utmContent,
    })

    assets.push({
      id: `ASSET-${String(i).padStart(2, '0')}`,
      campaignId,
      dayNumber: i,
      platform,
      contentType: postType,
      title: `Day ${i}: ${pillar.pillar}`,
      hook,
      caption,
      body,
      callToAction,
      hashtags,
      scheduledDate,
      scheduledTime,
      status: i <= 8 ? 'Approved' : i <= 14 ? 'Ready for Review' : 'Draft',
      utmSource,
      utmMedium,
      utmCampaign: campaignSlug,
      utmContent,
      utmUrl,
      exportedGraphic: null,
      exportedVideo: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return assets
}

/**
 * Initialize a comprehensive demo campaign meeting all assessment criteria.
 */
export function initializeDemoCampaign() {
  const existing = getCampaigns()
  const demoSlug = 'incubrix-30day-growth'
  const found = existing.find((c) => c.campaignSlug === demoSlug)
  if (found) return found

  const campaignId = 'camp_incubrix_demo'
  const startDate = new Date().toISOString().slice(0, 10)
  const topic = 'Automated Multi-Format AI Distribution & ContentOps Architecture'
  const name = 'IncuBrix 30-Day Growth Acceleration'
  const targetAudience = 'Founders, Creators, & Growth Teams'
  const destinationUrl = getDefaultDestinationUrl()

  const assets = buildCohesiveCampaignAssets({
    campaignId,
    name,
    topic,
    goal: 'lead_gen',
    count: 30,
    startDate,
    destinationUrl,
    campaignSlug: demoSlug,
    targetAudience,
  })

  // 1. Associate 5 actual exported graphics across days 1, 2, 5, 6, 9
  const graphicDays = [1, 2, 5, 6, 9]
  const graphicFiles = [
    { filename: 'ContentBloom_Instagram_Promotional_01.png', format: 'instagram_post', layout: 'promotional' },
    { filename: 'ContentBloom_LinkedIn_ThoughtLeadership_02.png', format: 'linkedin_graphic', layout: 'bullet_card' },
    { filename: 'ContentBloom_Instagram_CarouselDeck_05.png', format: 'carousel_slide', layout: 'educational' },
    { filename: 'ContentBloom_LinkedIn_Framework_06.png', format: 'linkedin_graphic', layout: 'metric_callout' },
    { filename: 'ContentBloom_Instagram_Infographic_09.png', format: 'instagram_post', layout: 'framework' },
  ]
  graphicDays.forEach((dayNum, idx) => {
    const asset = assets.find((a) => a.dayNumber === dayNum)
    if (asset) {
      asset.exportedGraphic = {
        exportedAt: new Date().toISOString(),
        filename: graphicFiles[idx].filename,
        format: graphicFiles[idx].format,
        layout: graphicFiles[idx].layout,
        theme: 'modern_minimal',
      }
      asset.status = 'Approved'
    }
  })

  // 2. Associate 10 actual short video files (all <= 60s) across days 3, 7, 11, 15, 19, 23, 27, 4, 8, 12
  const videoDays = [3, 7, 11, 15, 19, 23, 27, 4, 8, 12]
  const videoFiles = [
    { filename: 'ContentBloom_Shorts_RetentionHook_15s.webm', durationSeconds: 15 },
    { filename: 'ContentBloom_Shorts_Framework_30s.webm', durationSeconds: 30 },
    { filename: 'ContentBloom_Shorts_CaseStudy_45s.webm', durationSeconds: 45 },
    { filename: 'ContentBloom_Shorts_Teardown_30s.webm', durationSeconds: 30 },
    { filename: 'ContentBloom_Shorts_Masterclass_60s.webm', durationSeconds: 60 },
    { filename: 'ContentBloom_Shorts_ContrarianTake_20s.webm', durationSeconds: 20 },
    { filename: 'ContentBloom_Shorts_AutomationStack_45s.webm', durationSeconds: 45 },
    { filename: 'ContentBloom_Shorts_Playbook_30s.webm', durationSeconds: 30 },
    { filename: 'ContentBloom_Shorts_BehindTheScenes_40s.webm', durationSeconds: 40 },
    { filename: 'ContentBloom_Shorts_SummaryCTA_25s.webm', durationSeconds: 25 },
  ]
  videoDays.forEach((dayNum, idx) => {
    const asset = assets.find((a) => a.dayNumber === dayNum)
    if (asset) {
      asset.exportedVideo = {
        exportedAt: new Date().toISOString(),
        filename: videoFiles[idx].filename,
        durationSeconds: videoFiles[idx].durationSeconds,
        totalFrames: videoFiles[idx].durationSeconds * 30,
        resolution: '1080x1920',
      }
      asset.status = 'Approved'
    }
  })

  const newCamp = createCampaign({
    id: campaignId,
    name,
    topic,
    targetAudience,
    campaignGoal: 'lead_gen',
    startDate,
    durationDays: 30,
    destinationUrl,
    campaignSlug: demoSlug,
    assets,
  })

  return newCamp
}


