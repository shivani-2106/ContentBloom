/**
 * Automated Verification Script for ContentBloom AI Campaign Manager
 * Verifies Phases 1, 2, 3, and 4 requirements end-to-end.
 */

import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  addCampaignAsset,
  updateCampaignAsset,
  removeCampaignAsset,
  updateAssetStatus,
  associateExportedMedia,
  getCampaignStats,
  calculateScheduledDate,
  buildUtmUrl,
  getDefaultDestinationUrl,
  isRegisteredDestination,
  DEFAULT_RESOURCE_PATH,
  recordDemoVisit,
  getDemoVisits,
  getCampaignVisitStats,
  clearDemoVisits,
} from './campaignStorage.js'
import { runCampaignAudit, auditAsset } from './qualityAudit.js'
import { generateCampaignCsv } from './csvExporter.js'

// Mock localStorage in Node
const mockStorage = {}
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => {
    mockStorage[k] = String(v)
  },
  removeItem: (k) => {
    delete mockStorage[k]
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k])
  },
}

console.log('=====================================================')
console.log('CONTENTBLOOM AI — VERIFICATION SUITE')
console.log('=====================================================')

let passedTests = 0
let totalTests = 0

function assert(condition, testName) {
  totalTests++
  if (condition) {
    console.log(`[PASS] ${testName}`)
    passedTests++
  } else {
    console.error(`[FAIL] ${testName}`)
    process.exitCode = 1
  }
}

// -----------------------------------------------------------------
// TEST GROUP 1: Campaign Storage Engine (Phase 1)
// -----------------------------------------------------------------
console.log('\n--- 1. CAMPAIGN STORAGE ENGINE ---')

// 1.1 Create campaign
const campaign = createCampaign({
  name: 'IncuBrix 30-Day Growth Acceleration',
  topic: 'Automated Multi-Format AI Distribution',
  targetAudience: 'Growth Marketers & Founders',
  campaignGoal: 'lead_gen',
  startDate: '2026-10-30',
  durationDays: 30,
  destinationUrl: 'https://incubrix.com/growth',
  campaignSlug: 'incubrix-30day',
})

assert(campaign && campaign.id, 'Campaign creation returns valid campaign with ID')
assert(campaign.name === 'IncuBrix 30-Day Growth Acceleration', 'Campaign metadata saved correctly')

// 1.2 Read campaign
const fetched = getCampaignById(campaign.id)
assert(fetched && fetched.id === campaign.id, 'getCampaignById retrieves campaign by ID')
assert(getCampaigns().length === 1, 'getCampaigns retrieves all campaigns')

// 1.3 Add 30 scheduled assets
for (let i = 1; i <= 30; i++) {
  const platform = ['LinkedIn', 'Instagram', 'YouTube Shorts', 'Twitter / X'][(i - 1) % 4]
  const hook = `Hook ${i}: High-leverage content architecture for Day ${i}.`
  const caption = `Day ${i} caption body text explaining the strategic growth framework.\n\nKey takeaways:\n1. Hook\n2. Lesson\n3. Action`
  const body = platform === 'YouTube Shorts'
    ? `[00:00 - 00:05] Scene 1 (Hook): High-leverage distribution architecture for Day ${i}.\n[00:05 - 00:35] Scene 2 (Lesson): Here is the exact 3-step framework to automate your workflow.\n[00:35 - 00:50] Scene 3 (CTA): Explore the full blueprint at the link below.`
    : `Slide 1: Hook ${i}\nSlide 2: Framework\nSlide 3: Action`
  const cta = `Explore the full framework at the link below.`
  const utmUrl = buildUtmUrl('https://incubrix.com/growth', {
    utmSource: platform.toLowerCase().replace(/[^a-z0-9]/g, ''),
    utmMedium: 'social',
    utmCampaign: 'incubrix-30day',
    utmContent: `asset_${String(i).padStart(2, '0')}`,
  })

  addCampaignAsset(campaign.id, {
    dayNumber: i,
    platform,
    contentType: 'Thought Leadership Breakdown',
    title: `Day ${i} Asset`,
    hook,
    caption,
    body,
    callToAction: cta,
    scheduledTime: '09:00 AM EST',
    utmUrl,
    utmSource: platform.toLowerCase().replace(/[^a-z0-9]/g, ''),
    utmMedium: 'social',
    utmCampaign: 'incubrix-30day',
    status: 'Draft',
  })
}

const updatedCamp = getCampaignById(campaign.id)
assert(updatedCamp.assets.length === 30, 'Campaign contains exactly 30 scheduled asset records')

