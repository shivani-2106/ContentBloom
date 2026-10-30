import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getContentHistory,
  deleteContentHistoryItem,
  clearContentHistory,
} from '../utils/contentHistory'

const PLATFORM_LABELS = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube_shorts: 'YouTube Shorts',
  youtube_thumb: 'YouTube Thumbnail',
  carousel: 'Carousel Asset',
  instagram_reels: 'Instagram Reels',
  tiktok: 'TikTok Video',
  linkedin_video: 'LinkedIn Video',
}

const TYPE_LABELS = {
  social_post: 'Social Post',
  video_script: 'Video Script',
  carousel: 'Carousel',
  image_prompt: 'Image Prompt',
}

function formatDate(value) {
  if (!value) return 'Date unavailable'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Date unavailable'

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function VideoPlanHistoryItem({
  item,
  onCopy,
  onDownloadPlan,
  onDelete,
  copiedId,
  navigate,
}) {
  const plan = item.plan || {}
  const scenes = plan.scenes || []

  return (
    <article className="card border-l-4 border-l-red-500 hover:border-slate-300 transition-all duration-200">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 flex items-center gap-1.5">
            <span>🎬</span> Video Storyboard Plan
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
            ~{plan.total_duration_seconds || item.targetDuration || 30}s
          </span>
          {item.platform && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
              {PLATFORM_LABELS[item.platform] || item.platform}
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {scenes.length} Scenes
          </span>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {formatDate(item.createdAt)}
        </span>
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-1.5">
        {plan.title || 'Video Script & Storyboard'}
      </h3>

      {plan.hook && (
        <div className="p-2.5 rounded-lg border border-red-100 bg-red-50/50 mb-3 text-xs">
          <span className="font-bold text-red-700 block mb-0.5 uppercase tracking-wide text-[10px]">
            ⚡ Hook
          </span>
          <p className="font-medium text-slate-800 leading-snug">"{plan.hook}"</p>
        </div>
      )}

      {/* Voiceover preview */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 mb-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Voiceover Script Excerpt
        </span>
        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed line-clamp-3">
          {scenes.map((s) => `[Scene ${s.scene_number}] ${s.voiceover}`).join(' ') || item.content}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              onCopy(
                scenes.map((s) => `[Scene ${s.scene_number} - ${s.duration_seconds}s]\n${s.voiceover}`).join('\n\n') || item.content,
                `vid-${item.id}`
              )
            }
            className="btn-primary text-xs py-1.5 px-3"
          >
            {copiedId === `vid-${item.id}` ? '✓ Copied!' : '📋 Copy Voiceover Script'}
          </button>

          <button
            type="button"
            onClick={() => onDownloadPlan(item)}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            ⬇ Download Plan (.txt)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              navigate('/video-studio', {
                state: { sourceContent: item.sourceContent },
              })
            }
            className="btn-secondary text-xs py-1.5 px-3 text-red-700 hover:text-red-900 font-bold"
          >
            🎬 Open in Video Studio
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="btn-secondary text-xs py-1.5 px-3 text-red-600 hover:text-red-700"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </article>
  )
}

function ImagePromptHistoryItem({
  item,
  onCopy,
  onDownloadSpec,
  onDelete,
  copiedId,
  navigate,
}) {
  const spec = item.spec || {}

  return (
    <article className="card border-l-4 border-l-purple-500 hover:border-slate-300 transition-all duration-200">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800 flex items-center gap-1.5">
            <span>🎨</span> AI Visual Spec & Prompt
          </span>
          {item.aspectRatio && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-700">
              {item.aspectRatio}
            </span>
          )}
          {item.platform && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
              {PLATFORM_LABELS[item.platform] || item.platform}
            </span>
          )}
          {item.visualStyle && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
              {item.visualStyle.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {formatDate(item.createdAt)}
        </span>
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-1.5">
        {spec.title || 'Visual Concept'}
      </h3>

      {item.sourceContent && (
        <p className="text-xs text-slate-500 italic mb-3 line-clamp-2">
          Source: "{item.sourceContent}"
        </p>
      )}

      {/* Prompt preview box */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 mb-3">
        <p className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed line-clamp-4">
          {spec.primary_prompt || item.content}
        </p>
      </div>

      {spec.color_palette && spec.color_palette.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-bold text-slate-500">Palette:</span>
          <div className="flex items-center gap-1.5">
            {spec.color_palette.map((c, i) => (
              <span
                key={i}
                className="h-3.5 w-7 rounded-md border border-slate-300"
                style={{ backgroundColor: c.startsWith('#') ? c : '#38bdf8' }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCopy(spec.primary_prompt || item.content, `img-${item.id}`)}
            className="btn-primary text-xs py-1.5 px-3"
          >
            {copiedId === `img-${item.id}` ? '✓ Copied!' : '📋 Copy Prompt'}
          </button>

          {spec.copy_ready_midjourney && (
            <button
              type="button"
              onClick={() => onCopy(spec.copy_ready_midjourney, `mj-${item.id}`)}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              {copiedId === `mj-${item.id}` ? '✓ Copied!' : 'Copy for Midjourney'}
            </button>
          )}

          <button
            type="button"
            onClick={() => onDownloadSpec(item)}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            ⬇ Download Spec (.txt)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              navigate('/image-studio', {
                state: { sourceContent: item.sourceContent },
              })
            }
            className="btn-secondary text-xs py-1.5 px-3 text-purple-700 hover:text-purple-900 font-bold"
          >
            🎨 Open Studio
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="btn-secondary text-xs py-1.5 px-3 text-red-600 hover:text-red-700"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </article>
  )
}

function GroupedHistoryItem({
  item,
  onCopy,
  onDownloadFormat,
  onDownloadAll,
  onDelete,
  copiedId,
  navigate,
}) {
  const [activeTab, setActiveTab] = useState('linkedin')
  const formats = item.formats || {}
  const activeContent = formats[activeTab] || ''

  const formatList = [
    { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { key: 'instagram', label: 'Instagram', icon: '📸' },
    { key: 'youtube_shorts', label: 'Shorts', icon: '🎬' },
    { key: 'carousel', label: 'Carousel', icon: '🎨' },
  ]

  return (
    <article className="card border-l-4 border-l-bloom-500 hover:border-slate-300 transition-all duration-200">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-bloom-100 px-3 py-1 text-xs font-bold text-bloom-800 flex items-center gap-1.5">
            <span>✨</span> 4-Format Collection
          </span>
          {item.tone && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
              {item.tone}
            </span>
          )}
          {item.targetAudience && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
              {item.targetAudience}
            </span>
          )}
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {formatDate(item.createdAt)}
        </span>
      </div>

      {item.sourceContent && (
        <p className="text-xs text-slate-600 italic mb-4 line-clamp-2 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
          <span className="font-semibold text-slate-500 not-italic">Source:</span> "{item.sourceContent}"
        </p>
      )}

      {/* Format switcher tabs */}
      <div className="flex flex-wrap border-b border-slate-200 mb-3 gap-1">
        {formatList.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveTab(f.key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeTab === f.key
                ? 'bg-bloom-50 text-bloom-700 border-b-2 border-bloom-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-4">
        <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap break-words line-clamp-6 leading-relaxed font-sans">
          {activeContent || 'No content generated for this format.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCopy(activeContent, `${item.id}-${activeTab}`)}
            className="btn-primary text-xs py-1.5 px-3"
          >
            {copiedId === `${item.id}-${activeTab}`
              ? '✓ Copied!'
              : `📋 Copy ${formatList.find((f) => f.key === activeTab)?.label}`}
          </button>

          <button
            type="button"
            onClick={() => onDownloadFormat(activeContent, activeTab, item.id)}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            ⬇ Download {formatList.find((f) => f.key === activeTab)?.label}
          </button>

          <button
            type="button"
            onClick={() => onDownloadAll(item)}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            📦 Download All 4
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              navigate('/image-studio', {
                state: { sourceContent: item.sourceContent },
              })
            }
            className="btn-secondary text-xs py-1.5 px-3 text-purple-700 font-semibold"
          >
            🎨 Visual Studio
          </button>

          <button
            type="button"
            onClick={() =>
              navigate('/generate-all', { state: { historyItem: item } })
            }
            className="btn-secondary text-xs py-1.5 px-3 text-bloom-700 hover:text-bloom-800 font-bold"
          >
            ✏️ Open in Studio
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="btn-secondary text-xs py-1.5 px-3 text-red-600 hover:text-red-700"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </article>
  )
}

export default function History() {
  const navigate = useNavigate()
  const [history, setHistory] = useState(() => getContentHistory())
  const [copiedId, setCopiedId] = useState('')
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'grouped' | 'videos' | 'images' | 'single'

  useEffect(() => {
    setHistory(getContentHistory())
  }, [])

  async function handleCopyText(text, copyIdentifier) {
    if (!text || !text.trim()) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(copyIdentifier)
      setMessage('')
      setTimeout(() => setCopiedId(''), 2000)
    } catch {
      setMessage(
        'Unable to copy automatically. Please open the item and copy its text.'
      )
    }
  }

  function handleDownloadText(text, filename) {
    if (!text || !text.trim()) return
    const blob = new Blob([text], {
      type: 'text/plain;charset=utf-8',
    })

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  function handleDownloadGroupedAll(item) {
    const formats = item.formats || {}
    const text = [
      `=== LINKEDIN POST ===\n\n${formats.linkedin || ''}`,
      `=== INSTAGRAM CAPTION ===\n\n${formats.instagram || ''}`,
      `=== YOUTUBE SHORTS SCRIPT ===\n\n${formats.youtube_shorts || ''}`,
      `=== CAROUSEL CONTENT ===\n\n${formats.carousel || ''}`,
    ].join('\n\n----------------------------------------\n\n')

    handleDownloadText(text, `ContentBloom_Collection_${item.id}.txt`)
  }

  function handleDownloadSpec(item) {
    const spec = item.spec || {}
    const text = [
      `=== CONTENTBLOOM AI — VISUAL SPECIFICATION ===`,
      `TITLE: ${spec.title || 'Visual Concept'}`,
      `PLATFORM: ${item.platform || ''}`,
      `ASPECT RATIO: ${item.aspectRatio || ''}`,
      `STYLE: ${item.visualStyle || ''}`,
      ``,
      `PRIMARY PROMPT:`,
      spec.primary_prompt || item.content,
      ``,
      `NEGATIVE PROMPT:`,
      spec.negative_prompt || '',
      ``,
      `MIDJOURNEY PROMPT:`,
      spec.copy_ready_midjourney || '',
      ``,
      `DALL-E PROMPT:`,
      spec.copy_ready_dalle || '',
    ].join('\n')

    handleDownloadText(text, `ContentBloom_Visual_Spec_${item.id}.txt`)
  }

  function handleDownloadVideoPlan(item) {
    const plan = item.plan || {}
    const scenes = plan.scenes || []
    const text = [
      `=== CONTENTBLOOM AI — VIDEO PRODUCTION PLAN ===`,
      `TITLE: ${plan.title || ''}`,
      `PLATFORM: ${item.platform || ''}`,
      `DURATION: ${plan.total_duration_seconds || item.targetDuration || 30}s`,
      `HOOK: ${plan.hook || ''}`,
      `MUSIC: ${plan.audio_suggestion || ''}`,
      ``,
      ...scenes.map((s) => [
        `SCENE ${s.scene_number} [${s.duration_seconds}s | ${s.transition}]`,
        `Visual: ${s.visual_description}`,
        `Voiceover: "${s.voiceover}"`,
        `On-Screen: [${s.on_screen_text}]`,
      ].join('\n')),
      ``,
      `CTA: ${plan.call_to_action || ''}`,
    ].join('\n\n')

    handleDownloadText(text, `ContentBloom_Video_Plan_${item.id}.txt`)
  }

  function handleDelete(id) {
    const confirmed = window.confirm('Delete this item from history?')
    if (!confirmed) return
    const updatedHistory = deleteContentHistoryItem(id)
    setHistory(updatedHistory)
    setMessage('History item deleted.')
  }

  function handleClearAll() {
    if (history.length === 0) return

    const confirmed = window.confirm(
      'Delete all saved content history? This action cannot be undone.'
    )

    if (!confirmed) return

    clearContentHistory()
    setHistory([])
    setMessage('All content history has been cleared.')
  }

  const groupedCount = history.filter((i) => i.isGrouped || i.formats).length
  const videosCount = history.filter((i) => i.isVideoPlan || (i.contentType === 'video_script' && i.plan)).length
  const imagesCount = history.filter((i) => i.isImagePrompt || i.contentType === 'image_prompt').length
  const campaignCount = history.filter((i) => i.isCampaignPackage || i.contentType === 'campaign_package').length
  const singleCount = Math.max(0, history.length - groupedCount - videosCount - imagesCount - campaignCount)

  const filteredHistory = history.filter((item) => {
    const isGrouped = item.isGrouped || item.formats
    const isVideo = item.isVideoPlan || (item.contentType === 'video_script' && item.plan)
    const isImage = item.isImagePrompt || item.contentType === 'image_prompt'
    const isCampaign = item.isCampaignPackage || item.contentType === 'campaign_package'
    if (filter === 'grouped') return isGrouped
    if (filter === 'videos') return isVideo
    if (filter === 'images') return isImage
    if (filter === 'campaign') return isCampaign
    if (filter === 'single') return !isGrouped && !isVideo && !isImage && !isCampaign
    return true
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="section-label">Your Content Archive</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Content Library & History
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Revisit, re-edit, copy, or export your 4-format collections, video storyboards, image specs, and single posts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/generate-all" className="btn-primary text-xs py-2 px-3.5 shadow-xs">
            <span>✨</span> 4 Formats
          </Link>
          <Link to="/video-studio" className="btn-secondary text-xs py-2 px-3.5">
            <span>🎬</span> Video Studio
          </Link>
          <Link to="/image-studio" className="btn-secondary text-xs py-2 px-3.5">
            <span>🎨</span> Image Studio
          </Link>
          <Link to="/generate" className="btn-secondary text-xs py-2 px-3.5">
            + Single Post
          </Link>
        </div>
      </div>

      {/* Stats and filter bar */}
      <div className="card mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Saved</p>
            <p className="text-2xl font-black text-slate-900">{history.length}</p>
          </div>
          <div className="h-8 w-[1px] bg-slate-200 hidden sm:block" />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-bloom-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('grouped')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'grouped'
                  ? 'bg-bloom-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ✨ Collections ({groupedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('videos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'videos'
                  ? 'bg-bloom-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🎬 Videos ({videosCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('images')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'images'
                  ? 'bg-bloom-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🎨 Images ({imagesCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('campaign')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'campaign'
                  ? 'bg-bloom-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🚀 Campaigns ({campaignCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'single'
                  ? 'bg-bloom-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📝 Single ({singleCount})
            </button>
          </div>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-semibold text-red-600 hover:text-red-700 py-1.5 px-3 rounded-lg border border-red-200 hover:bg-red-50 transition-colors self-start sm:self-auto"
          >
            Clear Entire History
          </button>
        )}
      </div>

      {/* Feedback banner */}
      {message && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-bloom-200 bg-bloom-50 px-4 py-3 text-xs sm:text-sm text-bloom-800 flex items-center justify-between"
        >
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage('')}
            className="text-bloom-600 hover:text-bloom-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Content stream or empty state */}
      {filteredHistory.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4" aria-hidden="true">
            📚
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {history.length === 0
              ? 'Your content library is empty'
              : 'No entries match this filter'}
          </h2>

          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            {history.length === 0
              ? 'Generated posts, video storyboards, and collections will automatically be saved here so you can revisit, export, and edit anytime.'
              : 'Try selecting a different filter above to view your saved content.'}
          </p>

          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/generate-all" className="btn-primary text-sm">
              <span>✨</span> Generate 4 Formats
            </Link>
            <Link to="/video-studio" className="btn-secondary text-sm">
              <span>🎬</span> Create Video Storyboard
            </Link>
            <Link to="/image-studio" className="btn-secondary text-sm">
              <span>🎨</span> Create Visual Prompt
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredHistory.map((item) => {
            if (item.isVideoPlan || (item.contentType === 'video_script' && item.plan)) {
              return (
                <VideoPlanHistoryItem
                  key={item.id}
                  item={item}
                  onCopy={(text, id) => handleCopyText(text, id)}
                  onDownloadPlan={handleDownloadVideoPlan}
                  onDelete={handleDelete}
                  copiedId={copiedId}
                  navigate={navigate}
                />
              )
            }

            if (item.isImagePrompt || item.contentType === 'image_prompt') {
              return (
                <ImagePromptHistoryItem
                  key={item.id}
                  item={item}
                  onCopy={(text, id) => handleCopyText(text, id)}
                  onDownloadSpec={handleDownloadSpec}
                  onDelete={handleDelete}
                  copiedId={copiedId}
                  navigate={navigate}
                />
              )
            }

            if (item.isGrouped || item.formats) {
              return (
                <GroupedHistoryItem
                  key={item.id}
                  item={item}
                  onCopy={(text, id) => handleCopyText(text, id)}
                  onDownloadFormat={(text, key, id) =>
                    handleDownloadText(text, `ContentBloom_${key}_${id}.txt`)
                  }
                  onDownloadAll={handleDownloadGroupedAll}
                  onDelete={handleDelete}
                  copiedId={copiedId}
                  navigate={navigate}
                />
              )
            }

            return (
              <article
                key={item.id}
                className="card hover:border-slate-300 transition-all duration-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-bloom-100 px-3 py-1 text-xs font-bold text-bloom-700">
                      {PLATFORM_LABELS[item.platform] ||
                        item.platform ||
                        'Content'}
                    </span>

                    <span className="rounded-full bg-accent-400/20 px-3 py-1 text-xs font-bold text-accent-700">
                      {TYPE_LABELS[item.contentType] ||
                        item.contentType ||
                        'Generated'}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-4">
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap break-words line-clamp-6 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyText(item.content, item.id)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      {copiedId === item.id ? '✓ Copied!' : '📋 Copy Text'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadText(
                          item.content,
                          `ContentBloom_${item.platform || 'content'}_${item.id}.txt`
                        )
                      }
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      ⬇ Download (.txt)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="btn-secondary text-xs py-1.5 px-3 text-red-600 hover:text-red-700"
                  >
                    🗑 Delete
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <p className="mt-10 text-xs text-slate-400 text-center">
        🔒 All content and production specs are stored locally in your browser storage.
      </p>
    </div>
  )
}
