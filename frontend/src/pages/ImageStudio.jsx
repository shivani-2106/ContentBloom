import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { generateImagePrompt } from '../api/contentApi'
import { saveContentHistory } from '../utils/contentHistory'
import {
  GRAPHIC_FORMATS,
  GRAPHIC_THEMES,
  GRAPHIC_LAYOUTS,
  drawGraphicToCanvas,
  downloadCanvasAsPng,
  getGraphicDataUrl,
} from '../utils/canvasGraphicEngine'

const PLATFORMS = [
  {
    id: 'linkedin',
    name: 'LinkedIn Post',
    icon: '💼',
    defaultRatio: '1.91:1',
    ratios: ['1.91:1', '1:1', '4:5'],
  },
  {
    id: 'instagram',
    name: 'Instagram Post',
    icon: '📸',
    defaultRatio: '1:1',
    ratios: ['1:1', '4:5', '9:16'],
  },
  {
    id: 'youtube_shorts',
    name: 'YouTube Shorts / Reels',
    icon: '🎬',
    defaultRatio: '9:16',
    ratios: ['9:16', '1:1'],
  },
  {
    id: 'youtube_thumb',
    name: 'YouTube Thumbnail',
    icon: '🎥',
    defaultRatio: '16:9',
    ratios: ['16:9', '1:1'],
  },
  {
    id: 'carousel',
    name: 'Carousel Slide Asset',
    icon: '🎨',
    defaultRatio: '1:1',
    ratios: ['1:1', '4:5'],
  },
]

const VISUAL_STYLES = [
  {
    id: 'minimalist',
    label: 'Minimalist Studio Flat Lay',
    desc: 'Clean negative space, modern tech objects, subtle shadows, premium aesthetic',
    icon: '📐',
  },
  {
    id: '3d_render',
    label: '3D Isometric Render',
    desc: 'Glossy glassmorphism, clay render elements, vibrant lighting, modern SaaS look',
    icon: '🧊',
  },
  {
    id: 'cinematic',
    label: 'Cinematic Photography',
    desc: 'Dramatic rim lighting, shallow depth of field (f/1.8), realistic human subjects',
    icon: '📷',
  },
  {
    id: 'flat_vector',
    label: 'Modern Vector Illustration',
    desc: 'Bold flat colors, corporate Memphis/Stripe style, clean geometric shapes',
    icon: '🎨',
  },
  {
    id: 'neon_tech',
    label: 'Neon Cyberpunk / Dark Mode',
    desc: 'Dark ambient backdrop, cyan and magenta volumetric neon glow, futuristic tech',
    icon: '⚡',
  },
  {
    id: 'editorial',
    label: 'Editorial Magazine Artwork',
    desc: 'Artistic watercolor brushstrokes, high-end magazine cover layout, refined texture',
    icon: '📰',
  },
]

const RATIO_PREVIEWS = {
  '1:1': 'aspect-square max-w-xs',
  '16:9': 'aspect-video max-w-sm',
  '9:16': 'aspect-[9/16] max-w-[200px]',
  '4:5': 'aspect-[4/5] max-w-[220px]',
  '1.91:1': 'aspect-[1.91/1] max-w-sm',
}