// 1.4 Asset updates & stability
const asset1 = updatedCamp.assets[0]
const updatedAsset1 = updateCampaignAsset(campaign.id, asset1.id, {
  hook: 'Updated Hook: Transforming AI ideas into viral distribution.',
})
assert(updatedAsset1.hook.includes('Updated Hook'), 'Asset field updated without losing identity')
assert(updatedAsset1.id === asset1.id, 'Asset ID remains stable after update')

// 1.5 Status updates
const approvedAsset = updateAssetStatus(campaign.id, asset1.id, 'Approved')
assert(approvedAsset.status === 'Approved', 'Asset status successfully updated to Approved')

// 1.6 Graceful handling of invalid storage
const approvedCampSnapshot = getCampaignById(campaign.id)
mockStorage['contentbloom_campaigns_v1'] = 'INVALID_JSON_CORRUPT{{{'
const safeRead = getCampaigns()
assert(Array.isArray(safeRead) && safeRead.length === 0, 'Gracefully handles corrupt storage without crashing')
// Restore mockStorage with the latest snapshot
mockStorage['contentbloom_campaigns_v1'] = JSON.stringify({ version: 1, campaigns: [approvedCampSnapshot] })

// -----------------------------------------------------------------
// TEST GROUP 2: 30-Day Content Calendar & Cross-Linking (Phase 2)
// -----------------------------------------------------------------
console.log('\n--- 2. 30-DAY CONTENT CALENDAR & CROSS-LINKING ---')

// 2.1 Date calculation & month/year boundaries
const d1 = calculateScheduledDate('2026-10-30', 1)
const d3 = calculateScheduledDate('2026-10-30', 3) // Oct 30 -> Oct 31 -> Nov 1
const d30 = calculateScheduledDate('2026-10-30', 30) // Oct 30 + 29 days = Nov 28
assert(d1 === '2026-10-30', 'Day 1 starts on campaign start date')
assert(d3 === '2026-11-01', 'Date correctly crosses October into November boundary')
assert(d30 === '2026-11-28', 'Day 30 correctly lands on November 28, 2026')

const yearBoundary = calculateScheduledDate('2026-12-25', 10) // Dec 25 + 9 days = Jan 3
assert(yearBoundary === '2027-01-03', 'Date correctly crosses December into January year boundary')

// 2.2 Cross-linking Graphic Export
associateExportedMedia(campaign.id, asset1.id, {
  type: 'graphic',
  metadata: {
    filename: 'ContentBloom_Instagram_Promotional_01.png',
    format: 'instagram_post',
    layout: 'promotional',
  },
})

// 2.3 Cross-linking Video Export with <= 60s validation
const asset3 = updatedCamp.assets[2] // YouTube Shorts
associateExportedMedia(campaign.id, asset3.id, {
  type: 'video',
  metadata: {
    filename: 'ContentBloom_Shorts_45s.webm',
    durationSeconds: 45,
    resolution: '1080x1920',
  },
})

const freshCamp = getCampaignById(campaign.id)
const freshAsset1 = freshCamp.assets.find((a) => a.id === asset1.id)
const freshAsset3 = freshCamp.assets.find((a) => a.id === asset3.id)

assert(freshAsset1.exportedGraphic?.filename === 'ContentBloom_Instagram_Promotional_01.png', 'Graphic export properly associated with Asset 1')
assert(freshAsset3.exportedVideo?.durationSeconds === 45, 'Video export (45s <= 60s) properly associated with Asset 3')

// 2.4 Accurate Export Counts (Drafts != Exported)
const statsAfterExports = getCampaignStats(freshCamp)
assert(statsAfterExports.exportedGraphics === 1, 'Only genuine exported graphics are counted (1)')
assert(statsAfterExports.exportedVideos === 1, 'Only genuine exported videos are counted (1)')
assert(statsAfterExports.drafts === 29, 'Draft count accurately reflects 29 drafts')
assert(statsAfterExports.approved === 1, 'Approved count accurately reflects 1 approved asset')

// -----------------------------------------------------------------
// TEST GROUP 3: Quality Audit Engine & CSV Export (Phase 3)
// -----------------------------------------------------------------
console.log('\n--- 3. QUALITY AUDIT ENGINE & CSV EXPORT ---')

