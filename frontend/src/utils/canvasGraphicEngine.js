/**
 * Canvas Graphic Engine for ContentBloom AI.
 *
 * Renders high-resolution, production-quality social media graphic cards
 * directly onto an HTML5 Canvas and exports genuine PNG files.
 *
 * Supports multiple content-aware layout archetypes:
 * - Promotional & Discount Cards
 * - Educational 3-Step Explainers
 * - Product Advertisements & Feature Spotlights
 * - Multi-Item Listicles & Checklists
 * - Major Announcements & Launch Alerts
 * - Infographics & Data Metric Callouts
 * - Classic Minimal Thought-Leadership Cards
 */

export const GRAPHIC_FORMATS = {
  instagram_post: {
    id: 'instagram_post',
    label: 'Instagram Square Post',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    badge: '1080 × 1080',
  },
  instagram_story: {
    id: 'instagram_story',
    label: 'Instagram Story / Reel Cover',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    badge: '1080 × 1920',
  },
  linkedin_graphic: {
    id: 'linkedin_graphic',
    label: 'LinkedIn Feed Graphic',
    width: 1200,
    height: 628,
    aspectRatio: '1.91:1',
    badge: '1200 × 628',
  },
  youtube_thumbnail: {
    id: 'youtube_thumbnail',
    label: 'YouTube Thumbnail',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    badge: '1280 × 720',
  },
  carousel_slide: {
    id: 'carousel_slide',
    label: 'Carousel Slide (Portrait)',
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    badge: '1080 × 1350',
  },
}

export const GRAPHIC_THEMES = {
  modern_minimal: {
    id: 'modern_minimal',
    label: 'Modern Minimalist',
    bgStart: '#0f172a',
    bgEnd: '#1e293b',
    primary: '#38bdf8',
    text: '#ffffff',
    subtext: '#94a3b8',
    accent: '#0ea5e9',
    cardBg: 'rgba(30, 41, 59, 0.72)',
    border: 'rgba(255, 255, 255, 0.15)',
  },
  gradient_vibrant: {
    id: 'gradient_vibrant',
    label: 'Vibrant Mesh Gradient',
    bgStart: '#4338ca',
    bgEnd: '#701a75',
    primary: '#38bdf8',
    text: '#ffffff',
    subtext: '#e0e7ff',
    accent: '#f43f5e',
    cardBg: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.22)',
  },
  tech_cyber: {
    id: 'tech_cyber',
    label: 'Cyberpunk Tech',
    bgStart: '#030712',
    bgEnd: '#111827',
    primary: '#22d3ee',
    text: '#f9fafb',
    subtext: '#9ca3af',
    accent: '#a855f7',
    cardBg: 'rgba(17, 24, 39, 0.88)',
    border: 'rgba(34, 211, 238, 0.28)',
  },
  editorial_light: {
    id: 'editorial_light',
    label: 'Editorial Clean Light',
    bgStart: '#f8fafc',
    bgEnd: '#e2e8f0',
    primary: '#0284c7',
    text: '#0f172a',
    subtext: '#475569',
    accent: '#d97706',
    cardBg: '#ffffff',
    border: 'rgba(15, 23, 42, 0.12)',
  },
  warm_creator: {
    id: 'warm_creator',
    label: 'Creator Sunset',
    bgStart: '#831843',
    bgEnd: '#4c0519',
    primary: '#fbbf24',
    text: '#ffffff',
    subtext: '#fbcfe8',
    accent: '#fb7185',
    cardBg: 'rgba(255, 255, 255, 0.14)',
    border: 'rgba(251, 191, 36, 0.25)',
  },
  emerald_growth: {
    id: 'emerald_growth',
    label: 'Emerald Growth',
    bgStart: '#064e3b',
    bgEnd: '#022c22',
    primary: '#34d399',
    text: '#ffffff',
    subtext: '#a7f3d0',
    accent: '#fbbf24',
    cardBg: 'rgba(6, 78, 59, 0.65)',
    border: 'rgba(52, 211, 153, 0.25)',
  },
  ocean_breeze: {
    id: 'ocean_breeze',
    label: 'Oceanic Sapphire',
    bgStart: '#0c4a6e',
    bgEnd: '#082f49',
    primary: '#2dd4bf',
    text: '#ffffff',
    subtext: '#bae6fd',
    accent: '#38bdf8',
    cardBg: 'rgba(12, 74, 110, 0.7)',
    border: 'rgba(45, 212, 191, 0.25)',
  },
}

