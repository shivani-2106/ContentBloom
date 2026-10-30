import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  generateAllFormats,
  improveAllFormats,
} from '../api/contentApi'
import {
  saveContentHistory,
  updateContentHistoryItem,
} from '../utils/contentHistory'
import {
  drawGraphicToCanvas,
  downloadCanvasAsPng,
  downloadAllCarouselSlides,
} from '../utils/canvasGraphicEngine'

const FORMATS = [
  {
    key: 'linkedin',
    title: 'LinkedIn Post',
    subtitle: 'Professional thought-leadership with structured insights & CTA',
    icon: '💼',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    key: 'instagram',
    title: 'Instagram Caption',
    subtitle: 'Aesthetic scroll-stopping caption with hooks & hashtags',
    icon: '📸',
    badgeColor: 'bg-pink-100 text-pink-700',
  },
  {
    key: 'youtube_shorts',
    title: 'YouTube Shorts Script',
    subtitle: 'High-retention 9:16 script with hook, scene timing & audio directions',
    icon: '🎬',
    badgeColor: 'bg-red-100 text-red-700',
  },
  {
    key: 'carousel',
    title: 'Carousel Slide Deck',
    subtitle: 'Slide-by-slide storytelling with cover, core lessons & finale',
    icon: '🎨',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
]

function LinkedInPreview({ text }) {
  const previewText = text || 'Your LinkedIn post preview will appear here.'
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
      {/* Author Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-bloom-700 font-bold text-white text-sm shadow-xs">
          CB
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-slate-900 truncate">Content Creator</p>
            <span className="text-xs text-slate-400">• 1st</span>
          </div>
          <p className="text-xs text-slate-500 truncate">Founder & AI Builder • Thought Leadership</p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            <span>Just now</span> • <span>🌐</span>
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
          in Feed
        </span>
      </div>

      {/* Content Body */}
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800 font-normal">
        {previewText}
      </p>

      {/* Social Proof */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <span className="flex -space-x-1">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] text-white">👍</span>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">❤️</span>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] text-white">💡</span>
          </span>
          <span className="ml-1 text-[11px]">428</span>
        </div>
        <div className="flex gap-2 text-[11px] text-slate-400">
          <span>34 comments</span>
          <span>•</span>
          <span>12 reposts</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-2 grid grid-cols-4 border-t border-slate-100 pt-2 text-center text-xs font-semibold text-slate-600">
        <div className="py-1.5 rounded hover:bg-slate-50 flex items-center justify-center gap-1 cursor-default">
          <span>👍</span> <span className="hidden sm:inline">Like</span>
        </div>
        <div className="py-1.5 rounded hover:bg-slate-50 flex items-center justify-center gap-1 cursor-default">
          <span>💬</span> <span className="hidden sm:inline">Comment</span>
        </div>
        <div className="py-1.5 rounded hover:bg-slate-50 flex items-center justify-center gap-1 cursor-default">
          <span>🔁</span> <span className="hidden sm:inline">Repost</span>
        </div>
        <div className="py-1.5 rounded hover:bg-slate-50 flex items-center justify-center gap-1 cursor-default">
          <span>✈️</span> <span className="hidden sm:inline">Send</span>
        </div>
      </div>
    </div>
  )
}

function InstagramPreview({ text }) {
  const previewText = text || 'Your Instagram caption preview will appear here.'
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
            <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-slate-800">
              CB
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">contentbloom.ai</p>
            <p className="text-[10px] text-slate-400">Original Audio</p>
          </div>
        </div>
        <span className="text-slate-400 text-sm font-bold">•••</span>
      </div>

      {/* Visual post mockup container */}
      <div className="aspect-square w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-6 flex flex-col justify-between text-white relative">
        <div className="flex justify-between items-center text-[10px] text-white/60 uppercase tracking-widest font-mono">
          <span>ContentBloom AI</span>
          <span>Daily Drop</span>
        </div>

        <div className="my-auto py-2">
          <p className="text-sm sm:text-base font-bold leading-snug tracking-tight text-white/95 line-clamp-6 text-center">
            "{previewText.slice(0, 150)}{previewText.length > 150 ? '...' : ''}"
          </p>
        </div>

        <div className="flex justify-between items-center text-[10px] text-white/50 border-t border-white/10 pt-2">
          <span>@contentbloom.ai</span>
          <span>Save for later ⬇</span>
        </div>
      </div>

      {/* Action icons bar */}
      <div className="p-3">
        <div className="flex items-center justify-between text-base mb-2">
          <div className="flex items-center gap-3">
            <span>❤️</span>
            <span>💬</span>
            <span>✈️</span>
          </div>
          <span>🔖</span>
        </div>

        <p className="text-xs font-bold text-slate-900 mb-1">1,842 likes</p>

        <div className="text-xs text-slate-800 leading-relaxed">
          <span className="font-bold text-slate-900 mr-1.5">contentbloom.ai</span>
          <span className="whitespace-pre-wrap">{previewText}</span>
        </div>

        <p className="text-[10px] text-slate-400 uppercase mt-2">View all 48 comments • 2 hours ago</p>
      </div>
    </div>
  )
}

