/**
 * Deterministic Resource Templates Engine for ContentBloom AI
 * Resolves campaign assets from UTM query parameters and selects
 * context-aware landing-page resource content matching the asset's CTA.
 *
 * Supported Resource Templates:
 * 1. playbook_guide   - Practical Implementation Guide & Operating Blueprint
 * 2. checklist        - Campaign Pre-Publishing Quality Checklist
 * 3. framework        - 5-Step Distribution Architecture Framework
 * 4. quick_tips       - 7 High-Leverage Multi-Platform Growth Rules
 * 5. teardown_stack   - ContentOps Tech Stack & Case Study Teardown
 * 6. general_playbook - Default Fallback Master Growth Playbook
 */

export const RESOURCE_TEMPLATES = {
  // ── 1. Practical Implementation Guide ──────────────────────────────────
  playbook_guide: {
    id: 'playbook_guide',
    typeLabel: 'Practical Implementation Guide',
    badge: 'Implementation Blueprint',
    badgeClass: 'bg-indigo-100 text-[#5145CD] border-indigo-200',
    icon: '📘',
    heroEyebrow: 'Tactical Execution Blueprint',
    title: 'The Campaign Implementation Guide',
    subtitle:
      'A battle-tested tactical roadmap for taking single-source content and executing an organized 30-day multi-platform publishing sprint without friction.',
    overview:
      'Execution fails when teams attempt to create each post from scratch. This implementation guide details the operational milestones needed to turn raw source material into 30 verified distribution assets.',
    milestones: [
      {
        phase: 'Phase 01',
        title: 'Core Thesis Calibration',
        deliverable: 'Master Source Document (600–1,000 words)',
        action:
          'Isolate the primary customer bottleneck, 1 quantitative proof point, and 3 actionable takeaways before generating any social variants.',
      },
      {
        phase: 'Phase 02',
        title: 'Multi-Format Adaptation',
        deliverable: 'Platform-Native Copy Packages',
        action:
          'Deconstruct the master source into tailored formats: structured 1–2 sentence blocks for LinkedIn, slide cards for Instagram, and 3-part scripts for Shorts.',
      },
      {
        phase: 'Phase 03',
        title: 'Media Asset Association',
        deliverable: '1080p Canvas PNGs & ≤60s WebM Clips',
        action:
          'Render high-contrast visual cards and vertical video storyboards. Associate media directly with campaign asset records.',
      },
      {
        phase: 'Phase 04',
        title: 'Attribution & Distribution',
        deliverable: 'Scheduler-Ready CSV with UTMs',
        action:
          'Tag all CTAs with verified source, medium, campaign, and content tags. Export calendar to social schedulers.',
      },
    ],
  },

  // ── 2. Campaign Pre-Publishing Checklist ───────────────────────────────
  checklist: {
    id: 'checklist',
    typeLabel: 'Execution Checklist',
    badge: 'Verified Checklist',
    badgeClass: 'bg-emerald-100 text-[#168568] border-emerald-200',
    icon: '✅',
    heroEyebrow: 'Pre-Flight Operations Checklist',
    title: 'Campaign Pre-Publishing Quality Checklist',
    subtitle:
      'A 6-point verification standard to inspect copy limits, hook pacing, media aspect ratios, and UTM parameters before live deployment.',
    overview:
      'Use this interactive checklist to verify asset readiness across all 4 platforms. Every check guarantees consistent delivery and eliminates broken links or pacing errors.',
    criteria: [
      {
        category: 'Copy & Hooks',
        requirement: 'Opening hook clarity (≥15 characters)',
        standard: 'Must hook reader within 3 seconds or dwell time collapses.',
      },
      {
        category: 'Tracking & UTM',
        requirement: 'Deterministic UTM query tags',
        standard: 'Must include utm_source, utm_medium, utm_campaign, and utm_content.',
      },
      {
        category: 'Short Video Media',
        requirement: 'Vertical 9:16 aspect ratio (≤60s)',
        standard: 'Must adhere strictly to YouTube Shorts / Reels duration constraints.',
      },
      {
        category: 'Visual Graphics',
        requirement: 'High-contrast 1080p canvas cards',
        standard: 'Readable on mobile screens with WCAG compliant text contrast.',
      },
      {
        category: 'Calendar Cadence',
        requirement: 'Optimal platform posting times',
        standard: 'Weekdays 08:30–09:45 AM for LinkedIn, 11:30 AM–01:15 PM for Instagram.',
      },
      {
        category: 'Scheduler CSV',
        requirement: 'RFC 4180 compliant export with UTF-8 BOM',
        standard: 'Opens in Excel or social schedulers without character encoding corruption.',
      },
    ],
  },

  // ── 3. 5-Step Distribution Architecture Framework ─────────────────────
  framework: {
    id: 'framework',
    typeLabel: 'Strategic Framework',
    badge: '5-Step Architecture',
    badgeClass: 'bg-violet-100 text-violet-800 border-violet-200',
    icon: '⚡',
    heroEyebrow: 'Strategic Architecture Blueprint',
    title: 'The 5-Step Content Distribution Framework',
    subtitle:
      'A repeatable operating system to turn substantive ideas into high-retention distribution across LinkedIn, Instagram, YouTube Shorts, and Twitter/X.',
    overview:
      'High-performing distribution is an engineering discipline, not guesswork. This 5-step framework standardizes the end-to-end journey from research to attribution.',
    steps: [
      {
        step: '01',
        name: 'Research & Core Thesis',
        tag: 'Foundation',
        headline: 'Identify high-leverage bottlenecks and audience friction points',
        description:
          'Validate the underlying thesis before generating distribution variants. Isolate 1 primary problem, 1 concrete framework, and 1 measurable outcome.',
      },
      {
        step: '02',
        name: 'Create the Master Source',
        tag: 'Substance',
        headline: 'Draft one comprehensive, uncompromised reference asset',
        description:
          'Write an authoritative piece of long-form source content. This document serves as the single source of truth for all downstream adaptations.',
      },
      {
        step: '03',
        name: 'Multi-Format Adaptation',
        tag: 'Repurpose',
        headline: 'Synthesize platform-native formats without generic copy-pasting',
        description:
          'Decompose the master source into tailored formats: structured 1–2 sentence paragraphs for LinkedIn, visual slide cards for Instagram carousels, and 3-part scripts for Shorts.',
      },
      {
        step: '04',
        name: 'Synchronized 30-Day Scheduling',
        tag: 'Distribution',
        headline: 'Orchestrate a continuous calendar cadence across peak engagement windows',
        description:
          'Systematically distribute assets across a 30-day timeline. Map high-depth thought leadership posts to weekday mornings, and retention shorts to afternoon algorithmic peaks.',
      },
      {
        step: '05',
        name: 'Attribute & Measure',
        tag: 'UTM Tracking',
        headline: 'Tag every destination link with granular UTM parameters',
        description:
          'Close the feedback loop between social impressions and qualified resource visits. Tag every CTA with verified source, medium, campaign, and content tags.',
      },
    ],
  },

  // ── 4. 7 High-Leverage Growth Rules ────────────────────────────────────
  quick_tips: {
    id: 'quick_tips',
    typeLabel: 'Actionable Growth Rules',
    badge: '7 Tactical Rules',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: '💡',
    heroEyebrow: 'Tactical Growth Guidelines',
    title: '7 High-Leverage Multi-Platform Growth Rules',
    subtitle:
      'Concise, actionable rules to maximize dwell time, engagement, and conversion across social distribution channels.',
    overview:
      'Avoid common distribution traps. These 7 core principles ensure your content cuts through algorithmic noise and drives measurable audience action.',
    rules: [
      {
        num: '01',
        title: 'Hook within 15 characters',
        detail:
          'Opening lines must deliver immediate tension, surprise, or quantitative proof. If the hook meanders, dwell time collapses.',
      },
      {
        num: '02',
        title: 'Never cross-post plain text unmodified',
        detail:
          'Each platform has unique formatting norms. Reformat copy with platform-native spacing, slide cards, or scene directions.',
      },
      {
        num: '03',
        title: 'Cap vertical video strictly at 60 seconds',
        detail:
          'Shorts and Reels penalize drag. Target a 15–45s sweet spot with kinetic text and timed audio transitions.',
      },
      {
        num: '04',
        title: 'Tag every CTA with deterministic UTMs',
        detail:
          'Never use unadorned links. Consistent UTM tags allow precise attribution from post-level engagement to destination traffic.',
      },
      {
        num: '05',
        title: 'Use 1–2 sentence line breaks on LinkedIn',
        detail:
          'Over 60% of professional dwell occurs on mobile devices. Dense paragraphs are skipped; structured whitespace is read.',
      },
      {
        num: '06',
        title: 'Pair visual slide decks with carousel hook covers',
        detail:
          'On Instagram, slide 1 acts as the billboard. Use high-contrast canvas graphics that demand a swipe.',
      },
      {
        num: '07',
        title: 'Publish on a synchronized calendar schedule',
        detail:
          'Erratic posting diminishes algorithmic reach. Maintain a steady 30-day cadence mapped to platform-optimal engagement hours.',
      },
    ],
  },

  // ── 5. ContentOps Tech Stack & Teardown ─────────────────────────────────
  teardown_stack: {
    id: 'teardown_stack',
    typeLabel: 'Tech Stack & Teardown',
    badge: 'ContentOps Teardown',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    icon: '🛠️',
    heroEyebrow: 'Architecture & Tooling Teardown',
    title: 'ContentOps Tech Stack & Automation Teardown',
    subtitle:
      'Inside the automated architecture that streamlines multi-format social distribution without bloated tooling or wasted manual hours.',
    overview:
      'Scaling distribution without scaling headcount requires an integrated ContentOps stack. Here is the exact architectural breakdown of modern content operations.',
    stackLayers: [
      {
        layer: 'Layer 1: Single Source of Truth',
        tooling: 'Master Draft & Core Thesis Ingestion',
        function:
          'Stores raw topic blueprints, problem statements, and key quantitative findings in structured JSON state.',
      },
      {
        layer: 'Layer 2: Multi-Format Synthesis Engine',
        tooling: 'Platform-Native Transformation Pipeline',
        function:
          'Automatically formats copy into 4 distinct distribution archetypes with tailored line breaks, hooks, and hashtags.',
      },
      {
        layer: 'Layer 3: Browser-Based Media Studios',
        tooling: 'HTML5 Canvas & MediaRecorder API',
        function:
          'Renders 1080p branded PNG cards and records 9:16 WebM vertical motion graphics directly in the client browser with Web Audio oscillators.',
      },
      {
        layer: 'Layer 4: Scheduling & Attribution Gateway',
        tooling: 'RFC 4180 CSV Exporter & UTM Telemetry',
        function:
          'Generates scheduler-ready CSV files encoded with UTF-8 BOM and verified landing page destination URLs.',
      },
    ],
  },

  // ── 6. General Fallback / Master Playbook ──────────────────────────────
  general_playbook: {
    id: 'general_playbook',
    typeLabel: 'Strategy Blueprint',
    badge: 'Master Blueprint',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: '📚',
    heroEyebrow: 'Strategy & Execution Blueprint',
    title: 'The Growth Marketing Playbook',
    subtitle:
      'How modern teams turn one long-form source idea into a complete, organized 30-day multi-platform social media campaign—without losing authenticity or wasting execution cycles.',
    overview:
      'A comprehensive reference guide for modern content creators, growth marketers, and founders looking to systematically build audience authority across platforms.',
  },
}

