/**
 * CSV Exporter for ContentBloom AI Campaign Manager
 * Generates RFC 4180 compliant CSV files with full UTF-8 Unicode support
 * (including Tamil, emojis, and multiline text) for social media schedulers.
 */

/**
 * Escape a single CSV cell according to RFC 4180 rules.
 * If the cell contains quotes, commas, or newlines, enclose in quotes and double internal quotes.
 */
export function escapeCsvCell(value) {
  if (value === null || value === undefined) return '""'
  const str = String(value)
  // Double any existing double-quotes
  const escaped = str.replace(/"/g, '""')
  return `"${escaped}"`
}

/**
 * Generate scheduler-ready CSV content from campaign assets.
 */
export function generateCampaignCsv(campaign) {
  if (!campaign || !Array.isArray(campaign.assets)) {
    return ''
  }

  const headers = [
    'Campaign_Name',
    'Asset_ID',
    'Day_Number',
    'Scheduled_Date',
    'Scheduled_Time',
    'Platform',
    'Content_Type',
    'Title',
    'Hook',
    'Caption',
    'Body_Or_Script',
    'Call_To_Action',
    'Hashtags',
    'Status',
    'Destination_URL',
    'UTM_Source',
    'UTM_Medium',
    'UTM_Campaign',
    'Final_Tracked_URL',
    'Graphic_Export_Status',
    'Video_Export_Status',
  ]

  const rows = campaign.assets.map((asset) => {
    const graphicStatus = asset.exportedGraphic?.exportedAt
      ? `Exported (${asset.exportedGraphic.filename || 'PNG'})`
      : 'Not Exported'

    const videoStatus = asset.exportedVideo?.exportedAt
      ? `Exported (${asset.exportedVideo.durationSeconds || 0}s, ${asset.exportedVideo.filename || 'WebM'})`
      : 'Not Exported'

    return [
      escapeCsvCell(campaign.name || 'Campaign'),
      escapeCsvCell(asset.id),
      escapeCsvCell(asset.dayNumber),
      escapeCsvCell(asset.scheduledDate || ''),
      escapeCsvCell(asset.scheduledTime || ''),
      escapeCsvCell(asset.platform || ''),
      escapeCsvCell(asset.contentType || ''),
      escapeCsvCell(asset.title || ''),
      escapeCsvCell(asset.hook || ''),
      escapeCsvCell(asset.caption || ''),
      escapeCsvCell(asset.body || ''),
      escapeCsvCell(asset.callToAction || asset.cta || ''),
      escapeCsvCell(asset.hashtags || ''),
      escapeCsvCell(asset.status || 'Draft'),
      escapeCsvCell(campaign.destinationUrl || ''),
      escapeCsvCell(asset.utmSource || ''),
      escapeCsvCell(asset.utmMedium || 'social'),
      escapeCsvCell(asset.utmCampaign || campaign.campaignSlug || ''),
      escapeCsvCell(asset.utmUrl || asset.utmLink || ''),
      escapeCsvCell(graphicStatus),
      escapeCsvCell(videoStatus),
    ].join(',')
  })

  // Prepend UTF-8 BOM (\uFEFF) so Excel, Google Sheets, and other tools recognize UTF-8 Unicode
  return `\uFEFF${headers.join(',')}\r\n${rows.join('\r\n')}`
}

/**
 * Trigger browser download of CSV string.
 */
export function downloadCsvFile(csvContent, filename = 'contentbloom_campaign_calendar.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