function YouTubeShortsPreview({ text }) {
  const previewText = text || 'Your short-video script preview will appear here.'
  return (
    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-white shadow-md">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
        <span className="flex items-center gap-1.5 font-semibold text-red-500">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Shorts 9:16 Mockup
        </span>
        <span className="text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
          Phone Canvas
        </span>
      </div>

      {/* Phone Frame */}
      <div className="relative mx-auto aspect-[9/16] max-w-[240px] rounded-3xl border-4 border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-4 flex flex-col justify-between overflow-hidden shadow-inner">
        {/* Top pill notch */}
        <div className="mx-auto h-3 w-16 rounded-full bg-slate-800 mb-2" />

        {/* Right vertical action column */}
        <div className="absolute right-2.5 bottom-16 flex flex-col items-center gap-3 text-white text-xs">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-xs shadow">👍</div>
            <span className="text-[9px] mt-0.5">38K</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-xs shadow">💬</div>
            <span className="text-[9px] mt-0.5">412</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-xs shadow">↗</div>
            <span className="text-[9px] mt-0.5">Share</span>
          </div>
        </div>

        {/* Script Content overlay */}
        <div className="pr-10 my-auto">
          <span className="inline-block rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white mb-2">
            SHORTS HOOK
          </span>
          <p className="whitespace-pre-wrap text-xs font-medium leading-relaxed text-slate-100 line-clamp-7 drop-shadow-md">
            {previewText}
          </p>
        </div>

        {/* Bottom user & sound tag */}
        <div className="pr-10 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-5 w-5 rounded-full bg-red-600 flex items-center justify-center text-[9px] font-bold">CB</div>
            <span className="text-xs font-bold truncate">@contentbloom</span>
          </div>
          <p className="text-[9px] text-slate-400 truncate flex items-center gap-1">
            <span>🎵</span> <span>Trending Audio • High Retention</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function CarouselPreview({ text }) {
  const explicitSlides = text.split(/(?=slide\s*\d+)/i).map((part) => part.trim()).filter(Boolean)
  let slides
  if (explicitSlides.length > 1) {
    slides = explicitSlides.slice(0, 10).map((part, index) => ({
      title: `Slide ${index + 1}`,
      body: part.replace(/^slide\s*\d+\s*[:\-–]?\s*/i, ''),
    }))
  } else {
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
    const chunks = []
    const sourceLines = lines.length ? lines : [text || 'Your carousel content preview will appear here.']
    for (let i = 0; i < sourceLines.length; i += 3) chunks.push(sourceLines.slice(i, i + 3).join('\n'))
    slides = (chunks.length ? chunks : [text]).slice(0, 10).map((body, index) => ({ title: `Slide ${index + 1}`, body }))
  }

  const [currentSlide, setCurrentSlide] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [exportProgress, setExportProgress] = useState(null)
  const activeSlide = slides[currentSlide] || slides[0]

  function renderSlideToCanvas(slideObj, index) {
    const canvas = document.createElement('canvas')
    const lines = (slideObj?.body || '').split('\n').filter(Boolean)
    const headline = lines[0] || slideObj?.title || `Slide ${index + 1}`
    const subhead = lines.slice(1).join(' ') || 'ContentBloom AI Multi-Format Framework'

    drawGraphicToCanvas(canvas, {
      formatKey: 'carousel_slide',
      themeKey: 'gradient_vibrant',
      headline,
      subhead,
      badge: `CAROUSEL • SLIDE ${index + 1}`,
      author: '@contentbloom.ai',
      slideIndicator: `${index + 1} / ${slides.length}`,
    })
    return canvas
  }

  async function handleDownloadCurrentSlide() {
    const canvas = renderSlideToCanvas(activeSlide, currentSlide)
    await downloadCanvasAsPng(canvas, `ContentBloom_Slide_${currentSlide + 1}.png`)
  }

  async function handleDownloadAllSlides() {
    if (!slides.length) return
    setDownloading(true)
    setExportProgress({ current: 0, total: slides.length, percent: 0 })
    try {
      await downloadAllCarouselSlides(
        slides,
        {
          themeKey: 'gradient_vibrant',
          badge: 'CAROUSEL SLIDE',
          filenamePrefix: 'ContentBloom_Carousel',
        },
        (prog) => setExportProgress(prog)
      )
    } finally {
      setTimeout(() => {
        setDownloading(false)
        setExportProgress(null)
      }, 600)
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/60 to-purple-50/40 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🎨</span>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-800">
            Carousel Slide Deck
          </span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
          Slide {currentSlide + 1} of {slides.length}
        </span>
      </div>

      {/* Slide Canvas */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-xl border border-violet-300/80 bg-gradient-to-br from-white via-violet-50/50 to-pink-50/40 p-5 sm:p-6 flex flex-col justify-between shadow-xs overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold tracking-wider text-violet-700 uppercase bg-violet-100/70 px-2 py-0.5 rounded">
            ContentBloom Studio
          </span>
          <span className="text-xs font-bold text-slate-400">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>

        <div className="my-auto py-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-1">
            {activeSlide?.title}
          </h4>
          <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed whitespace-pre-wrap line-clamp-6">
            {activeSlide?.body || 'Add your slide content here.'}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-violet-100 pt-2">
          <span className="text-[11px]">Swipe for more ➔</span>
          <div className="flex gap-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentSlide ? 'w-5 bg-violet-600' : 'w-1.5 bg-violet-200'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Carousel controls */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
          disabled={currentSlide === 0}
          className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-30"
        >
          ← Prev Slide
        </button>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Interactive Slide Deck
        </span>

        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
          disabled={currentSlide === slides.length - 1}
          className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-30"
        >
          Next Slide →
        </button>
      </div>

      {/* Slide PNG Exporter Bar */}
      <div className="mt-3 pt-3 border-t border-violet-200/60 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-violet-700 font-medium">
          📸 Export High-Res Slide Images (1080×1350 PNG)
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadCurrentSlide}
            className="btn-secondary py-1 px-3 text-xs"
          >
            ⬇ Download Slide {currentSlide + 1} (PNG)
          </button>
          <button
            type="button"
            onClick={handleDownloadAllSlides}
            disabled={downloading}
            className="btn-primary py-1 px-3 text-xs disabled:opacity-50"
          >
            {downloading
              ? `Exporting (${exportProgress?.current || 0}/${slides.length})...`
              : `⬇ Export All ${slides.length} Slides (PNG)`}
          </button>
        </div>
      </div>
    </div>
  )
}

function PlatformPreview({ format, content }) {
  const text = typeof content === 'string' ? content.trim() : ''

  if (format.key === 'linkedin') {
    return <LinkedInPreview text={text} />
  }

  if (format.key === 'instagram') {
    return <InstagramPreview text={text} />
  }

  if (format.key === 'youtube_shorts') {
    return <YouTubeShortsPreview text={text} />
  }

  return <CarouselPreview text={text} />
}

export default function GenerateAll() {
  const location = useLocation()

  const [sourceContent, setSourceContent] = useState('')
  const [tone, setTone] = useState('friendly')
  const [targetAudience, setTargetAudience] = useState('general')
  const [length, setLength] = useState('medium')
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [includeEmojis, setIncludeEmojis] = useState(true)

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [improvingAll, setImprovingAll] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copiedFormat, setCopiedFormat] = useState('')
  const [activeEntryId, setActiveEntryId] = useState(null)

  // Card view mode per format: 'both' | 'editor' | 'preview'
  const [cardViews, setCardViews] = useState({
    linkedin: 'both',
    instagram: 'both',
    youtube_shorts: 'both',
    carousel: 'both',
  })

  function toggleCardView(formatKey, mode) {
    setCardViews((prev) => ({
      ...prev,
      [formatKey]: mode,
    }))
  }

  useEffect(() => {
    if (location.state?.historyItem) {
      const item = location.state.historyItem
      if (item.sourceContent) setSourceContent(item.sourceContent)
      if (item.tone) setTone(item.tone)
      if (item.targetAudience) setTargetAudience(item.targetAudience)
      if (item.length) setLength(item.length)
      if (typeof item.includeHashtags === 'boolean') setIncludeHashtags(item.includeHashtags)
      if (typeof item.includeEmojis === 'boolean') setIncludeEmojis(item.includeEmojis)
      if (item.formats) {
        setResults(item.formats)
        setActiveEntryId(item.id)
        setSuccess('Loaded saved 4-format collection from history!')
      }
    }
  }, [location.state])

  async function handleGenerate(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setCopiedFormat('')
    setLoading(true)

    try {
      const data = await generateAllFormats({
        source_content: sourceContent.trim(),
        tone,
        target_audience: targetAudience,
        length,
        include_hashtags: includeHashtags,
        include_emojis: includeEmojis,
      })

      if (!data?.results) {
        throw new Error('The server returned an unexpected response.')
      }

      const missingFormats = FORMATS.filter(
        (format) =>
          typeof data.results[format.key] !== 'string' ||
          !data.results[format.key].trim()
      )

      if (missingFormats.length > 0) {
        throw new Error(
          `Some formats are missing: ${missingFormats
            .map((format) => format.title)
            .join(', ')}. Please try again.`
        )
      }

      setResults(data.results)

      // Auto-save grouped collection to History
      const saved = saveContentHistory({
        sourceContent: sourceContent.trim(),
        isGrouped: true,
        formats: data.results,
        tone,
        targetAudience,
        length,
        includeHashtags,
        includeEmojis,
      })

      if (saved?.id) {
        setActiveEntryId(saved.id)
      }

      setSuccess('All four formats generated and saved to History!')
    } catch (err) {
      setError(
        err.message || 'Unable to generate content. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerateAll() {
    if (sourceContent.trim().length < 50) {
      setError('Please provide at least 50 characters of source content before regenerating.')
      return
    }

    setError('')
    setSuccess('')
    setCopiedFormat('')
    setLoading(true)

    try {
      const data = await generateAllFormats({
        source_content: sourceContent.trim(),
        tone,
        target_audience: targetAudience,
        length,
        include_hashtags: includeHashtags,
        include_emojis: includeEmojis,
      })

      if (!data?.results) {
        throw new Error('The server returned an unexpected response.')
      }

      const missingFormats = FORMATS.filter(
        (format) =>
          typeof data.results[format.key] !== 'string' ||
          !data.results[format.key].trim()
      )

      if (missingFormats.length > 0) {
        throw new Error(
          `Some formats are missing: ${missingFormats
            .map((format) => format.title)
            .join(', ')}. Your existing content has been preserved.`
        )
      }

      setResults(data.results)

      if (activeEntryId) {
        updateContentHistoryItem(activeEntryId, {
          sourceContent: sourceContent.trim(),
          formats: data.results,
          tone,
          targetAudience,
          length,
          includeHashtags,
          includeEmojis,
        })
      } else {
        const saved = saveContentHistory({
          sourceContent: sourceContent.trim(),
          isGrouped: true,
          formats: data.results,
          tone,
          targetAudience,
          length,
          includeHashtags,
          includeEmojis,
        })
        if (saved?.id) setActiveEntryId(saved.id)
      }

      setSuccess('All four formats have been regenerated and saved to History!')
    } catch (err) {
      setError(
        err.message || 'Unable to regenerate all formats. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleImproveAll() {
    if (!results) {
      setError('Generate all four formats before improving them.')
      return
    }

    const missingFormats = FORMATS.filter(
      (format) =>
        typeof results[format.key] !== 'string' ||
        !results[format.key].trim()
    )

    if (missingFormats.length > 0) {
      setError(
        `Please add content for: ${missingFormats
          .map((format) => format.title)
          .join(', ')}.`
      )
      return
    }

    if (sourceContent.trim().length < 50) {
      setError('Please provide at least 50 characters of source content.')
      return
    }

    setError('')
    setSuccess('')
    setCopiedFormat('')
    setImprovingAll(true)

    try {
      const data = await improveAllFormats({
        source_content: sourceContent.trim(),
        current_results: results,
        tone,
        target_audience: targetAudience,
        length,
        include_hashtags: includeHashtags,
        include_emojis: includeEmojis,
      })

      if (!data?.results) {
        throw new Error('The server returned an unexpected response.')
      }

      const missingImprovedFormats = FORMATS.filter(
        (format) =>
          typeof data.results[format.key] !== 'string' ||
          !data.results[format.key].trim()
      )

      if (missingImprovedFormats.length > 0) {
        throw new Error(
          `Improved content is missing for: ${missingImprovedFormats
            .map((format) => format.title)
            .join(', ')}. Your existing content has been preserved.`
        )
      }

      setResults(data.results)

      if (activeEntryId) {
        updateContentHistoryItem(activeEntryId, {
          sourceContent: sourceContent.trim(),
          formats: data.results,
          tone,
          targetAudience,
          length,
          includeHashtags,
          includeEmojis,
        })
      } else {
        const saved = saveContentHistory({
          sourceContent: sourceContent.trim(),
          isGrouped: true,
          formats: data.results,
          tone,
          targetAudience,
          length,
          includeHashtags,
          includeEmojis,
        })
        if (saved?.id) setActiveEntryId(saved.id)
      }

      setSuccess('All four formats have been improved and saved to History!')
    } catch (err) {
      setError(
        err.message || 'Unable to improve all formats. Please try again.'
      )
    } finally {
      setImprovingAll(false)
    }
  }

  function handleSaveToHistory() {
    if (!results) return

    if (activeEntryId) {
      updateContentHistoryItem(activeEntryId, {
        sourceContent: sourceContent.trim(),
        formats: results,
        tone,
        targetAudience,
        length,
        includeHashtags,
        includeEmojis,
      })
    } else {
      const saved = saveContentHistory({
        sourceContent: sourceContent.trim(),
        isGrouped: true,
        formats: results,
        tone,
        targetAudience,
        length,
        includeHashtags,
        includeEmojis,
      })
      if (saved?.id) setActiveEntryId(saved.id)
    }

    setSuccess('✓ Your latest edits have been saved to History!')
  }

  function handleDownloadAll() {
    if (!results) return

    const sections = FORMATS.map(
      (fmt) => `=== ${fmt.title.toUpperCase()} ===\n\n${results[fmt.key] || ''}\n`
    ).join('\n----------------------------------------\n\n')

    const blob = new Blob([sections], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `ContentBloom_All_4_Formats_${Date.now()}.txt`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  async function handleCopy(formatKey) {
    const content = results?.[formatKey]
    if (typeof content !== 'string' || !content.trim()) return

    try {
      await navigator.clipboard.writeText(content)
      setCopiedFormat(formatKey)
      setError('')
      window.setTimeout(() => {
        setCopiedFormat((current) =>
          current === formatKey ? '' : current
        )
      }, 2000)
    } catch {
      setError(
        'Unable to copy automatically. Please select the text and copy it manually.'
      )
    }
  }

  function handleDownload(formatKey, title) {
    const content = results?.[formatKey]
    if (typeof content !== 'string' || !content.trim()) return

    const blob = new Blob([content], {
      type: 'text/plain;charset=utf-8',
    })

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = `ContentBloom_${title.replace(/\s+/g, '_')}.txt`

    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/generate"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-bloom-600 transition-colors"
        >
          <span>←</span> Back to Single Generator
        </Link>

        <div className="mt-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-bloom-100/80 px-3 py-1 text-xs font-bold text-bloom-800">
            <span>✨</span> Signature Multi-Format Studio
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            One Idea. Four Platforms.
          </h1>

          <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
            Provide your raw concept or document once. ContentBloom AI automatically synthesizes
            tailored content for <strong className="text-slate-800">LinkedIn</strong>,{' '}
            <strong className="text-slate-800">Instagram</strong>,{' '}
            <strong className="text-slate-800">YouTube Shorts</strong>, and{' '}
            <strong className="text-slate-800">Carousel Slides</strong> with live platform previews.
          </p>
        </div>
      </div>

      {/* Input form */}
      <form onSubmit={handleGenerate} className="card mb-10 shadow-xs border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>💡</span> Step 1: Provide Your Source Material
          </h2>
          <span className="text-xs font-medium text-slate-400">
            Min 50 characters
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Paste an article, draft, webinar summary, lesson plan, or talking points to transform.
        </p>

        <div className="relative">
          <textarea
            id="sourceContent"
            className="input-field min-h-44 resize-y text-sm font-mono sm:font-sans leading-relaxed"
            placeholder="Example: Share how engineers and startup founders can leverage AI responsibly to boost productivity, accelerate code reviews, and build personal credibility without losing their authentic voice..."
            value={sourceContent}
            onChange={(event) => setSourceContent(event.target.value)}
            minLength={50}
            maxLength={10000}
            required
            disabled={loading || improvingAll}
          />

          <div className="flex items-center justify-between mt-2 px-1">
            <span
              className={`text-xs font-medium ${
                sourceContent.trim().length >= 50
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              {sourceContent.trim().length >= 50
                ? '✓ Ready to generate'
                : `Need ${Math.max(0, 50 - sourceContent.trim().length)} more characters`}
            </span>
            <span className="text-xs text-slate-400">
              {sourceContent.length.toLocaleString()} / 10,000 characters
            </span>
          </div>
        </div>

        {/* Customization */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <span>⚙️</span> Step 2: Customize Style & Tone
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="allTone"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Tone of Voice
              </label>

              <select
                id="allTone"
                className="input-field py-2 text-xs sm:text-sm font-medium"
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                disabled={loading || improvingAll}
              >
                <option value="professional">💼 Professional & Authoritative</option>
                <option value="friendly">😊 Warm & Conversational</option>
                <option value="witty">💡 Witty & Clever</option>
                <option value="inspirational">🚀 Uplifting & Motivating</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="allAudience"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Target Audience
              </label>

              <select
                id="allAudience"
                className="input-field py-2 text-xs sm:text-sm font-medium"
                value={targetAudience}
                onChange={(event) => setTargetAudience(event.target.value)}
                disabled={loading || improvingAll}
              >
                <option value="general">🌐 General Audience</option>
                <option value="students">🎓 Students & Learners</option>
                <option value="creators">🎨 Creators & Influencers</option>
                <option value="startups">🚀 Founders & Startups</option>
                <option value="businesses">🏢 Business Leaders & Clients</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="allLength"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Target Length
              </label>

              <select
                id="allLength"
                className="input-field py-2 text-xs sm:text-sm font-medium"
                value={length}
                onChange={(event) => setLength(event.target.value)}
                disabled={loading || improvingAll}
              >
                <option value="short">⚡ Punchy & Short</option>
                <option value="medium">⚖️ Balanced (Recommended)</option>
                <option value="long">📖 Deep-Dive & Detailed</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mt-4 pt-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHashtags}
                onChange={(event) => setIncludeHashtags(event.target.checked)}
                disabled={loading || improvingAll}
                className="h-4 w-4 rounded text-bloom-600 focus:ring-bloom-500 accent-bloom-600"
              />
              <span>Include platform-appropriate hashtags</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeEmojis}
                onChange={(event) => setIncludeEmojis(event.target.checked)}
                disabled={loading || improvingAll}
                className="h-4 w-4 rounded text-bloom-600 focus:ring-bloom-500 accent-bloom-600"
              />
              <span>Include natural emojis</span>
            </label>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-700 flex items-start gap-2.5"
          >
            <span className="text-base">⚠️</span>
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary mt-6 w-full py-3 text-base justify-center shadow-md disabled:opacity-50"
          disabled={
            loading || improvingAll || sourceContent.trim().length < 50
          }
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Synthesizing All Four Formats with Gemini...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>✨</span>
              <span>Generate All Four Formats</span>
            </span>
          )}
        </button>

        {loading && (
          <div className="mt-4 p-4 rounded-xl bg-bloom-50/70 border border-bloom-100 text-center animate-pulse">
            <p className="text-xs font-semibold text-bloom-800">
              AI is writing platform-native copy for LinkedIn, Instagram, Shorts & Carousels...
            </p>
          </div>
        )}
      </form>

      {/* Generated formats */}
      {results && (
        <section aria-labelledby="results-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-bloom-700">
                ✨ Content Studio Collection
              </span>
              <h2
                id="results-heading"
                className="text-2xl font-black text-slate-900 mt-1"
              >
                Four Tailored Formats Generated
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Edit individual outputs directly. Previews update live.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRegenerateAll}
                disabled={loading || improvingAll || sourceContent.trim().length < 50}
                className="btn-primary text-xs py-2 px-3.5"
              >
                {loading ? 'Regenerating...' : '🔄 Regenerate All'}
              </button>

              <button
                type="button"
                onClick={handleImproveAll}
                disabled={loading || improvingAll}
                className="btn-secondary text-xs py-2 px-3.5"
              >
                {improvingAll ? 'Improving...' : '✨ Improve All'}
              </button>

              <button
                type="button"
                onClick={handleSaveToHistory}
                disabled={loading || improvingAll}
                className="btn-secondary text-xs py-2 px-3.5 text-bloom-700 font-semibold"
              >
                💾 Save Collection
              </button>

              <button
                type="button"
                onClick={handleDownloadAll}
                disabled={loading || improvingAll}
                className="btn-secondary text-xs py-2 px-3.5"
              >
                📦 Download All (.txt)
              </button>
            </div>
          </div>

          {success && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm text-emerald-800 flex items-center justify-between gap-2 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span className="font-semibold">{success}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccess('')}
                className="text-xs text-emerald-600 hover:text-emerald-900"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {FORMATS.map((format) => {
              const currentMode = cardViews[format.key] || 'both'
              const charCount = (results[format.key] || '').length

              return (
                <article
                  key={format.key}
                  className="card flex flex-col justify-between border-slate-200/90 shadow-xs"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl" aria-hidden="true">
                          {format.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                            {format.title}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${format.badgeColor}`}>
                              Platform Ready
                            </span>
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {format.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* View switcher */}
                      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-[11px] font-semibold">
                        <button
                          type="button"
                          onClick={() => toggleCardView(format.key, 'editor')}
                          className={`px-2 py-1 rounded-md transition-colors ${
                            currentMode === 'editor'
                              ? 'bg-white text-bloom-700 shadow-xs font-bold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCardView(format.key, 'preview')}
                          className={`px-2 py-1 rounded-md transition-colors ${
                            currentMode === 'preview'
                              ? 'bg-white text-bloom-700 shadow-xs font-bold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          👁️ Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCardView(format.key, 'both')}
                          className={`px-2 py-1 rounded-md transition-colors hidden sm:inline-block ${
                            currentMode === 'both'
                              ? 'bg-white text-bloom-700 shadow-xs font-bold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          ⊞ Both
                        </button>
                      </div>
                    </div>

                    {/* Content area: Editor */}
                    {(currentMode === 'editor' || currentMode === 'both') && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1.5 px-0.5">
                          <label
                            htmlFor={`textarea-${format.key}`}
                            className="text-xs font-bold text-slate-700"
                          >
                            Live Editable Text
                          </label>
                          <span className="text-[11px] text-slate-400">
                            {charCount} characters
                          </span>
                        </div>

                        <textarea
                          id={`textarea-${format.key}`}
                          aria-label={`Edit ${format.title}`}
                          className="input-field min-h-56 resize-y text-xs sm:text-sm font-sans leading-relaxed"
                          value={results[format.key] || ''}
                          onChange={(event) => {
                            setResults((previous) => ({
                              ...previous,
                              [format.key]: event.target.value,
                            }))
                            setSuccess('')
                            setCopiedFormat('')
                          }}
                        />
                      </div>
                    )}

                    {/* Content area: Live Platform Preview */}
                    {(currentMode === 'preview' || currentMode === 'both') && (
                      <div className={currentMode === 'both' ? 'mt-4 pt-4 border-t border-slate-100' : 'mt-2'}>
                        {currentMode === 'both' && (
                          <div className="flex items-center justify-between mb-1 px-0.5">
                            <span className="text-xs font-bold text-slate-700">
                              Real-Time Platform Preview
                            </span>
                            <span className="text-[10px] text-slate-400">Updates as you edit</span>
                          </div>
                        )}
                        <PlatformPreview format={format} content={results[format.key] || ''} />
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">
                      {charCount.toLocaleString()} chars
                    </span>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(format.key)}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        {copiedFormat === format.key ? '✓ Copied!' : '📋 Copy'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(format.key, format.title)
                        }
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        ⬇ Download (.txt)
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