/**
 * Match a campaign asset from utm_content query parameter.
 * Handles exact IDs ("ASSET-01"), normalized IDs ("asset01"),
 * direct utmContent strings ("asset_01"), and explicit asset/day patterns ("asset_02", "day_02").
 */
export function isAssetMatch(asset, cleanContent) {
  if (!asset || !cleanContent) return false

  const assetId = String(asset.id || '').toLowerCase()
  const target = String(cleanContent).toLowerCase().trim()

  // 1. Exact string match on asset ID
  if (assetId === target) return true

  // 2. Direct utmContent field match
  if (asset.utmContent && String(asset.utmContent).toLowerCase() === target) {
    return true
  }

  // 3. Alphanumeric match (e.g. "asset01" === "asset01")
  const alphaAsset = assetId.replace(/[^a-z0-9]/g, '')
  const alphaTarget = target.replace(/[^a-z0-9]/g, '')
  if (alphaAsset && alphaAsset === alphaTarget) return true

  // 4. Pattern match: asset_XX or day_XX or asset-XX
  const patternMatch = target.match(/^(?:asset|day)[_-]?(\d+)$/)
  if (patternMatch) {
    const targetDay = parseInt(patternMatch[1], 10)
    if (Number(asset.dayNumber) === targetDay) return true
  }

  return false
}