// 3.1 Run Quality Audit with 20-asset sample
const audit = runCampaignAudit(freshCamp, 20, 42)
assert(audit.sampleSize === 20, 'Quality audit audited exactly 20 assets from the pool')
assert(audit.selectedAssetIds.length === 20, 'Discloses exactly 20 selected asset IDs')
assert(typeof audit.passRate === 'number' && audit.passRate >= 85, `Pass rate is calculated (${audit.passRate}%) and meets the >= 85% assessment target`)
assert(audit.results.length === 20, 'Per-asset results available for all 20 sampled assets')
assert(audit.rulePassRates.hook_strength >= 90, 'Hook strength rule check passed')
assert(audit.rulePassRates.utm_compliance === 100, 'UTM compliance rule check passed 100%')

// 3.2 CSV Export with 30 rows, UTF-8 BOM, and Unicode support
const csv = generateCampaignCsv(freshCamp)
assert(csv.charCodeAt(0) === 0xfeff, 'CSV begins with UTF-8 BOM for universal spreadsheet compatibility')
const lines = csv.split('\r\n').filter(Boolean)
assert(lines.length === 31, `CSV contains exactly header + 30 asset rows (Total lines: ${lines.length})`)
assert(csv.includes('ContentBloom_Instagram_Promotional_01.png'), 'CSV accurately contains graphic export status')
assert(csv.includes('ContentBloom_Shorts_45s.webm'), 'CSV accurately contains video export status')

// -----------------------------------------------------------------
// TEST GROUP 4: Connected Landing Page & UTM Telemetry (Phase 5)
// -----------------------------------------------------------------
console.log('\n--- 4. CONNECTED LANDING PAGE & UTM TELEMETRY ---')

// 4.1 Route & Default URL
assert(DEFAULT_RESOURCE_PATH === '/resources/growth-playbook', 'Default resource path is registered')
const defaultUrl = getDefaultDestinationUrl()
assert(defaultUrl.includes('/resources/growth-playbook'), `Default destination URL includes resource path (${defaultUrl})`)

// 4.2 Registered destination validation
assert(isRegisteredDestination(defaultUrl) === true, 'isRegisteredDestination verifies default connected resource URL')
assert(isRegisteredDestination('/resources/growth-playbook') === true, 'isRegisteredDestination verifies relative resource path')
assert(isRegisteredDestination('https://external-unknown-site.com') === false, 'isRegisteredDestination rejects unregistered external URL')
assert(isRegisteredDestination('https://incubrix.com/growth') === false, 'isRegisteredDestination rejects legacy external incubator placeholder')

// 4.3 buildUtmUrl generates verified route and preserves all 4 UTM parameters
const generatedCtaUrl = buildUtmUrl(DEFAULT_RESOURCE_PATH, {
  utmSource: 'linkedin',
  utmMedium: 'social',
  utmCampaign: 'growth-sprint-2026',
  utmContent: 'asset_01',
})
assert(isRegisteredDestination(generatedCtaUrl) === true, 'buildUtmUrl creates a verified internal destination URL')
assert(generatedCtaUrl.includes('utm_source=linkedin'), 'Preserves utm_source parameter')
assert(generatedCtaUrl.includes('utm_medium=social'), 'Preserves utm_medium parameter')
assert(generatedCtaUrl.includes('utm_campaign=growth-sprint-2026'), 'Preserves utm_campaign parameter')
assert(generatedCtaUrl.includes('utm_content=asset_01'), 'Preserves utm_content parameter')

// 4.4 Demo Visit Recording & Telemetry
clearDemoVisits()
assert(getDemoVisits().length === 0, 'clearDemoVisits resets demo visit collection')

const visit1 = recordDemoVisit({
  path: '/resources/growth-playbook',
  utmSource: 'linkedin',
  utmMedium: 'social',
  utmCampaign: 'growth-sprint-2026',
  utmContent: 'asset_01',
  campaignId: campaign.id,
  assetId: asset1.id,
})
assert(visit1 && visit1.id, 'recordDemoVisit successfully logs a visit with ID')
assert(visit1.isAttributed === true, 'Visit correctly marked as attributed')
assert(getDemoVisits().length === 1, 'getDemoVisits retrieves 1 logged visit')

// 4.5 Deduplication within 3s window (React 18 Strict Mode protection)
const dupVisit = recordDemoVisit({
  path: '/resources/growth-playbook',
  utmSource: 'linkedin',
  utmMedium: 'social',
  utmCampaign: 'growth-sprint-2026',
  utmContent: 'asset_01',
  campaignId: campaign.id,
  assetId: asset1.id,
})
assert(getDemoVisits().length === 1, 'Duplicate visit within 3s window safely ignored')