export default function ImageStudio() {
  const location = useLocation()
  const canvasRef = useRef(null)

  // Studio Mode: 'graphic' (Actual PNG Canvas Designer) vs 'prompt' (AI Visual Concept & Prompt Generator)
  const [activeTab, setActiveTab] = useState('graphic')

  // Canvas Graphic Designer State
  const [graphicFormat, setGraphicFormat] = useState('instagram_post')
  const [graphicTheme, setGraphicTheme] = useState('modern_minimal')
  const [layoutType, setLayoutType] = useState('promotional')
  const [graphicHeadline, setGraphicHeadline] = useState(
    'How Modern Creators Turn 1 Core Idea Into 10 Viral Assets'
  )
  const [graphicSubhead, setGraphicSubhead] = useState(
    'A step-by-step multi-format distribution architecture engineered for founders, builders, and growth marketers.'
  )
  const [graphicBadge, setGraphicBadge] = useState('GROWTH FRAMEWORK')
  const [graphicAuthor, setGraphicAuthor] = useState('@contentbloom.ai')
  const [metricCallout, setMetricCallout] = useState('+140% GROWTH')
  const [ctaText, setCtaText] = useState('CLAIM YOUR GUIDE ➔')
  const [keyPoints, setKeyPoints] = useState([
    'Engineered for maximum retention and readability',
    'Multi-format composition tailored to social platforms',
    'Clear visual hierarchy with actionable takeaways',
  ])

  // Custom brand colors
  const [brandColorPrimary, setBrandColorPrimary] = useState('')
  const [brandColorAccent, setBrandColorAccent] = useState('')

  // AI Prompt Generator State
  const [sourceContent, setSourceContent] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [visualStyle, setVisualStyle] = useState('minimalist')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [contentFormat, setContentFormat] = useState('promotional')
  const [creativeInstructions, setCreativeInstructions] = useState('')

  const [spec, setSpec] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copiedKey, setCopiedKey] = useState('')

  useEffect(() => {
    if (location.state?.sourceContent) {
      setSourceContent(location.state.sourceContent)
      setGraphicHeadline(location.state.sourceContent.slice(0, 70))
    } else if (location.state?.topic) {
      setSourceContent(location.state.topic)
      setGraphicHeadline(location.state.topic.slice(0, 70))
    }
  }, [location.state])

  // Redraw canvas whenever graphic controls change
  useEffect(() => {
    let animId
    const render = () => {
      if (canvasRef.current) {
        drawGraphicToCanvas(canvasRef.current, {
          formatKey: graphicFormat,
          themeKey: graphicTheme,
          layoutType: layoutType,
          headline: graphicHeadline,
          subhead: graphicSubhead,
          badge: graphicBadge,
          author: graphicAuthor,
          metricCallout,
          ctaText,
          keyPoints,
          brandColorPrimary: brandColorPrimary.trim() || undefined,
          brandColorAccent: brandColorAccent.trim() || undefined,
        })
      }
    }

    render()
    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [
    graphicFormat,
    graphicTheme,
    layoutType,
    graphicHeadline,
    graphicSubhead,
    graphicBadge,
    graphicAuthor,
    metricCallout,
    ctaText,
    keyPoints,
    brandColorPrimary,
    brandColorAccent,
    activeTab,
  ])

  function handlePlatformChange(newPlatformId) {
    setPlatform(newPlatformId)
    const target = PLATFORMS.find((p) => p.id === newPlatformId)
    if (target) {
      setAspectRatio(target.defaultRatio)
    }
  }

  async function handleDownloadGraphicPng() {
    if (!canvasRef.current) return
    const filename = `ContentBloom_${graphicFormat}_${layoutType}_${Date.now()}.png`
    await downloadCanvasAsPng(canvasRef.current, filename)
    setSuccess(`Downloaded ${filename} successfully!`)
    setTimeout(() => setSuccess(''), 3000)
  }

  function handleApplySpecToGraphic(specData) {
    if (!specData) return
    setGraphicHeadline(specData.headline || specData.title || graphicHeadline)
    setGraphicSubhead(specData.subhead || specData.subject || graphicSubhead)
    setGraphicBadge(specData.badge || (specData.visual_style || 'INSIGHT').toUpperCase())

    if (specData.content_format && GRAPHIC_LAYOUTS[specData.content_format]) {
      setLayoutType(specData.content_format)
    }
    if (specData.metric_callout) {
      setMetricCallout(specData.metric_callout)
    }
    if (specData.cta_text) {
      setCtaText(specData.cta_text)
    }
    if (Array.isArray(specData.key_points) && specData.key_points.length > 0) {
      setKeyPoints(specData.key_points)
    }

    // Map platform to graphic format
    if (specData.platform === 'linkedin') setGraphicFormat('linkedin_graphic')
    else if (specData.platform === 'youtube_thumb') setGraphicFormat('youtube_thumbnail')
    else if (specData.platform === 'youtube_shorts') setGraphicFormat('instagram_story')
    else if (specData.platform === 'carousel') setGraphicFormat('carousel_slide')
    else setGraphicFormat('instagram_post')

    // Map visual style to matching color theme
    if (specData.visual_style === 'neon_tech') setGraphicTheme('tech_cyber')
    else if (specData.visual_style === 'editorial') setGraphicTheme('editorial_light')
    else if (specData.visual_style === '3d_render') setGraphicTheme('gradient_vibrant')
    else if (specData.visual_style === 'flat_vector') setGraphicTheme('warm_creator')
    else setGraphicTheme('modern_minimal')

    setActiveTab('graphic')
    setSuccess('AI visual concept & layout applied! Ready for preview and PNG export.')
  }

  async function handleGenerate(e) {
    e.preventDefault()
    if (!sourceContent.trim() || sourceContent.trim().length < 10) return

    setError('')
    setSuccess('')
    setCopiedKey('')
    setLoading(true)

    try {
      const data = await generateImagePrompt({
        source_content: sourceContent.trim(),
        platform,
        visual_style: visualStyle,
        aspect_ratio: aspectRatio,
        content_format: contentFormat,
        creative_instructions: creativeInstructions.trim(),
        brand_color_primary: brandColorPrimary.trim() || undefined,
        brand_color_accent: brandColorAccent.trim() || undefined,
      })

      setSpec(data)

      // Also populate graphic designer inputs
      setGraphicHeadline(data.headline || data.title || sourceContent.slice(0, 60))
      setGraphicSubhead(data.subhead || data.subject || 'Actionable framework for modern growth.')
      setGraphicBadge(data.badge || visualStyle.toUpperCase())
      if (data.content_format && GRAPHIC_LAYOUTS[data.content_format]) {
        setLayoutType(data.content_format)
      }
      if (data.metric_callout) setMetricCallout(data.metric_callout)
      if (data.cta_text) setCtaText(data.cta_text)
      if (Array.isArray(data.key_points) && data.key_points.length > 0) {
        setKeyPoints(data.key_points)
      }

      // Save to local history
      saveContentHistory({
        sourceContent: sourceContent.trim(),
        isImagePrompt: true,
        contentType: 'image_prompt',
        platform,
        visualStyle,
        aspectRatio,
        contentFormat,
        spec: data,
        content: `[Visual Graphic: ${data.title}]\n\nHEADLINE: ${data.headline}\nFORMAT: ${data.content_format}\nCTA: ${data.cta_text}\n\n${data.primary_prompt}`,
      })

      setSuccess('Content-aware visual concept & layout generated! Review below or open in Graphic Designer.')
    } catch (err) {
      setError(err.message || 'Failed to generate visual prompt. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy(text, key) {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 2000)
    } catch {
      setError('Unable to copy automatically. Please select and copy manually.')
    }
  }

  function handleDownloadSpec() {
    if (!spec) return
    const content = [
      `=== CONTENTBLOOM AI — VISUAL PRODUCTION SPECIFICATION ===`,
      `TITLE: ${spec.title}`,
      `PLATFORM: ${spec.platform}`,
      `LAYOUT FORMAT: ${spec.content_format || contentFormat}`,
      `STYLE: ${spec.visual_style}`,
      `ASPECT RATIO: ${spec.aspect_ratio}`,
      ``,
      `--- GRAPHIC COPY ELEMENTS ---`,
      `HEADLINE: ${spec.headline || spec.title}`,
      `SUBHEAD: ${spec.subhead || spec.subject}`,
      `BADGE: ${spec.badge}`,
      `METRIC CALLOUT: ${spec.metric_callout || 'N/A'}`,
      `CTA TEXT: ${spec.cta_text || 'N/A'}`,
      `KEY POINTS:`,
      ...(spec.key_points || []).map((pt, i) => `  ${i + 1}. ${pt}`),
      ``,
      `--- PRIMARY DIFFUSION PROMPT ---`,
      spec.primary_prompt,
      ``,
      `--- NEGATIVE PROMPT ---`,
      spec.negative_prompt,
      ``,
      `--- MIDJOURNEY READY (v6.0) ---`,
      spec.copy_ready_midjourney,
      ``,
      `--- DALL-E 3 READY ---`,
      spec.copy_ready_dalle,
      ``,
      `--- COMPOSITION & LIGHTING BREAKDOWN ---`,
      `Subject: ${spec.subject}`,
      `Composition: ${spec.composition}`,
      `Lighting: ${spec.lighting}`,
      `Background: ${spec.background}`,
      `Color Palette: ${(spec.color_palette || []).join(', ')}`,
      ``,
      `Generated by ContentBloom AI Studio`,
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `ContentBloom_Visual_Spec_${(spec.title || 'Graphic').replace(/\s+/g, '_')}.txt`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const selectedPlatform = PLATFORMS.find((p) => p.id === platform) || PLATFORMS[0]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <span className="section-label">
            <span>🎨</span> AI Visual Creative Studio
          </span>
          <div className="flex gap-2">
            <Link to="/generate-all" className="btn-secondary text-xs py-1 px-3">
              ✨ 4-in-1 Text Studio
            </Link>
            <Link to="/video-studio" className="btn-secondary text-xs py-1 px-3">
              🎬 Video Studio
            </Link>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Social Media Graphic & Visual Studio
        </h1>

        <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          Design and export high-resolution, content-aware PNG graphic cards for Instagram, LinkedIn, and YouTube, or direct AI visual concepts with calibrated prompts for Midjourney and DALL-E 3.
        </p>

        {/* Studio Mode Selector Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('graphic')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'graphic'
                ? 'bg-bloom-600 text-white shadow-sm ring-1 ring-bloom-600'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>🖼️</span>
            <span>Visual Graphic Designer (Actual PNG Export)</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
              1080p
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'prompt'
                ? 'bg-bloom-600 text-white shadow-sm ring-1 ring-bloom-600'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>💡</span>
            <span>AI Visual Concepts & Diffusion Prompts</span>
          </button>
        </div>
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

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-700 flex items-start gap-2.5"
        >
          <span>⚠️</span>
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* MODE A: ACTUAL GRAPHIC DESIGNER & PNG EXPORTER */}
      {activeTab === 'graphic' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Canvas Live Preview */}
            <div className="lg:col-span-6 card bg-slate-900 border-slate-800 p-5 shadow-lg flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-3 pb-2 border-b border-white/10">
                <span className="font-semibold text-bloom-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live 1080p Canvas Render
                </span>
                <span className="font-mono text-[11px] text-slate-300">
                  {GRAPHIC_FORMATS[graphicFormat]?.badge}
                </span>
              </div>

              {/* Scaled Canvas Container */}
              <div className="w-full max-w-[420px] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto object-contain block max-h-[520px]"
                />
              </div>

              {/* Canvas Action Bar */}
              <div className="w-full mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  <p>Format: <strong className="text-white">{GRAPHIC_FORMATS[graphicFormat]?.label}</strong></p>
                  <p>Layout: <strong className="text-bloom-400">{GRAPHIC_LAYOUTS[layoutType]?.label}</strong></p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadGraphicPng}
                    className="btn-primary py-2 px-5 text-sm font-bold shadow-lg"
                  >
                    ⬇ Download High-Res PNG
                  </button>
                  <Link
                    to="/video-studio"
                    state={{
                      sourceContent: `${graphicHeadline}\n\n${graphicSubhead}`,
                      sourceGraphic: canvasRef.current ? getGraphicDataUrl(canvasRef.current) : null,
                    }}
                    className="btn-secondary py-2 px-3 text-xs font-bold text-red-400 hover:text-red-300 border-red-500/30"
                    title="Send this graphic into the Video Studio as an animated scene asset"
                  >
                    🎬 Send to Video Studio
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Graphic Element Customization Controls */}
            <div className="lg:col-span-6 space-y-6">
              {/* 1. Layout Archetype Selection */}
              <div className="card border-slate-200 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Content-Aware Layout Archetype
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.values(GRAPHIC_LAYOUTS).map((lay) => (
                    <button
                      key={lay.id}
                      type="button"
                      onClick={() => setLayoutType(lay.id)}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-left text-xs transition-all ${
                        layoutType === lay.id
                          ? 'border-bloom-500 bg-bloom-50/80 text-bloom-950 font-bold ring-1 ring-bloom-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl mt-0.5">{lay.icon}</span>
                      <div>
                        <p className="font-bold leading-tight">{lay.label}</p>
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5 leading-snug line-clamp-2">
                          {lay.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Platform & Dimensions */}
              <div className="card border-slate-200 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Target Platform Dimensions
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.values(GRAPHIC_FORMATS).map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setGraphicFormat(fmt.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        graphicFormat === fmt.id
                          ? 'border-bloom-500 bg-bloom-50/80 text-bloom-900 ring-1 ring-bloom-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-bold truncate">{fmt.label}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {fmt.badge}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Visual Theme & Brand Colors */}
              <div className="card border-slate-200 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Visual Theme & Palette
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {Object.values(GRAPHIC_THEMES).map((thm) => (
                    <button
                      key={thm.id}
                      type="button"
                      onClick={() => setGraphicTheme(thm.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-all ${
                        graphicTheme === thm.id
                          ? 'border-bloom-500 bg-bloom-50/80 ring-1 ring-bloom-500 font-bold text-bloom-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className="h-5 w-5 rounded-md border border-black/10 shadow-xs shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${thm.bgStart}, ${thm.bgEnd})`,
                        }}
                      />
                      <span className="truncate text-[11px]">{thm.label}</span>
                    </button>
                  ))}
                </div>

                {/* Optional Custom Brand Colors */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Custom Primary Color
                    </span>
                    <input
                      type="text"
                      value={brandColorPrimary}
                      onChange={(e) => setBrandColorPrimary(e.target.value)}
                      placeholder="e.g. #38bdf8"
                      className="input-field text-xs py-1"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Custom Accent Color
                    </span>
                    <input
                      type="text"
                      value={brandColorAccent}
                      onChange={(e) => setBrandColorAccent(e.target.value)}
                      placeholder="e.g. #f43f5e"
                      className="input-field text-xs py-1"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Text & Content Elements */}
              <div className="card border-slate-200 shadow-xs space-y-3.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  4. Layout Content & Copy
                </label>

                <div>
                  <span className="text-xs font-semibold text-slate-600 block mb-1">
                    Main Headline
                  </span>
                  <input
                    type="text"
                    value={graphicHeadline}
                    onChange={(e) => setGraphicHeadline(e.target.value)}
                    maxLength={140}
                    className="input-field text-sm font-semibold"
                    placeholder="Enter high-impact headline"
                  />
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-600 block mb-1">
                    Supporting Subhead / Value Prop
                  </span>
                  <textarea
                    rows={2}
                    value={graphicSubhead}
                    onChange={(e) => setGraphicSubhead(e.target.value)}
                    maxLength={220}
                    className="input-field text-xs leading-relaxed"
                    placeholder="Enter supporting takeaway or summary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block mb-1">
                      Category Badge
                    </span>
                    <input
                      type="text"
                      value={graphicBadge}
                      onChange={(e) => setGraphicBadge(e.target.value)}
                      maxLength={30}
                      className="input-field text-xs"
                      placeholder="e.g. GROWTH GUIDE"
                    />
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-600 block mb-1">
                      Author / Brand Handle
                    </span>
                    <input
                      type="text"
                      value={graphicAuthor}
                      onChange={(e) => setGraphicAuthor(e.target.value)}
                      maxLength={40}
                      className="input-field text-xs"
                      placeholder="e.g. @contentbloom.ai"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block mb-1">
                      Metric Callout (For Promo/Info)
                    </span>
                    <input
                      type="text"
                      value={metricCallout}
                      onChange={(e) => setMetricCallout(e.target.value)}
                      maxLength={30}
                      className="input-field text-xs"
                      placeholder="e.g. +140% GROWTH"
                    />
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-600 block mb-1">
                      Action Button Text (CTA)
                    </span>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      maxLength={40}
                      className="input-field text-xs"
                      placeholder="e.g. CLAIM YOUR GUIDE ➔"
                    />
                  </div>
                </div>

                {/* Key Bullet Points */}
                <div>
                  <span className="text-xs font-semibold text-slate-600 block mb-1">
                    Key Bullet Items (Used in Explainers, Listicles, & Feature Ads)
                  </span>
                  <div className="space-y-1.5">
                    {keyPoints.map((pt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={pt}
                        onChange={(e) => {
                          const updated = [...keyPoints]
                          updated[idx] = e.target.value
                          setKeyPoints(updated)
                        }}
                        className="input-field text-xs py-1.5"
                        placeholder={`Point ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {spec && (
                  <button
                    type="button"
                    onClick={() => handleApplySpecToGraphic(spec)}
                    className="btn-secondary w-full py-2 text-xs justify-center"
                  >
                    ✨ Re-Apply AI Concept ("{spec.title.slice(0, 30)}...")
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE B: AI VISUAL CONCEPTS & PROMPT GENERATION */}
      {activeTab === 'prompt' && (
        <div className="space-y-8">
          <form onSubmit={handleGenerate} className="card shadow-xs border-slate-200">
            <div className="mb-6">
              <label
                htmlFor="imageSource"
                className="block text-sm font-bold text-slate-900 mb-1"
              >
                1. Source Content or Visual Idea
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Paste your article text, social media draft, or a raw visual idea.
              </p>

              <textarea
                id="imageSource"
                className="input-field min-h-32 text-sm leading-relaxed"
                placeholder="Example: How early stage founders can build product credibility and community trust through transparent building in public..."
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                minLength={10}
                maxLength={10000}
                required
                disabled={loading}
              />
            </div>

            {/* Layout Format & Platform Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Content-Aware Layout Format
                </label>
                <select
                  value={contentFormat}
                  onChange={(e) => setContentFormat(e.target.value)}
                  disabled={loading}
                  className="input-field py-2.5 text-xs sm:text-sm font-semibold"
                >
                  <option value="promotional">⚡ Promotional & Special Offer Card</option>
                  <option value="educational_explainer">📚 3-Step Educational Explainer</option>
                  <option value="product_ad">🚀 Product Advertisement & Feature Showcase</option>
                  <option value="listicle">📋 Actionable Listicle / Checklist</option>
                  <option value="announcement">📣 Breaking Announcement / Launch Alert</option>
                  <option value="infographic">📊 Infographic & Data Metric Callout</option>
                  <option value="minimal_card">📐 Minimal Thought-Leadership Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Target Platform
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePlatformChange(p.id)}
                      disabled={loading}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        platform === p.id
                          ? 'border-bloom-500 bg-bloom-50/80 text-bloom-900 shadow-xs ring-1 ring-bloom-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base">{p.icon}</span>
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Style Selection */}
            <div className="mb-6 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                4. Visual Style & Aesthetic
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {VISUAL_STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setVisualStyle(st.id)}
                    disabled={loading}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      visualStyle === st.id
                        ? 'border-bloom-500 bg-bloom-50/80 shadow-xs ring-1 ring-bloom-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{st.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{st.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{st.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Creative Directives */}
            <div className="mb-6 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                5. Additional Creative Instructions (Optional)
              </label>
              <input
                type="text"
                value={creativeInstructions}
                onChange={(e) => setCreativeInstructions(e.target.value)}
                placeholder="e.g. Include high-contrast neon accents, emphasize 10x throughput surge, clean SaaS aesthetic"
                className="input-field text-xs sm:text-sm py-2"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 text-base justify-center shadow-md disabled:opacity-50"
              disabled={loading || sourceContent.trim().length < 10}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Directing AI Visual Concept & Calibrating Prompts...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>🎨</span>
                  <span>Generate Visual Concept & AI Prompts</span>
                </span>
              )}
            </button>
          </form>

          {/* Visual Spec Results */}
          {spec && (
            <section aria-labelledby="image-results-heading" className="space-y-6">
              <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 sm:p-5 flex items-start justify-between gap-4 text-sky-950">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-sky-900">
                      Visual Spec & Graphics Integration
                    </p>
                    <p className="text-xs text-sky-800 mt-1 leading-relaxed">
                      Calibrated prompts are ready for Midjourney and DALL-E below. You can also load this concept directly into the <strong>Visual Graphic Designer</strong> to download an instant 1080p PNG.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplySpecToGraphic(spec)}
                  className="btn-primary text-xs py-2 px-4 shrink-0 shadow-sm"
                >
                  🎨 Open in Graphic Designer (PNG) ➔
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Framing Mockup Column */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-md">
                  <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-4 pb-2 border-b border-white/10">
                    <span className="font-semibold text-bloom-400 flex items-center gap-1">
                      <span>📐</span> Framing: {spec.aspect_ratio}
                    </span>
                    <span className="uppercase tracking-wider font-mono text-[10px]">
                      {spec.platform}
                    </span>
                  </div>

                  <div
                    className={`w-full ${
                      RATIO_PREVIEWS[spec.aspect_ratio] || 'aspect-square max-w-xs'
                    } rounded-xl border-2 border-dashed border-white/30 bg-white/5 backdrop-blur-sm p-4 flex flex-col justify-between text-center transition-all duration-300 relative overflow-hidden`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-white/50 uppercase tracking-widest font-mono">
                      <span>Concept Mock</span>
                      <span>{spec.visual_style}</span>
                    </div>

                    <div className="my-auto py-2">
                      <span className="text-3xl mb-2 block">🖼️</span>
                      <p className="text-sm font-bold text-white line-clamp-2">
                        "{spec.headline || spec.title}"
                      </p>
                      <p className="text-[11px] text-white/70 mt-1 line-clamp-3 font-normal">
                        {spec.subhead || spec.subject}
                      </p>
                    </div>

                    <div className="flex justify-center gap-1.5 pt-2 border-t border-white/10">
                      {(spec.color_palette || []).map((color, i) => (
                        <span
                          key={i}
                          className="h-3 w-6 rounded-full border border-white/20"
                          style={{
                            backgroundColor: color.startsWith('#') ? color : '#38bdf8',
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplySpecToGraphic(spec)}
                    className="btn-secondary w-full mt-4 text-xs py-2 justify-center"
                  >
                    Export High-Res PNG in Graphic Designer ➔
                  </button>
                </div>

                {/* Production Specifications Column */}
                <div className="lg:col-span-7 card flex flex-col justify-between border-slate-200">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-bloom-600 bg-bloom-50 px-2 py-0.5 rounded">
                          Visual Spec Sheet
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 mt-1">
                          {spec.title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={handleDownloadSpec}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        ⬇ Download Spec (.txt)
                      </button>
                    </div>

                    {/* Primary Prompt */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Primary Diffusion Prompt
                        </label>
                        <button
                          type="button"
                          onClick={() => handleCopy(spec.primary_prompt, 'primary')}
                          className="text-xs font-bold text-bloom-600 hover:text-bloom-700"
                        >
                          {copiedKey === 'primary' ? '✓ Copied' : '📋 Copy Prompt'}
                        </button>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap select-all">
                        {spec.primary_prompt}
                      </div>
                    </div>

                    {/* Midjourney & DALL-E Fast Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                      <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-purple-900">
                            Midjourney v6
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(spec.copy_ready_midjourney, 'mj')}
                            className="text-[11px] font-bold text-purple-700 hover:text-purple-900"
                          >
                            {copiedKey === 'mj' ? '✓ Copied!' : 'Copy for MJ'}
                          </button>
                        </div>
                        <p className="text-[11px] text-purple-950 font-mono truncate">
                          {spec.copy_ready_midjourney}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-emerald-900">
                            DALL-E 3 / ChatGPT
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(spec.copy_ready_dalle, 'dalle')}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900"
                          >
                            {copiedKey === 'dalle' ? '✓ Copied!' : 'Copy for DALL-E'}
                          </button>
                        </div>
                        <p className="text-[11px] text-emerald-950 font-mono truncate">
                          {spec.copy_ready_dalle}
                        </p>
                      </div>
                    </div>

                    {/* Structured Breakdown Details */}
                    <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-slate-700 w-28 shrink-0">Layout Format:</span>
                        <span className="text-slate-900 font-semibold uppercase">{spec.content_format || contentFormat}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="font-bold text-slate-700 w-28 shrink-0">Subject:</span>
                        <span className="text-slate-600">{spec.subject}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="font-bold text-slate-700 w-28 shrink-0">Composition:</span>
                        <span className="text-slate-600">{spec.composition}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="font-bold text-slate-700 w-28 shrink-0">Lighting & Mood:</span>
                        <span className="text-slate-600">{spec.lighting}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="font-bold text-slate-700 w-28 shrink-0">Color Palette:</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(spec.color_palette || []).map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="font-bold text-slate-700 w-28 shrink-0">Negative Prompt:</span>
                        <span className="text-red-700 font-mono text-[11px]">
                          {spec.negative_prompt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Quick Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">
                      Ready to paste into Midjourney, DALL-E or Canva
                    </span>

                    <div className="flex gap-2">
                      <Link
                        to="/generate-all"
                        state={{ sourceContent }}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        ✨ Generate 4-Format Copy
                      </Link>
                      <Link
                        to="/history"
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        📚 View in History
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