/**
 * Resolve campaign and asset deterministically from UTM parameters.
 * Does not trust arbitrary query parameters as instructions.
 */
export function resolveAssetFromUtm(campaigns, utmCampaign, utmContent) {
  if (!Array.isArray(campaigns) || campaigns.length === 0) {
    return { campaign: null, asset: null, isFallback: true }
  }

  const cleanContent = utmContent ? String(utmContent).trim().toLowerCase() : ''
  const cleanCampaign = utmCampaign ? String(utmCampaign).trim().toLowerCase() : ''

  if (!cleanContent) {
    return { campaign: campaigns[0] || null, asset: null, isFallback: true }
  }

  // 1. Identify matching campaign using utm_campaign
  let matchedCampaign = null
  if (cleanCampaign) {
    matchedCampaign = campaigns.find(
      (c) =>
        (c.campaignSlug && c.campaignSlug.toLowerCase() === cleanCampaign) ||
        (c.id && c.id.toLowerCase() === cleanCampaign)
    )
  }

  // If campaign not matched by slug, search across all campaigns for the asset
  if (!matchedCampaign) {
    matchedCampaign = campaigns.find((c) =>
      c.assets?.some((a) => isAssetMatch(a, cleanContent))
    )
  }

  // Fallback to first campaign if none matched
  if (!matchedCampaign) {
    matchedCampaign = campaigns[0] || null
  }

  if (!matchedCampaign || !Array.isArray(matchedCampaign.assets)) {
    return { campaign: matchedCampaign, asset: null, isFallback: true }
  }

  // 2. Identify matching asset inside the matched campaign
  const matchedAsset =
    matchedCampaign.assets.find((a) => isAssetMatch(a, cleanContent)) || null

  return {
    campaign: matchedCampaign,
    asset: matchedAsset,
    isFallback: !matchedAsset,
  }
}