export const GRAPHIC_LAYOUTS = {
  promotional: {
    id: 'promotional',
    label: 'Promotional & Offer Card',
    icon: '⚡',
    description: 'High-converting promo with deal callout, benefit pills, and prominent CTA button.',
  },
  educational_explainer: {
    id: 'educational_explainer',
    label: '3-Step Educational Breakdown',
    icon: '📚',
    description: 'Structured framework with numbered modules [01, 02, 03] and key insight takeaway.',
  },
  product_ad: {
    id: 'product_ad',
    label: 'Product Ad & Feature Showcase',
    icon: '🚀',
    description: 'Commercial layout with rating social proof, feature checklist, and conversion CTA.',
  },
  listicle: {
    id: 'listicle',
    label: 'Actionable Listicle / Checklist',
    icon: '📋',
    description: 'Multi-point checklist with numbered bullet cards and swipe prompt.',
  },
  announcement: {
    id: 'announcement',
    label: 'Breaking Announcement / Launch',
    icon: '📣',
    description: 'Spotlight alert banner, live status pill, high-contrast headline, and news breakdown.',
  },
  infographic: {
    id: 'infographic',
    label: 'Infographic & Metric Callout',
    icon: '📊',
    description: 'Data-driven visualizer with giant hero metric (+240%), visual bar, and dual stats.',
  },
  minimal_card: {
    id: 'minimal_card',
    label: 'Minimal Thought-Leadership Card',
    icon: '📐',
    description: 'Classic editorial quote card with sleek typography and subtle branding.',
  },
}

function wrapText(ctx, text, maxWidth) {
  if (!text) return []
  const words = text.split(/\s+/)
  const lines = []
  let currentLine = words[0] || ''

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const testLine = `${currentLine} ${word}`
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) {
    lines.push(currentLine)
  }
  return lines
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius)
  } else {
    ctx.rect(x, y, width, height)
  }
}

/**
 * Draws a professional graphic onto canvas.
 */