// 4.6 Missing / malformed UTM fallback
const directVisit = recordDemoVisit({
  path: '/resources/growth-playbook',
})
assert(directVisit.utmSource === 'direct' && directVisit.isAttributed === false, 'Missing UTM parameters fallback cleanly to direct/organic')
assert(getDemoVisits().length === 2, 'Direct visit logged successfully alongside attributed visit')

// 4.7 Campaign visit stats aggregation
const statsForCampaign = getCampaignVisitStats('growth-sprint-2026')
assert(statsForCampaign.totalVisits === 1, 'Campaign visit stats filters accurately by campaign slug')
assert(statsForCampaign.bySource.linkedin === 1, 'Accurately breaks down visits by source platform')

// 4.8 Context-Aware Asset Resolution & Resource Templates (Phase 6)
console.log('\n--- 4.8 CONTEXT-AWARE RESOURCE TEMPLATES ---')
import {
  resolveAssetFromUtm,
  resolveResourceTemplate,
  RESOURCE_TEMPLATES,
} from './resourceTemplates.js'

// Resolving asset from utm_content (exact, normalized, day-number)
const res1 = resolveAssetFromUtm([freshCamp], 'incubrix-30day', 'asset_01')
assert(res1.asset && res1.asset.dayNumber === 1, 'Resolves asset_01 to Day 1 asset via day-number / normalized matcher')

const res2 = resolveAssetFromUtm([freshCamp], 'incubrix-30day', res1.asset.id)
assert(res2.asset && res2.asset.id === res1.asset.id, 'Resolves exact asset identifier')

const res3 = resolveAssetFromUtm([freshCamp], 'incubrix-30day', 'asset_05')
assert(res3.asset && res3.asset.dayNumber === 5, 'Resolves day 5 asset from asset_05')

// Unknown or missing asset IDs
const resUnknown = resolveAssetFromUtm([freshCamp], 'incubrix-30day', 'asset_999')
assert(resUnknown.campaign && resUnknown.asset === null, 'Unknown asset ID safely returns null asset without throwing')

// Missing UTM parameters
const resMissing = resolveAssetFromUtm([freshCamp], '', '')
assert(resMissing.campaign && resMissing.asset === null, 'Missing UTM parameters return default campaign and null asset')

// Selecting relevant resource template based on CTA / Content
const checklistAsset = {
  callToAction: 'Want the verified campaign execution checklist? Check the resource link below.',
  title: 'Behind the Scenes Quality',
}
const template1 = resolveResourceTemplate(checklistAsset)
assert(template1.id === 'checklist', 'Selects checklist template when CTA mentions checklist')

const frameworkAsset = {
  callToAction: 'Want the step-by-step distribution framework? Access the complete framework below.',
  title: 'Framework & Blueprint',
}
const template2 = resolveResourceTemplate(frameworkAsset)
assert(template2.id === 'framework', 'Selects framework template when CTA mentions framework')

const teardownAsset = {
  callToAction: 'Want the complete ContentOps automation stack teardown? Check the link below.',
  title: 'Tech Stack & Teardown',
}
const template3 = resolveResourceTemplate(teardownAsset)
assert(template3.id === 'teardown_stack', 'Selects teardown_stack template when CTA mentions automation stack teardown')

const tipsAsset = {
  callToAction: 'Want the 7 high-leverage growth rules? Read the quick-tips breakdown below.',
  title: 'Contrarian Perspective',
}
const template4 = resolveResourceTemplate(tipsAsset)
assert(template4.id === 'quick_tips', 'Selects quick_tips template when CTA mentions growth rules')

const playbookAsset = {
  callToAction: 'Want the full tactical implementation playbook? Check the resource link below.',
  title: 'Tactical Playbook',
}
const template5 = resolveResourceTemplate(playbookAsset)
assert(template5.id === 'playbook_guide', 'Selects playbook_guide template when CTA mentions playbook')

// Ambiguous or missing asset fallback
const fallbackTemplate1 = resolveResourceTemplate(null)
assert(fallbackTemplate1.id === 'general_playbook', 'Null asset cleanly resolves to general_playbook master template')

const fallbackTemplate2 = resolveResourceTemplate({ callToAction: 'Click here for info' })
assert(fallbackTemplate2.id === 'general_playbook', 'Ambiguous CTA cleanly resolves to general_playbook master template')

// Explicit Day 1 vs Day 2 Distinct Content Verification
const demoCampaignForTest = initializeDemoCampaign()
const day1Resolution = resolveAssetFromUtm([demoCampaignForTest], 'incubrix-30day-growth', 'asset_01')
const day2Resolution = resolveAssetFromUtm([demoCampaignForTest], 'incubrix-30day-growth', 'asset_02')
assert(day1Resolution.asset && day1Resolution.asset.dayNumber === 1, 'Day 1 resolves to its actual asset record')
assert(day2Resolution.asset && day2Resolution.asset.dayNumber === 2, 'Day 2 resolves to its actual asset record')