/**
 * Deterministic resource-selection function.
 * Evaluates asset CTA, title/pillar, and contentType to choose an appropriate template.
 * Crucially DOES NOT scan the generic caption/body text that contains shared keywords.
 * If asset is missing or ambiguous, returns general_playbook.
 */
export function resolveResourceTemplate(asset) {
  if (!asset) {
    return RESOURCE_TEMPLATES.general_playbook
  }

  // Primary signal: The explicit call-to-action promise made to the user
  const ctaText = String(asset.callToAction || asset.cta || '').toLowerCase()

  // Secondary signal: The post title/pillar and format
  const metaText = [asset.title || '', asset.contentType || ''].join(' ').toLowerCase()

  // 1. Checklist
  if (
    ctaText.includes('checklist') ||
    ctaText.includes('pre-flight') ||
    ctaText.includes('pre-publishing') ||
    ctaText.includes('audit criteria') ||
    metaText.includes('behind the scenes') ||
    metaText.includes('checklist')
  ) {
    return RESOURCE_TEMPLATES.checklist
  }

  // 2. Strategic Framework
  if (
    ctaText.includes('framework') ||
    ctaText.includes('distribution framework') ||
    metaText.includes('framework & blueprint') ||
    metaText.includes('framework diagram')
  ) {
    return RESOURCE_TEMPLATES.framework
  }

  // 3. Teardown & Tech Stack & Case Study
  if (
    ctaText.includes('teardown') ||
    ctaText.includes('tech stack') ||
    ctaText.includes('automation stack') ||
    ctaText.includes('case study') ||
    metaText.includes('tech stack & teardown') ||
    metaText.includes('social proof & case study') ||
    metaText.includes('case study') ||
    metaText.includes('teardown')
  ) {
    return RESOURCE_TEMPLATES.teardown_stack
  }

  // 4. Quick Tips & Growth Rules
  if (
    ctaText.includes('quick-tips') ||
    ctaText.includes('quick tips') ||
    ctaText.includes('growth rules') ||
    ctaText.includes('rules') ||
    metaText.includes('contrarian perspective') ||
    metaText.includes('contrarian hot take') ||
    metaText.includes('growth rules')
  ) {
    return RESOURCE_TEMPLATES.quick_tips
  }

  // 5. Playbook & Implementation Guide
  if (
    ctaText.includes('implementation guide') ||
    ctaText.includes('playbook') ||
    ctaText.includes('guide') ||
    metaText.includes('problem agitation') ||
    metaText.includes('tactical playbook') ||
    metaText.includes('thought leadership breakdown')
  ) {
    return RESOURCE_TEMPLATES.playbook_guide
  }

  // Ambiguous fallback
  return RESOURCE_TEMPLATES.general_playbook
}
