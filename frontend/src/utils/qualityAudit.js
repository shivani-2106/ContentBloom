/**
 * Quality Audit Engine for ContentBloom AI Campaign Manager
 * Provides deterministic, transparent, and reproducible validation
 * of campaign assets against social media and assessment standards.
 */

export const PLATFORM_LIMITS = {
  LinkedIn: { maxCaption: 3000, recommendedMax: 1500, minHook: 15 },
  Instagram: { maxCaption: 2200, recommendedMax: 1000, minHook: 10, maxHashtags: 30 },
  'YouTube Shorts': { maxTitle: 100, maxScriptWords: 180, minHook: 10, maxDurationSec: 60 },
  'Twitter / X': { maxTweet: 280, minHook: 10 },
}

/**
 * Audit a single campaign asset against explicit criteria.
 */
export function auditAsset(asset) {
  const issues = []
  const passedCriteria = []
  const failedCriteria = []

  const platform = asset.platform || 'LinkedIn'
  const hook = (asset.hook || '').trim()
  const caption = (asset.caption || '').trim()
  const body = (asset.body || '').trim()
  const cta = (asset.callToAction || asset.cta || '').trim()
  const utmLink = (asset.utmUrl || asset.utmLink || '').trim()

  // 1. Hook Strength
  const minHookLen = PLATFORM_LIMITS[platform]?.minHook || 15
  if (!hook) {
    failedCriteria.push('hook_strength')
    issues.push({
      rule: 'Hook Strength',
      severity: 'error',
      message: 'Opening hook is missing. Social posts require an immediate attention hook.',
      suggestion: 'Add an intriguing question, strong contrarian statement, or bold framework name.',
    })
  } else if (hook.length < minHookLen) {
    failedCriteria.push('hook_strength')
    issues.push({
      rule: 'Hook Strength',
      severity: 'warning',
      message: `Hook is only ${hook.length} characters (minimum recommended: ${minHookLen}).`,
      suggestion: 'Expand the hook with specific context or value promise.',
    })
  } else {
    passedCriteria.push('hook_strength')
  }

  // 2. Platform Formatting
  let formatOk = true
  if (platform === 'YouTube Shorts') {
    // Requires script or scene structure or pacing cues
    const text = body || caption
    if (!text || text.length < 50) {
      formatOk = false
      issues.push({
        rule: 'Platform Formatting',
        severity: 'error',
        message: 'YouTube Shorts script is too short for a 15-60s retention video.',
        suggestion: 'Provide at least 3 paced scenes with hook, core lesson, and CTA.',
      })
    }
  } else if (platform === 'Instagram') {
    if (!asset.hashtags && !caption.includes('#')) {
      issues.push({
        rule: 'Platform Formatting',
        severity: 'warning',
        message: 'Instagram posts perform better with 3-8 targeted hashtags.',
        suggestion: 'Add relevant niche hashtags in the hashtags field.',
      })
    }
  } else if (platform === 'LinkedIn') {
    if (!caption.includes('\n') && caption.length > 200) {
      issues.push({
        rule: 'Platform Formatting',
        severity: 'warning',
        message: 'LinkedIn long text without line breaks has lower readability on mobile.',
        suggestion: 'Format into 1-2 sentence paragraphs with whitespace.',
      })
    }
  }

  if (formatOk) {
    passedCriteria.push('platform_formatting')
  } else {
    failedCriteria.push('platform_formatting')
  }

  // 3. CTA Presence
  if (!cta) {
    failedCriteria.push('cta_presence')
    issues.push({
      rule: 'CTA Presence',
      severity: 'error',
      message: 'Missing Call to Action (CTA).',
      suggestion: 'Add a clear next step (e.g., "Save this post", "Comment GUIDE below", "Visit link").',
    })
  } else if (cta.length < 5) {
    failedCriteria.push('cta_presence')
    issues.push({
      rule: 'CTA Presence',
      severity: 'warning',
      message: 'CTA is very brief; may not drive desired conversion.',
      suggestion: 'Make the action verb explicit and give a compelling reason.',
    })
  } else {
    passedCriteria.push('cta_presence')
  }

  // 4. UTM Compliance
  let utmOk = true
  if (!utmLink) {
    utmOk = false
    issues.push({
      rule: 'UTM Compliance',
      severity: 'error',
      message: 'Tracking URL is empty.',
      suggestion: 'Generate a destination link with utm_source, utm_medium, and utm_campaign.',
    })
  } else {
    try {
      const url = new URL(utmLink)
      const hasSource = url.searchParams.has('utm_source')
      const hasMedium = url.searchParams.has('utm_medium')
      const hasCampaign = url.searchParams.has('utm_campaign')

      if (!hasSource || !hasMedium || !hasCampaign) {
        utmOk = false
        issues.push({
          rule: 'UTM Compliance',
          severity: 'error',
          message: `Missing UTM tags: ${[!hasSource && 'utm_source', !hasMedium && 'utm_medium', !hasCampaign && 'utm_campaign'].filter(Boolean).join(', ')}.`,
          suggestion: 'Ensure source, medium, and campaign parameters are populated.',
        })
      }
    } catch {
      utmOk = false
      issues.push({
        rule: 'UTM Compliance',
        severity: 'error',
        message: 'Tracking URL is not a well-formed web address.',
        suggestion: 'Verify that the URL begins with https:// or http://.',
      })
    }
  }

  if (utmOk) {
    passedCriteria.push('utm_compliance')
  } else {
    failedCriteria.push('utm_compliance')
  }

  // 5. Character Bounds
  let boundsOk = true
  const totalLength = (caption ? caption.length : 0) + (hook ? hook.length : 0)
  if (platform === 'Twitter / X' && totalLength > 280) {
    boundsOk = false
    issues.push({
      rule: 'Character Bounds',
      severity: 'warning',
      message: `Content length (${totalLength} chars) exceeds standard 280-char tweet limit.`,
      suggestion: 'Break into a multi-tweet thread or trim non-essential sentences.',
    })
  } else if (platform === 'LinkedIn' && totalLength > 3000) {
    boundsOk = false
    issues.push({
      rule: 'Character Bounds',
      severity: 'error',
      message: `LinkedIn post length (${totalLength}) exceeds maximum 3,000 characters.`,
      suggestion: 'Edit down body copy to keep within platform post boundaries.',
    })
  } else if (platform === 'Instagram' && totalLength > 2200) {
    boundsOk = false
    issues.push({
      rule: 'Character Bounds',
      severity: 'error',
      message: `Instagram caption length (${totalLength}) exceeds 2,200 character limit.`,
      suggestion: 'Shorten caption and move supporting points into carousel slides.',
    })
  }

  if (boundsOk) {
    passedCriteria.push('character_bounds')
  } else {
    failedCriteria.push('character_bounds')
  }

  // 6. Content Completeness
  let completeOk = true
  if (!asset.title && !asset.hook) {
    completeOk = false
    issues.push({
      rule: 'Content Completeness',
      severity: 'error',
      message: 'Asset lacks both a title and an opening hook.',
      suggestion: 'Provide an asset title and opening hook.',
    })
  }
  if (!caption && !body) {
    completeOk = false
    issues.push({
      rule: 'Content Completeness',
      severity: 'error',
      message: 'Asset body and caption are both empty.',
      suggestion: 'Add copy or script content for this asset.',
    })
  }
  if (!asset.scheduledTime) {
    completeOk = false
    issues.push({
      rule: 'Content Completeness',
      severity: 'warning',
      message: 'No posting time slot assigned.',
      suggestion: 'Assign an optimal posting time slot (e.g. 09:00 AM EST).',
    })
  }

  if (completeOk) {
    passedCriteria.push('content_completeness')
  } else {
    failedCriteria.push('content_completeness')
  }

  // 7. Media Readiness (Informational check)
  const isVideoPlatform = platform === 'YouTube Shorts'
  const isGraphicPlatform = platform === 'Instagram' || platform === 'LinkedIn'
  let mediaNote = 'Ready for production'
  if (isVideoPlatform) {
    if (asset.exportedVideo?.exportedAt) {
      mediaNote = `✓ Video Rendered (${asset.exportedVideo.durationSeconds || '<60'}s)`
    } else {
      mediaNote = '⏳ Script ready · Video pending render in Video Studio'
    }
  } else if (isGraphicPlatform) {
    if (asset.exportedGraphic?.exportedAt) {
      mediaNote = '✓ Graphic Exported (PNG)'
    } else {
      mediaNote = '⏳ Copy ready · Graphic pending export in Image Studio'
    }
  }

  // Asset passes if there are no fatal errors (warnings are permitted)
  const hasFatalErrors = issues.some((i) => i.severity === 'error')
  const passed = !hasFatalErrors

  return {
    assetId: asset.id,
    dayNumber: asset.dayNumber,
    platform,
    title: asset.title || `Day ${asset.dayNumber}`,
    passed,
    issues,
    passedCriteria,
    failedCriteria,
    mediaNote,
    score: passedCriteria.length / (passedCriteria.length + failedCriteria.length || 1),
  }
}