export function drawGraphicToCanvas(canvasOrOptions, maybeOptions = {}) {
  let canvas = canvasOrOptions
  let options = maybeOptions

  if (
    canvasOrOptions &&
    typeof canvasOrOptions === 'object' &&
    typeof canvasOrOptions.getContext !== 'function'
  ) {
    canvas = canvasOrOptions.canvas
    options = canvasOrOptions
  }

  if (!canvas || typeof canvas.getContext !== 'function') {
    return null
  }

  const formatId = options.formatId || options.formatKey || 'instagram_post'
  const themeId = options.themeId || options.themeKey || 'modern_minimal'
  const layoutType =
    options.layoutType || options.contentFormat || options.formatArchetype || 'promotional'

  const headline = options.headline || 'Transform One Idea Into Content Everywhere'
  const subhead = options.subhead || ''
  const tag = options.tag || options.badge || 'GROWTH INSIGHT'
  const author = options.author || '@contentbloom.ai'
  const metricCallout = options.metricCallout || options.metric_callout || '+140% GROWTH'
  const ctaText = options.ctaText || options.cta_text || 'CLAIM YOUR GUIDE ➔'

  let keyPoints = options.keyPoints || options.key_points || []
  if (!Array.isArray(keyPoints) || keyPoints.length === 0) {
    keyPoints = [
      'Engineered for maximum retention and readability',
      'Multi-format composition tailored to social platforms',
      'Clear visual hierarchy with actionable takeaways',
    ]
  }

  const slideIndicator =
    options.slideIndicator ||
    (options.slideNumber && options.totalSlides
      ? `${options.slideNumber} / ${options.totalSlides}`
      : null)

  const format = GRAPHIC_FORMATS[formatId] || GRAPHIC_FORMATS.instagram_post
  const baseTheme = GRAPHIC_THEMES[themeId] || GRAPHIC_THEMES.modern_minimal

  // Allow custom brand colors if provided
  const theme = {
    ...baseTheme,
    primary: options.brandColorPrimary || options.brand_color_primary || baseTheme.primary,
    accent: options.brandColorAccent || options.brand_color_accent || baseTheme.accent,
  }

  canvas.width = format.width
  canvas.height = format.height

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const W = format.width
  const H = format.height
  const isLandscape = W > H * 1.3
  const isStory = H > W * 1.5

  // 0. Clear canvas
  ctx.clearRect(0, 0, W, H)

  // 1. Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, theme.bgStart)
  grad.addColorStop(1, theme.bgEnd)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // 2. Ambient decorative shapes & mesh glow
  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.fillStyle = theme.primary
  ctx.beginPath()
  ctx.arc(W * 0.85, H * 0.15, W * 0.38, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = theme.accent
  ctx.beginPath()
  ctx.arc(W * 0.12, H * 0.88, W * 0.42, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 3. Grid / Dot Texture in background
  ctx.save()
  ctx.globalAlpha = 0.05
  ctx.fillStyle = '#ffffff'
  const step = 48
  for (let x = 24; x < W; x += step) {
    for (let y = 24; y < H; y += step) {
      ctx.beginPath()
      ctx.arc(x, y, 1.8, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()

  // 4. Inner Card Frame
  const margin = Math.round(W * (isLandscape ? 0.05 : 0.07))
  const cardW = W - margin * 2
  const cardH = H - margin * 2

  ctx.save()
  ctx.fillStyle = theme.cardBg
  ctx.strokeStyle = theme.border || 'rgba(255, 255, 255, 0.15)'
  ctx.lineWidth = 2
  drawRoundedRect(ctx, margin, margin, cardW, cardH, 32)
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  const contentLeft = margin + Math.round(cardW * 0.07)
  const contentWidth = cardW - Math.round(cardW * 0.14)
  const contentTop = margin + Math.round(cardH * 0.08)
  const footerY = margin + cardH - Math.round(cardH * 0.07)

  // 5. Header Bar (Badge pill & slide tracker)
  let curY = contentTop
  ctx.save()
  ctx.font = 'bold 22px Inter, system-ui, sans-serif'
  const tagText = (tag || 'GROWTH FRAMEWORK').toUpperCase()
  const badgeMetrics = ctx.measureText(tagText)
  const badgeW = badgeMetrics.width + 36
  const badgeH = 40

  ctx.fillStyle = theme.primary
  drawRoundedRect(ctx, contentLeft, curY - 26, badgeW, badgeH, 20)
  ctx.fill()

  ctx.fillStyle =
    theme.id === 'editorial_light' || themeId === 'editorial_light'
      ? '#ffffff'
      : '#0f172a'
  ctx.fillText(tagText, contentLeft + 18, curY)

  // Right Header: Slide tracker or format badge
  const rightTag = slideIndicator || GRAPHIC_LAYOUTS[layoutType]?.label || 'CONTENTBLOOM'
  ctx.font = 'bold 20px Inter, system-ui, sans-serif'
  ctx.fillStyle = theme.subtext
  const rightTagW = ctx.measureText(rightTag).width
  ctx.fillText(rightTag, contentLeft + contentWidth - rightTagW, curY)
  ctx.restore()

  curY += Math.round(cardH * (isLandscape ? 0.1 : 0.08))

  // 6. RENDER CONTENT-AWARE LAYOUTS
  if (layoutType === 'promotional') {
    // --- PROMOTIONAL LAYOUT ---
    // Big headline
    ctx.save()
    const headSize = isLandscape ? 44 : isStory ? 52 : 48
    ctx.font = `bold ${headSize}px Inter, system-ui, sans-serif`
    ctx.fillStyle = theme.text
    const headLines = wrapText(ctx, headline, contentWidth)
    const lineH = Math.round(headSize * 1.25)
    for (const line of headLines.slice(0, 3)) {
      ctx.fillText(line, contentLeft, curY)
      curY += lineH
    }
    ctx.restore()

    curY += 12

    // Supporting subhead
    if (subhead) {
      ctx.save()
      const subSize = isLandscape ? 22 : 24
      ctx.font = `500 ${subSize}px Inter, system-ui, sans-serif`
      ctx.fillStyle = theme.subtext
      const subLines = wrapText(ctx, subhead, contentWidth)
      for (const line of subLines.slice(0, 2)) {
        ctx.fillText(line, contentLeft, curY)
        curY += subSize * 1.4
      }
      ctx.restore()
      curY += 16
    }

    // High Impact Deal / Metric Callout Box
    const boxH = isLandscape ? 70 : isStory ? 110 : 90
    ctx.save()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.strokeStyle = theme.primary
    ctx.lineWidth = 2
    drawRoundedRect(ctx, contentLeft, curY, contentWidth, boxH, 20)
    ctx.fill()
    ctx.stroke()

    // Metric text inside box
    ctx.fillStyle = theme.primary
    ctx.font = `900 ${isLandscape ? 32 : 40}px Inter, system-ui, sans-serif`
    ctx.fillText(metricCallout, contentLeft + 24, curY + (isLandscape ? 44 : 58))

    ctx.font = '600 20px Inter, system-ui, sans-serif'
    ctx.fillStyle = theme.text
    ctx.fillText(
      'Special Verified Blueprint • Instant Download',
      contentLeft + 24,
      curY + (isLandscape ? 44 : 58) + 28
    )
    ctx.restore()

    curY += boxH + 20

    // Feature bullet pills
    const bulletsToShow = keyPoints.slice(0, isLandscape ? 2 : 3)
    for (const pt of bulletsToShow) {
      ctx.save()
      ctx.fillStyle = theme.accent
      ctx.beginPath()
      ctx.arc(contentLeft + 14, curY - 6, 8, 0, Math.PI * 2)
      ctx.fill()

      ctx.font = '600 22px Inter, system-ui, sans-serif'
      ctx.fillStyle = theme.text
      const lines = wrapText(ctx, pt, contentWidth - 40)
      ctx.fillText(lines[0] || pt, contentLeft + 36, curY)
      curY += 36
      ctx.restore()
    }

    // Prominent CTA Button Box
    curY = Math.max(curY + 16, footerY - 95)
    ctx.save()
    const btnW = Math.min(contentWidth, 420)
    const btnH = 56
    ctx.fillStyle = theme.primary
    ctx.shadowColor = theme.primary
    ctx.shadowBlur = 16
    drawRoundedRect(ctx, contentLeft, curY, btnW, btnH, 28)
    ctx.fill()

    ctx.shadowBlur = 0
    ctx.font = 'bold 22px Inter, system-ui, sans-serif'
    ctx.fillStyle =
      theme.id === 'editorial_light' || themeId === 'editorial_light'
        ? '#ffffff'
        : '#0f172a'
    ctx.textAlign = 'center'
    ctx.fillText(ctaText, contentLeft + btnW / 2, curY + 36)
    ctx.restore()

  } else if (layoutType === 'educational_explainer') {
    // --- 3-STEP EDUCATIONAL EXPLAINER ---
    ctx.save()
    const headSize = isLandscape ? 38 : isStory ? 48 : 44
    ctx.font = `bold ${headSize}px Inter, system-ui, sans-serif`
    ctx.fillStyle = theme.text
    const headLines = wrapText(ctx, headline, contentWidth)
    const lineH = Math.round(headSize * 1.25)
    for (const line of headLines.slice(0, 2)) {
      ctx.fillText(line, contentLeft, curY)
      curY += lineH
    }
    ctx.restore()

    curY += 16

    // Render 3 Step Cards [01, 02, 03]
    const steps = keyPoints.slice(0, 3)
    const cardSpacing = isLandscape ? 12 : isStory ? 24 : 16
    const stepCardH = isLandscape ? 74 : isStory ? 140 : 100

    steps.forEach((stepText, idx) => {
      ctx.save()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.strokeStyle = idx === 0 ? theme.primary : 'rgba(255, 255, 255, 0.12)'
      ctx.lineWidth = 1.5
      drawRoundedRect(ctx, contentLeft, curY, contentWidth, stepCardH, 18)
      ctx.fill()
      ctx.stroke()

      // Step Number Badge (01, 02, 03)
      const numBadgeSize = 44
      ctx.fillStyle = idx === 0 ? theme.primary : theme.accent
      drawRoundedRect(ctx, contentLeft + 16, curY + (stepCardH - numBadgeSize) / 2, numBadgeSize, numBadgeSize, 12)
      ctx.fill()

      ctx.font = 'bold 20px Inter, system-ui, sans-serif'
      ctx.fillStyle = '#0f172a'
      ctx.textAlign = 'center'
      ctx.fillText(`0${idx + 1}`, contentLeft + 16 + numBadgeSize / 2, curY + stepCardH / 2 + 7)

      // Step text
      ctx.textAlign = 'left'
      ctx.font = 'bold 22px Inter, system-ui, sans-serif'
      ctx.fillStyle = theme.text
      const textX = contentLeft + 76
      const textMaxW = contentWidth - 96
      const lines = wrapText(ctx, stepText, textMaxW)

      let lineY = curY + (lines.length === 1 ? stepCardH / 2 + 7 : stepCardH / 2 - 8)
      for (const line of lines.slice(0, 2)) {
        ctx.fillText(line, textX, lineY)
        lineY += 28
      }
      ctx.restore()

      curY += stepCardH + cardSpacing
    })

    // Key takeaway pill
    if (subhead && !isLandscape) {
      curY = Math.max(curY + 8, footerY - 75)
      ctx.save()
      ctx.font = 'italic 500 20px Inter, system-ui, sans-serif'
      ctx.fillStyle = theme.subtext
      const subLines = wrapText(ctx, `💡 Takeaway: ${subhead}`, contentWidth)
      ctx.fillText(subLines[0] || subhead, contentLeft, curY)
      ctx.restore()
    }

  } else if (layoutType === 'product_ad') {
    // --- PRODUCT ADVERTISEMENT & SHOWCASE ---
    ctx.save()
    const headSize = isLandscape ? 42 : isStory ? 52 : 46
    ctx.font = `bold ${headSize}px Inter, system-ui, sans-serif`
    ctx.fillStyle = theme.text
    const headLines = wrapText(ctx, headline, contentWidth)
    for (const line of headLines.slice(0, 2)) {
      ctx.fillText(line, contentLeft, curY)
      curY += Math.round(headSize * 1.25)
    }
    ctx.restore()

    curY += 12

    // Rating & Social Proof Bar
    ctx.save()
    ctx.font = 'bold 24px Inter, system-ui, sans-serif'
    ctx.fillStyle = '#fbbf24' // gold stars
    ctx.fillText('★★★★★', contentLeft, curY)
    ctx.font = '600 20px Inter, system-ui, sans-serif'
    ctx.fillStyle = theme.subtext
    ctx.fillText('4.9/5 Rating • 10,000+ Founders & Creators', contentLeft + 140, curY)
    ctx.restore()

    curY += 28

    // Feature Showcase Card
    const featH = isLandscape ? 120 : isStory ? 240 : 180
    ctx.save()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.strokeStyle = theme.border
    ctx.lineWidth = 1.5
    drawRoundedRect(ctx, contentLeft, curY, contentWidth, featH, 22)
    ctx.fill()
    ctx.stroke()

    // 3 Feature Checkmarks inside showcase
    let innerY = curY + (isLandscape ? 34 : 44)
    const features = keyPoints.slice(0, 3)
    for (const feat of features) {
      ctx.font = 'bold 22px Inter, system-ui, sans-serif'
      ctx.fillStyle = theme.primary
      ctx.fillText('✓', contentLeft + 24, innerY)

      ctx.fillStyle = theme.text
      ctx.font = '500 21px Inter, system-ui, sans-serif'
      const fLines = wrapText(ctx, feat, contentWidth - 60)
      ctx.fillText(fLines[0] || feat, contentLeft + 54, innerY)
      innerY += isLandscape ? 30 : 42
    }
    ctx.restore()

    curY += featH + 24

    // Standout CTA Button
    curY = Math.max(curY, footerY - 95)
    ctx.save()
    const btnW = Math.min(contentWidth, 400)
    const btnH = 56
    ctx.fillStyle = theme.accent
    ctx.shadowColor = theme.accent
    ctx.shadowBlur = 14
    drawRoundedRect(ctx, contentLeft, curY, btnW, btnH, 28)
    ctx.fill()

    ctx.shadowBlur = 0
    ctx.font = 'bold 22px Inter, system-ui, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.fillText(ctaText, contentLeft + btnW / 2, curY + 36)
    ctx.restore()

  } else if (layoutType === 'listicle') {
    // --- LISTICLE / CHECKLIST ---
    ctx.save()
    const headSize = isLandscape ? 38 : isStory ? 48 : 44
    ctx.font = `bold ${headSize}px Inter, system-ui, sans-serif`
    ctx.fillStyle = theme.text
    const headLines = wrapText(ctx, headline, contentWidth)
    for (const line of headLines.slice(0, 2)) {
      ctx.fillText(line, contentLeft, curY)
      curY += Math.round(headSize * 1.25)
    }
    ctx.restore()

    curY += 16

    // Numbered Item Rows
    const items = keyPoints.slice(0, isLandscape ? 3 : isStory ? 5 : 4)
    const rowH = isLandscape ? 48 : isStory ? 84 : 64
    items.forEach((itemText, idx) => {
      ctx.save()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      drawRoundedRect(ctx, contentLeft, curY, contentWidth, rowH, 14)
      ctx.fill()
      ctx.stroke()

      // Number pill
      ctx.fillStyle = theme.primary
      drawRoundedRect(ctx, contentLeft + 12, curY + (rowH - 34) / 2, 34, 34, 8)
      ctx.fill()

      ctx.font = 'bold 18px Inter, system-ui, sans-serif'
      ctx.fillStyle = '#0f172a'
      ctx.textAlign = 'center'
      ctx.fillText(`${idx + 1}`, contentLeft + 29, curY + rowH / 2 + 6)

      // Item text
      ctx.textAlign = 'left'
      ctx.font = '600 21px Inter, system-ui, sans-serif'
      ctx.fillStyle = theme.text
      const textLines = wrapText(ctx, itemText, contentWidth - 70)
      ctx.fillText(textLines[0] || itemText, contentLeft + 60, curY + rowH / 2 + 7)
      ctx.restore()

      curY += rowH + (isLandscape ? 8 : 14)
    })

    // Swipe prompt at bottom
    if (!isLandscape) {
      curY = Math.max(curY, footerY - 60)
      ctx.save()
      ctx.font = 'bold 20px Inter, system-ui, sans-serif'
      ctx.fillStyle = theme.primary
      ctx.fillText('👉 Swipe to save this checklist for later', contentLeft, curY)
      ctx.restore()
    }

  } else if (layoutType === 'announcement') {
    // --- BREAKING ANNOUNCEMENT / LAUNCH ---
    // Alert banner
    ctx.save()
    ctx.fillStyle = theme.accent
    drawRoundedRect(ctx, contentLeft, curY - 10, 180, 36, 18)
    ctx.fill()

    ctx.font = 'bold 18px Inter, system-ui, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('🚨 JUST RELEASED', contentLeft + 16, curY + 14)
    ctx.restore()

    curY += 52

    // Giant Headline
    ctx.save()
    const headSize = isLandscape ? 44 : isStory ? 54 : 48
    ctx.font = `900 ${headSize}px Inter, system-ui, sans-serif`
    ctx.fillStyle = theme.text
    const headLines = wrapText(ctx, headline, contentWidth)
    for (const line of headLines.slice(0, 3)) {
      ctx.fillText(line, contentLeft, curY)
      curY += Math.round(headSize * 1.25)
    }
    ctx.restore()

    curY += 16

    // Spotlight Box
    const spotH = isLandscape ? 90 : isStory ? 180 : 130
    ctx.save()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.strokeStyle = theme.primary
    ctx.lineWidth = 2
    drawRoundedRect(ctx, contentLeft, curY, contentWidth, spotH, 22)
    ctx.fill()
    ctx.stroke()

    ctx.font = 'bold 24px Inter, system-ui, sans-serif'
    ctx.fillStyle = theme.primary
    ctx.fillText('✨ WHAT\'S NEW & INCLUDED:', contentLeft + 24, curY + 38)

    const bullets = keyPoints.slice(0, 2)
    let bY = curY + 72
    for (const b of bullets) {
      ctx.font = '500 21px Inter, system-ui, sans-serif'
      ctx.fillStyle = theme.text
      const bLines = wrapText(ctx, `• ${b}`, contentWidth - 48)
      ctx.fillText(bLines[0] || b, contentLeft + 24, bY)
      bY += 30
    }
    ctx.restore()

    curY += spotH + 24

    // Action banner
    curY = Math.max(curY, footerY - 85)
    ctx.save()
    ctx.font = 'bold 22px Inter, system-ui, sans-serif'
    ctx.fillStyle = theme.primary
    ctx.fillText(`${ctaText} ➔`, contentLeft, curY)
    ctx.restore()

  } else if (layoutType === 'infographic') {
    // --- INFOGRAPHIC & DATA METRICS ---
    ctx.save()
    const headSize = isLandscape ? 36 : isStory ? 46 : 42
    ctx.font = `bold ${headSize}px Inter, system-ui, sans-serif`
    ctx.fillStyle = theme.text
    const headLines = wrapText(ctx, headline, contentWidth)
    for (const line of headLines.slice(0, 2)) {
      ctx.fillText(line, contentLeft, curY)
      curY += Math.round(headSize * 1.25)
    }
    ctx.restore()

    curY += 16

    // Massive Hero Metric
    ctx.save()
    const heroSize = isLandscape ? 64 : isStory ? 92 : 80
    ctx.font = `900 ${heroSize}px Inter, system-ui, sans-serif`
    ctx.fillStyle = theme.primary
    ctx.fillText(metricCallout, contentLeft, curY + heroSize * 0.75)
    curY += heroSize + 12

    ctx.font = '600 22px Inter, system-ui, sans-serif'
    ctx.fillStyle = theme.text
    ctx.fillText('Reported Efficiency & Engagement Uplift', contentLeft, curY)
    ctx.restore()

    curY += 24

    // Visual Progress Bar
    ctx.save()
    const barH = 16
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
    drawRoundedRect(ctx, contentLeft, curY, contentWidth, barH, 8)
    ctx.fill()

    const fillGrad = ctx.createLinearGradient(contentLeft, 0, contentLeft + contentWidth * 0.85, 0)
    fillGrad.addColorStop(0, theme.primary)
    fillGrad.addColorStop(1, theme.accent)
    ctx.fillStyle = fillGrad
    drawRoundedRect(ctx, contentLeft, curY, contentWidth * 0.85, barH, 8)
    ctx.fill()
    ctx.restore()

    curY += 36

    // Dual Stats Grid
    const dualW = (contentWidth - 20) / 2
    const dualH = isLandscape ? 60 : 80

    ctx.save()
    // Box 1
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    drawRoundedRect(ctx, contentLeft, curY, dualW, dualH, 16)
    ctx.fill()
    ctx.stroke()

    ctx.font = '900 28px Inter, system-ui, sans-serif'
    ctx.fillStyle = theme.accent
    ctx.fillText('10x', contentLeft + 18, curY + 36)
    ctx.font = '500 18px Inter, system-ui, sans-serif'
    ctx.fillStyle = theme.subtext
    ctx.fillText('Speed Multiplier', contentLeft + 18, curY + 62)

    // Box 2
    drawRoundedRect(ctx, contentLeft + dualW + 20, curY, dualW, dualH, 16)
    ctx.fill()
    ctx.stroke()

    ctx.font = '900 28px Inter, system-ui, sans-serif'
    ctx.fillStyle = theme.primary
    ctx.fillText('99.4%', contentLeft + dualW + 38, curY + 36)
    ctx.font = '500 18px Inter, system-ui, sans-serif'
    ctx.fillStyle = theme.subtext
    ctx.fillText('Accuracy Rate', contentLeft + dualW + 38, curY + 62)
    ctx.restore()

  } else {
    // --- CLASSIC MINIMAL CARD (Default Fallback) ---
    ctx.save()
    const headlineSize = isLandscape ? 44 : W <= 1080 ? 54 : 60
    ctx.font = `bold ${headlineSize}px Inter, system-ui, sans-serif`
    ctx.fillStyle = theme.text
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 3

    const headlineLines = wrapText(ctx, headline, contentWidth)
    const lineHeight = Math.round(headlineSize * 1.25)

    for (const line of headlineLines.slice(0, 4)) {
      ctx.fillText(line, contentLeft, curY)
      curY += lineHeight
    }
    ctx.restore()

    curY += 24

    // Accent Divider Bar
    ctx.save()
    ctx.fillStyle = theme.accent
    ctx.fillRect(contentLeft, curY, 80, 6)
    ctx.restore()

    curY += 40

    // Subhead / Supporting Copy
    if (subhead) {
      ctx.save()
      const subheadSize = Math.round(headlineSize * 0.48)
      ctx.font = `500 ${subheadSize}px Inter, system-ui, sans-serif`
      ctx.fillStyle = theme.subtext
      const subLines = wrapText(ctx, subhead, contentWidth)
      const subLineHeight = Math.round(subheadSize * 1.45)

      for (const line of subLines.slice(0, 5)) {
        ctx.fillText(line, contentLeft, curY)
        curY += subLineHeight
      }
      ctx.restore()
    }
  }

  // 7. Footer: Brand handle and Watermark
  ctx.save()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(contentLeft, footerY - 28)
  ctx.lineTo(contentLeft + contentWidth, footerY - 28)
  ctx.stroke()

  ctx.font = 'bold 22px Inter, system-ui, sans-serif'
  ctx.fillStyle = theme.text
  ctx.fillText(author || '@contentbloom.ai', contentLeft, footerY)

  ctx.font = '600 20px Inter, system-ui, sans-serif'
  ctx.fillStyle = theme.subtext
  const brandTag = 'ContentBloom Studio'
  const brandW = ctx.measureText(brandTag).width
  ctx.fillText(brandTag, contentLeft + contentWidth - brandW, footerY)
  ctx.restore()

  return canvas
}

/**
 * Downloads the current canvas contents as an actual PNG image file.
 */
export function downloadCanvasAsPng(canvas, filename = 'ContentBloom_Graphic.png') {
  if (!canvas) return Promise.resolve(false)

  return new Promise((resolve) => {
    if (typeof canvas.toBlob === 'function') {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(false)
          return
        }
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = filename.endsWith('.png') ? filename : `${filename}.png`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1500)
        resolve(true)
      }, 'image/png')
    } else if (typeof canvas.toDataURL === 'function') {
      const dataUrl = canvas.toDataURL('image/png')
      const anchor = document.createElement('a')
      anchor.href = dataUrl
      anchor.download = filename.endsWith('.png') ? filename : `${filename}.png`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      resolve(true)
    } else {
      resolve(false)
    }
  })
}

/**
 * Returns a Data URL string from a canvas for image-to-video integration.
 */
export function getGraphicDataUrl(canvas) {
  if (!canvas || typeof canvas.toDataURL !== 'function') return null
  return canvas.toDataURL('image/png')
}

/**
 * Renders multiple carousel slides and triggers sequential PNG downloads.
 */
export async function downloadAllCarouselSlides(
  slides = [],
  options = {},
  onProgress = () => {}
) {
  if (!slides || !slides.length) return false
  const prefix = options.filenamePrefix || 'ContentBloom_Carousel'

  const canvas = document.createElement('canvas')

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]
    const lines = (slide?.body || '').split('\n').filter(Boolean)
    const headline = lines[0] || slide?.title || `Slide ${i + 1}`
    const subhead = lines.slice(1).join(' ') || ''

    drawGraphicToCanvas(canvas, {
      ...options,
      formatId: 'carousel_slide',
      headline,
      subhead,
      tag: options.badge || options.tag || `CAROUSEL • SLIDE ${i + 1}`,
      slideIndicator: `${i + 1} / ${slides.length}`,
    })

    const filename = `${prefix}_Slide_${i + 1}_of_${slides.length}.png`
    await downloadCanvasAsPng(canvas, filename)

    onProgress({
      current: i + 1,
      total: slides.length,
      percent: Math.round(((i + 1) / slides.length) * 100),
    })

    if (i < slides.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }

  return true
}
