/**
 * Demo Analytics Engine for ContentBloom AI
 * Provides honest, client-side visit tracking in localStorage
 * for campaign landing page demonstrations and assessment evaluations.
 *
 * NOTE: This is local demo telemetry, not external production tracking.
 */

const STORAGE_KEY = 'contentbloom_demo_visits_v1'

/**
 * Generate a collision-resistant unique ID.
 */
function generateVisitId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `visit_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`
  }
  return `visit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Safely read stored visits from localStorage.
 */
export function getDemoVisits(campaignFilter = null) {
  if (typeof window === 'undefined' && typeof global === 'undefined') return []
  const storage = typeof window !== 'undefined' ? window.localStorage : global.localStorage
  if (!storage) return []

  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return []
    const visits = JSON.parse(raw)
    if (!Array.isArray(visits)) return []

    if (!campaignFilter) return visits

    const needle = String(campaignFilter).toLowerCase().trim()
    return visits.filter(
      (v) =>
        (v.utmCampaign && v.utmCampaign.toLowerCase() === needle) ||
        (v.utmContent && v.utmContent.toLowerCase() === needle) ||
        (v.campaignId && v.campaignId.toLowerCase() === needle)
    )
  } catch (err) {
    console.warn('[demoAnalytics] Failed to read demo visits:', err)
    return []
  }
}

/**
 * Record a demo visit from a campaign CTA link.
 * Includes deduplication within a 3-second window to prevent duplicate
 * writes caused by React 18 Strict Mode in development.
 */
export function recordDemoVisit({
  path = '/resources/growth-playbook',
  utmSource = 'direct',
  utmMedium = 'none',
  utmCampaign = 'none',
  utmContent = 'none',
  campaignId = null,
  assetId = null,
} = {}) {
  const storage = typeof window !== 'undefined' ? window.localStorage : global?.localStorage
  if (!storage) return null

  try {
    const raw = storage.getItem(STORAGE_KEY)
    const visits = raw ? JSON.parse(raw) : []
    const now = new Date()

    // Deduplication check: ignore duplicate within 3000ms with identical parameters
    const isDuplicate = visits.some((v) => {
      const timeDiff = now.getTime() - new Date(v.timestamp).getTime()
      return (
        timeDiff < 3000 &&
        v.path === path &&
        v.utmSource === (utmSource || 'direct') &&
        v.utmCampaign === (utmCampaign || 'none') &&
        v.utmContent === (utmContent || 'none')
      )
    })

    if (isDuplicate) {
      return visits[0] || null
    }

    const record = {
      id: generateVisitId(),
      timestamp: now.toISOString(),
      path,
      utmSource: utmSource || 'direct',
      utmMedium: utmMedium || 'none',
      utmCampaign: utmCampaign || 'none',
      utmContent: utmContent || 'none',
      campaignId: campaignId || null,
      assetId: assetId || null,
      isAttributed: Boolean(utmCampaign && utmCampaign !== 'none' && utmSource && utmSource !== 'direct'),
    }

    visits.unshift(record)

    // Keep up to 200 recent records
    if (visits.length > 200) {
      visits.length = 200
    }

    storage.setItem(STORAGE_KEY, JSON.stringify(visits))
    return record
  } catch (err) {
    console.warn('[demoAnalytics] Failed to record demo visit:', err)
    return null
  }
}

/**
 * Aggregate visit statistics for a specific campaign or overall.
 */
export function getCampaignVisitStats(campaignFilter = null) {
  const visits = getDemoVisits(campaignFilter)
  const bySource = {}
  const byContent = {}

  for (const v of visits) {
    const src = v.utmSource || 'direct'
    bySource[src] = (bySource[src] || 0) + 1

    if (v.utmContent && v.utmContent !== 'none') {
      byContent[v.utmContent] = (byContent[v.utmContent] || 0) + 1
    }
  }

  return {
    totalVisits: visits.length,
    bySource,
    byContent,
    lastVisitAt: visits.length > 0 ? visits[0].timestamp : null,
  }
}

/**
 * Clear stored demo visits.
 */
export function clearDemoVisits() {
  const storage = typeof window !== 'undefined' ? window.localStorage : global?.localStorage
  if (!storage) return
  try {
    storage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn('[demoAnalytics] Failed to clear demo visits:', err)
  }
}