/**
 * Run a reproducible quality audit across a sample of campaign assets.
 * Selects up to sampleSize assets using a deterministic shuffle if seed is provided.
 */
export function runCampaignAudit(campaign, sampleSize = 20, seed = 42) {
  if (!campaign || !Array.isArray(campaign.assets) || campaign.assets.length === 0) {
    return {
      auditedAt: new Date().toISOString(),
      sampleSize: 0,
      totalEligible: 0,
      passedAssets: 0,
      failedAssets: 0,
      passRate: 0,
      results: [],
      rulePassRates: {},
      summary: 'No assets available in this campaign to audit.',
      recommendations: ['Create or generate campaign assets first.'],
    }
  }

  const assets = [...campaign.assets]
  const totalEligible = assets.length
  const actualSampleSize = Math.min(sampleSize, totalEligible)

  // Pseudo-random deterministic sampling based on seed so results are reproducible
  let currentSeed = Number(seed) || 42
  function pseudoRandom() {
    currentSeed = (currentSeed * 9301 + 49297) % 233280
    return currentSeed / 233280
  }

  // Fisher-Yates deterministic shuffle
  const shuffled = [...assets]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoRandom() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const sample = shuffled.slice(0, actualSampleSize)
  // Sort sample by dayNumber for intuitive presentation
  sample.sort((a, b) => (Number(a.dayNumber) || 0) - (Number(b.dayNumber) || 0))

  const results = sample.map(auditAsset)
  const passedAssets = results.filter((r) => r.passed).length
  const failedAssets = results.length - passedAssets
  const passRate = results.length > 0 ? Math.round((passedAssets / results.length) * 100) : 0

  // Aggregate rule pass rates
  const ruleCounts = {
    hook_strength: { passed: 0, total: 0 },
    platform_formatting: { passed: 0, total: 0 },
    cta_presence: { passed: 0, total: 0 },
    utm_compliance: { passed: 0, total: 0 },
    character_bounds: { passed: 0, total: 0 },
    content_completeness: { passed: 0, total: 0 },
  }

  for (const r of results) {
    for (const p of r.passedCriteria) {
      if (ruleCounts[p]) {
        ruleCounts[p].passed++
        ruleCounts[p].total++
      }
    }
    for (const f of r.failedCriteria) {
      if (ruleCounts[f]) {
        ruleCounts[f].total++
      }
    }
  }

  const rulePassRates = {}
  for (const [key, val] of Object.entries(ruleCounts)) {
    rulePassRates[key] = val.total > 0 ? Math.round((val.passed / val.total) * 100) : 100
  }

  // Collect specific recommendations
  const recommendationsSet = new Set()
  for (const r of results) {
    for (const issue of r.issues) {
      if (issue.suggestion) {
        recommendationsSet.add(issue.suggestion)
      }
    }
  }

  return {
    auditedAt: new Date().toISOString(),
    sampleSize: actualSampleSize,
    totalEligible,
    selectedAssetIds: sample.map((s) => s.id),
    passedAssets,
    failedAssets,
    passRate,
    results,
    rulePassRates,
    recommendations: Array.from(recommendationsSet),
    targetMet: passRate >= 85,
  }
}