const templateDay1 = resolveResourceTemplate(day1Resolution.asset)
const templateDay2 = resolveResourceTemplate(day2Resolution.asset)
assert(templateDay1.id === 'playbook_guide', `Day 1 resolves to playbook_guide (Got: ${templateDay1.id})`)
assert(templateDay2.id === 'framework', `Day 2 resolves to framework (Got: ${templateDay2.id})`)
assert(templateDay1.id !== templateDay2.id, 'Day 1 and Day 2 produce genuinely different resource templates')
assert(templateDay1.title !== templateDay2.title, 'Day 1 and Day 2 produce genuinely different resource titles')

// URL distinctness verification
const day1UtmUrl = demoCampaignForTest.assets[0].utmUrl
const day2UtmUrl = demoCampaignForTest.assets[1].utmUrl
assert(day1UtmUrl.includes('utm_content=asset_01'), 'Day 1 asset URL contains utm_content=asset_01')
assert(day2UtmUrl.includes('utm_content=asset_02'), 'Day 2 asset URL contains utm_content=asset_02')
assert(day1UtmUrl !== day2UtmUrl, 'Day 1 and Day 2 have distinct tracking URLs for Copy and Open actions')

// -----------------------------------------------------------------
// TEST GROUP 5: Demo Campaign Integrity & Palette Verification
// -----------------------------------------------------------------
console.log('\n--- 5. DEMO CAMPAIGN INTEGRITY & PALETTE TOKENS ---')

import { initializeDemoCampaign } from './campaignStorage.js'

const demoCampaign = initializeDemoCampaign()
assert(demoCampaign && demoCampaign.id === 'camp_incubrix_demo', 'Demo campaign initialized with stable ID')
assert(demoCampaign.assets.length === 30, 'Demo campaign contains exactly 30 scheduled assets')

const demoGraphics = demoCampaign.assets.filter((a) => a.exportedGraphic?.exportedAt)
assert(demoGraphics.length === 5, `Demo campaign contains exactly 5 exported graphics (Found: ${demoGraphics.length})`)
demoGraphics.forEach((g, idx) => {
  assert(g.exportedGraphic.filename.endsWith('.png'), `Graphic #${idx + 1} filename has valid .png extension (${g.exportedGraphic.filename})`)
})

const demoVideos = demoCampaign.assets.filter((a) => a.exportedVideo?.exportedAt)
assert(demoVideos.length === 10, `Demo campaign contains exactly 10 exported videos (Found: ${demoVideos.length})`)
demoVideos.forEach((v, idx) => {
  assert(v.exportedVideo.durationSeconds <= 60, `Video #${idx + 1} duration is <= 60s (${v.exportedVideo.durationSeconds}s) complying with Shorts constraints`)
  assert(v.exportedVideo.filename.endsWith('.webm'), `Video #${idx + 1} filename has valid .webm extension (${v.exportedVideo.filename})`)
})

// Verify CSV generated from Demo Campaign contains valid connected landing page URLs
const demoCsv = generateCampaignCsv(demoCampaign)
assert(demoCsv.includes('/resources/growth-playbook?utm_source='), 'Demo CSV Final_Tracked_URL column points to connected Growth Playbook resource')
assert(!demoCsv.includes('https://incubrix.com/growth'), 'Demo CSV contains zero unresolved incubator stub URLs')

// -----------------------------------------------------------------
// TEST GROUP 6: Delete and Cleanup Actions
// -----------------------------------------------------------------
console.log('\n--- 6. CLEANUP ACTIONS ---')
const assetToRemove = freshCamp.assets[freshCamp.assets.length - 1]
const removed = removeCampaignAsset(campaign.id, assetToRemove.id)
assert(removed === true, 'Single asset removed successfully')
assert(getCampaignById(campaign.id).assets.length === 29, 'Campaign asset count updated to 29')

const deleted1 = deleteCampaign(campaign.id)
assert(deleted1 === true, 'Test campaign deleted successfully')
const deleted2 = deleteCampaign(demoCampaign.id)
assert(deleted2 === true, 'Demo campaign deleted in cleanup successfully')
assert(getCampaigns().length === 0, 'No campaigns remaining after deletion')

console.log('\n=====================================================')
console.log(`VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`)
console.log('=====================================================')

if (passedTests === totalTests) {
  process.exit(0)
} else {
  process.exit(1)
}
