import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { generateVideoPlan } from '../api/contentApi'
import { saveContentHistory } from '../utils/contentHistory'
import { renderVideoFromPlan, downloadVideoBlob, renderScenePreviewFrame } from '../utils/canvasVideoEngine'

const PLATFORMS = [
  {
    id: 'youtube_shorts',
    name: 'YouTube Shorts',
    icon: '🎬',
    desc: '9:16 vertical video with high-retention 3s hook & rapid pacing',
    badge: '9:16 Vertical',
  },
  {
    id: 'instagram_reels',
    name: 'Instagram Reels',
    icon: '📸',
    desc: '9:16 aesthetic social reel with audio cues & kinetic captions',
    badge: '9:16 Vertical',
  },
  {
    id: 'tiktok',
    name: 'TikTok Video',
    icon: '📱',
    desc: 'Fast-paced storytelling with pattern interrupts & bold overlays',
    badge: '9:16 Vertical',
  },
  {
    id: 'linkedin_video',
    name: 'LinkedIn Video',
    icon: '💼',
    desc: 'Professional educational breakdown or founder insight',
    badge: '16:9 / 1:1',
  },
]

const DURATIONS = [
  { seconds: 15, label: '15 seconds', tag: 'Micro-Hook' },
  { seconds: 30, label: '30 seconds', tag: 'Optimal Retention' },
  { seconds: 45, label: '45 seconds', tag: 'Extended Story' },
  { seconds: 60, label: '60 seconds', tag: 'Full Deep Dive' },
]

const VISUAL_STYLES = [
  {
    id: 'kinetic_tech',
    label: 'Kinetic Tech / Neon Dark',
    icon: '⚡',
    desc: 'Deep indigo & slate backdrop, vibrant cyan/magenta highlights, high energy',
  },
  {
    id: 'creator_vibrant',
    label: 'Creator Sunset / Vibrant',
    icon: '🔥',
    desc: 'Warm berry and gold hues, punchy modern social aesthetic',
  },
  {
    id: 'minimal_modern',
    label: 'Minimalist Clean SaaS',
    icon: '📐',
    desc: 'Clean typography, refined slate cards, subtle borders',
  },
  {
    id: 'editorial_dark',
    label: 'Editorial Documentary',
    icon: '🎥',
    desc: 'Subdued cinematic contrast, crisp typography, authoritative feel',
  },
]

const FORMAT_ARCHETYPES = [
  { id: 'educational_explainer', label: 'Educational Explainer', icon: '📚' },
  { id: 'promotional', label: 'Promotional / Launch', icon: '⚡' },
  { id: 'product_demo', label: 'Product Demonstration', icon: '🚀' },
  { id: 'listicle', label: 'Actionable Listicle (Top 3-5)', icon: '📋' },
  { id: 'storytelling', label: 'Founder Story / Case Study', icon: '🎙️' },
]

const COMPOSITION_OPTIONS = [
  { id: 'hook_intro', label: '⚡ 3s Retention Hook', desc: 'Attention countdown & kinetic headline box' },
  { id: 'stat_chart', label: '📈 Animated Benchmark Chart', desc: 'Counting metrics, progress bars & KPI badges' },
  { id: 'step_card', label: '✅ Action Step & Checklist', desc: 'Numbered step highlight with sequential checkmarks' },
  { id: 'comparison', label: '⚖️ Split Comparison', desc: 'Traditional vs. ContentBloom before/after' },
  { id: 'graphic_asset', label: '🖼️ Graphic Studio Asset', desc: 'Direct integration with generated PNG image' },
  { id: 'cta_outro', label: '🔔 Closing CTA & Subscribe', desc: 'Pulsing subscribe badge and conversion callout' },
]

export default function VideoStudio() {
  const location = useLocation()

  const [sourceContent, setSourceContent] = useState('')
  const [platform, setPlatform] = useState('youtube_shorts')
  const [targetDuration, setTargetDuration] = useState(30)
  const [tone, setTone] = useState('friendly')
  const [targetAudience, setTargetAudience] = useState('general')
  const [visualStyle, setVisualStyle] = useState('kinetic_tech')
  const [contentFormat, setContentFormat] = useState('educational_explainer')
  const [additionalInstructions, setAdditionalInstructions] = useState('')

  // Image-to-Video Integration: preloaded graphic from ImageStudio
  const [sourceGraphic, setSourceGraphic] = useState(null)

  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copiedKey, setCopiedKey] = useState('')

  // Playable Video Rendering State
  const [renderingVideo, setRenderingVideo] = useState(false)
  const [renderProgress, setRenderProgress] = useState({
    percent: 0,
    currentScene: 1,
    totalScenes: 1,
  })
  const [renderedVideo, setRenderedVideo] = useState(null)

  useEffect(() => {
    if (location.state?.sourceContent) {
      setSourceContent(location.state.sourceContent)
    } else if (location.state?.script) {
      setSourceContent(location.state.script)
    }

    if (location.state?.sourceGraphic) {
      setSourceGraphic(location.state.sourceGraphic)
      setSuccess('Connected Image Studio graphic asset! It will appear directly in your video.')
    }
  }, [location.state])

  async function handleRenderPlayableVideo() {
    if (!plan || !plan.scenes?.length) return
    setError('')
    setSuccess('')
    setRenderingVideo(true)
    setRenderProgress({
      percent: 0,
      currentScene: 1,
      totalScenes: plan.scenes.length,
    })

    try {
      const result = await renderVideoFromPlan(
        plan,
        (prog) => {
          setRenderProgress(prog)
        },
        {
          sourceGraphic,
          visualStyle,
        }
      )
      setRenderedVideo(result)
      setSuccess('Playable vertical video rendered successfully! Preview and download below.')
    } catch (err) {
      console.error('Video rendering error:', err)
      setError(
        'Video rendering encountered an issue: ' +
          (err.message || 'Browser MediaRecorder not supported.')
      )
    } finally {
      setRenderingVideo(false)
    }
  }

  function handleDownloadVideo() {
    if (!renderedVideo?.blob) return
    const filename = `ContentBloom_${plan?.title ? plan.title.replace(/\s+/g, '_') : 'Video'}_9x16.webm`
    downloadVideoBlob(renderedVideo.blob, filename)
    setSuccess(`Downloaded ${filename} successfully!`)
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleGenerate(e) {
    e.preventDefault()
    if (!sourceContent.trim() || sourceContent.trim().length < 10) return

    setError('')
    setSuccess('')
    setCopiedKey('')
    setLoading(true)

    try {
      const data = await generateVideoPlan({
        source_content: sourceContent.trim(),
        platform,
        target_duration: targetDuration,
        tone,
        target_audience: targetAudience,
        visual_style: visualStyle,
        content_format: contentFormat,
        additional_instructions: additionalInstructions.trim(),
      })

      // If user provided a graphic, ensure one scene uses it
      if (sourceGraphic && data.scenes && data.scenes.length > 1) {
        data.scenes[1].composition_type = 'graphic_asset'
      }

      setPlan(data)

      // Auto-save to History
      saveContentHistory({
        sourceContent: sourceContent.trim(),
        isVideoPlan: true,
        contentType: 'video_script',
        platform,
        targetDuration,
        tone,
        targetAudience,
        visualStyle,
        contentFormat,
        plan: data,
        sourceGraphic,
        content: `[Video Plan: ${data.title}]\n\nHOOK: ${data.hook}\nFORMAT: ${data.content_format || contentFormat}\nSTYLE: ${data.visual_style || visualStyle}\n\nVOICEOVER SCRIPT:\n${data.scenes.map((s) => `[Scene ${s.scene_number} - ${s.composition_type || 'card'}] ${s.voiceover}`).join('\n\n')}\n\nCTA: ${data.call_to_action}`,
      })

      setSuccess('Video visual plan & storyboard generated! Review scenes below or render the actual WebM video.')
    } catch (err) {
      setError(err.message || 'Failed to generate video plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSceneEdit(sceneIndex, field, value) {
    if (!plan) return
    const updatedScenes = [...plan.scenes]
    updatedScenes[sceneIndex] = {
      ...updatedScenes[sceneIndex],
      [field]: value,
    }
    setPlan({
      ...plan,
      scenes: updatedScenes,
    })
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

  function handleDownloadPlan() {
    if (!plan) return
    const content = [
      `=== CONTENTBLOOM AI — VIDEO PRODUCTION PLAN & STORYBOARD ===`,
      `TITLE: ${plan.title}`,
      `PLATFORM: ${plan.platform}`,
      `CONTENT FORMAT: ${plan.content_format || contentFormat}`,
      `VISUAL STYLE: ${plan.visual_style || visualStyle}`,
      `TOTAL DURATION: ~${plan.total_duration_seconds} seconds`,
      `TONE: ${plan.tone} | AUDIENCE: ${plan.target_audience}`,
      ``,
      `--- 3-SECOND OPENING HOOK ---`,
      plan.hook,
      ``,
      `--- AUDIO & MUSIC DIRECTION ---`,
      plan.audio_suggestion,
      ``,
      `--- SCENE-BY-SCENE STORYBOARD ---`,
      ...plan.scenes.map((s) => [
        `SCENE ${s.scene_number} [Duration: ${s.duration_seconds}s | Composition: ${s.composition_type || 'Standard'} | Transition: ${s.transition}]`,
        `ON-SCREEN TEXT: [${s.on_screen_text}]`,
        `VOICEOVER: "${s.voiceover}"`,
        `VISUAL DIRECTION: ${s.visual_description}`,
        s.visual_prompt ? `B-ROLL PROMPT: ${s.visual_prompt}` : '',
        `----------------------------------------`,
      ].filter(Boolean).join('\n')),
      ``,
      `--- CLOSING CALL TO ACTION ---`,
      plan.call_to_action,
      ``,
      `Generated by ContentBloom AI Video Studio`,
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `ContentBloom_Video_Plan_${plan.title.replace(/\s+/g, '_')}.txt`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  function handleCopyAllVoiceover() {
    if (!plan) return
    const script = plan.scenes
      .map((s) => `[Scene ${s.scene_number} - ${s.duration_seconds}s]\n${s.voiceover}`)
      .join('\n\n')
    handleCopy(script, 'all_voiceover')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <span className="section-label">
            <span>🎬</span> Short-Form Video Producer
          </span>
          <div className="flex gap-2">
            <Link to="/generate-all" className="btn-secondary text-xs py-1 px-3">
              ✨ 4-in-1 Text Studio
            </Link>
            <Link to="/image-studio" className="btn-secondary text-xs py-1 px-3">
              🎨 Image Studio
            </Link>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Video Script & Storyboard Studio
        </h1>

        <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          Produce high-retention vertical videos with scene-specific animated compositions, synchronized voiceover narration, animated stat charts, and genuine WebM export for YouTube Shorts, Reels, and TikTok.
        </p>

        {/* Image-to-Video Integration Banner if connected */}
        {sourceGraphic && (
          <div className="mt-4 p-3 rounded-xl border border-sky-300 bg-sky-50 text-sky-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <span className="text-xl">🖼️</span>
              <div>
                <strong>Image Studio Asset Connected:</strong> This graphic will be loaded directly into your video render!
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSourceGraphic(null)}
              className="text-xs text-sky-700 hover:text-sky-900 font-semibold"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Input Parameters Form */}
      <form onSubmit={handleGenerate} className="card mb-10 shadow-xs border-slate-200">
        <div className="mb-6">
          <label
            htmlFor="videoSource"
            className="block text-sm font-bold text-slate-900 mb-1"
          >
            1. Source Content or Video Topic
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Paste your article, script draft, bullet points, or core message.
          </p>

          <textarea
            id="videoSource"
            className="input-field min-h-32 text-sm leading-relaxed"
            placeholder="Example: Explain 3 practical tips for junior developers to break into tech companies without burnout..."
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            minLength={10}
            maxLength={10000}
            required
            disabled={loading}
          />
        </div>

        {/* Content Format & Visual Style Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Content Format Archetype
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FORMAT_ARCHETYPES.map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setContentFormat(fmt.id)}
                  disabled={loading}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                    contentFormat === fmt.id
                      ? 'border-bloom-500 bg-bloom-50/80 text-bloom-950 font-bold ring-1 ring-bloom-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">{fmt.icon}</span>
                  <span className="truncate">{fmt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              3. Visual Style & Palette
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VISUAL_STYLES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setVisualStyle(st.id)}
                  disabled={loading}
                  className={`flex items-start gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                    visualStyle === st.id
                      ? 'border-bloom-500 bg-bloom-50/80 text-bloom-950 font-bold ring-1 ring-bloom-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base mt-0.5">{st.icon}</span>
                  <div>
                    <p className="font-bold leading-tight">{st.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Platform & Target Duration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              4. Target Platform Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  disabled={loading}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left text-xs transition-all ${
                    platform === p.id
                      ? 'border-bloom-500 bg-bloom-50/80 text-bloom-900 shadow-xs ring-1 ring-bloom-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl mt-0.5">{p.icon}</span>
                  <div>
                    <p className="font-bold leading-tight">{p.name}</p>
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1 bg-slate-100 px-1.5 py-0.2 rounded">
                      {p.badge}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              5. Target Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.seconds}
                  type="button"
                  onClick={() => setTargetDuration(d.seconds)}
                  disabled={loading}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                    targetDuration === d.seconds
                      ? 'border-bloom-500 bg-bloom-50/80 text-bloom-900 shadow-xs ring-1 ring-bloom-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-bold">{d.label}</span>
                  <span className="text-[10px] text-slate-500 font-normal mt-0.5">
                    {d.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tone & Audience Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-100">
          <div>
            <label htmlFor="videoTone" className="block text-xs font-bold text-slate-700 mb-1.5">
              Tone of Voice
            </label>
            <select
              id="videoTone"
              className="input-field py-2 text-xs sm:text-sm font-medium"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={loading}
            >
              <option value="friendly">😊 Warm & Approachable</option>
              <option value="professional">💼 Authoritative & Educational</option>
              <option value="witty">💡 Fast & Energetic Humor</option>
              <option value="inspirational">🚀 Motivating & High Energy</option>
            </select>
          </div>

          <div>
            <label htmlFor="videoAudience" className="block text-xs font-bold text-slate-700 mb-1.5">
              Target Audience
            </label>
            <select
              id="videoAudience"
              className="input-field py-2 text-xs sm:text-sm font-medium"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              disabled={loading}
            >
              <option value="general">🌐 General Viewers</option>
              <option value="creators">🎨 Content Creators</option>
              <option value="students">🎓 Students & Learners</option>
              <option value="startups">🚀 Founders & Techies</option>
              <option value="businesses">🏢 Business Professionals</option>
            </select>
          </div>
        </div>

        {/* Additional Instructions */}
        <div className="mb-6 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            6. Additional Creative Instructions (Optional)
          </label>
          <input
            type="text"
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            placeholder="e.g. Include an animated stat chart in Scene 2, focus on concrete tips, punchy 3-word captions"
            className="input-field text-xs sm:text-sm py-2"
            disabled={loading}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-700 flex items-start gap-2.5"
          >
            <span>⚠️</span>
            <div className="flex-1">{error}</div>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full py-3 text-base justify-center shadow-md disabled:opacity-50"
          disabled={loading || sourceContent.trim().length < 10}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Producing Video Storyboard & Pacing Scenes...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>🎬</span>
              <span>Generate Video Production Plan</span>
            </span>
          )}
        </button>
      </form>

      {/* Video Production Plan Output */}
      {plan && (
        <section aria-labelledby="video-plan-heading" className="space-y-6">
          {success && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm text-emerald-800 flex items-center justify-between"
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

          {/* Master Video Plan Card */}
          <div className="card border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-bloom-700 bg-bloom-50 px-2 py-0.5 rounded">
                    🎬 Video Plan
                  </span>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded capitalize">
                    {plan.content_format?.replace('_', ' ') || contentFormat}
                  </span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    ~{plan.total_duration_seconds}s Duration
                  </span>
                </div>
                <h2
                  id="video-plan-heading"
                  className="text-2xl font-black text-slate-900 tracking-tight"
                >
                  {plan.title}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAllVoiceover}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  {copiedKey === 'all_voiceover' ? '✓ Script Copied!' : '📋 Copy Full Script'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPlan}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  ⬇ Download Plan (.txt)
                </button>
              </div>
            </div>

            {/* Hook Banner */}
            <div className="mt-4 p-4 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50/50">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-700 block mb-1">
                ⚡ 3-Second Retention Hook
              </span>
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                "{plan.hook}"
              </p>
            </div>

            {/* Audio & Sound Direction */}
            {plan.audio_suggestion && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-700">🎵 Sound Direction:</span>
                <span>{plan.audio_suggestion}</span>
              </div>
            )}
          </div>

          {/* Actual Playable Video Generation & Player Card */}
          <div className="card bg-slate-900 border-slate-800 text-white shadow-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎬</span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Actual Playable Video Studio</span>
                    <span className="text-[10px] font-mono bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                      9:16 Vertical
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Render animated scenes, kinetic typography, charts, transitions, and audio rhythm directly to an exportable WebM video file.
                  </p>
                </div>
              </div>

              {!renderedVideo && !renderingVideo && (
                <button
                  type="button"
                  onClick={handleRenderPlayableVideo}
                  className="btn-primary py-2 px-4 text-xs font-bold shadow-md shrink-0"
                >
                  ▶️ Render Playable Video (30 FPS)
                </button>
              )}
            </div>

            {/* State 1: Rendering in progress */}
            {renderingVideo && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full border-4 border-bloom-500 border-t-transparent animate-spin mb-4" />
                <h4 className="text-base font-bold text-white mb-1">
                  Rendering Scene {renderProgress.currentScene} of {renderProgress.totalScenes}...
                </h4>
                <p className="text-xs text-slate-400 max-w-md mb-4">
                  Synthesizing animated compositions, kinetic typography, transitions, and audio rhythm track ({renderProgress.percent}%)
                </p>

                {/* Progress Bar */}
                <div className="w-full max-w-md h-3 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-bloom-500 to-purple-500 transition-all duration-150"
                    style={{ width: `${renderProgress.percent}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-bloom-400 mt-2 font-bold">
                  {renderProgress.percent}% Completed
                </span>
              </div>
            )}

            {/* State 2: Video Rendered & Ready to Play */}
            {renderedVideo && !renderingVideo && (
              <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Video Player Frame */}
                <div className="md:col-span-5 flex justify-center">
                  <div className="relative aspect-[9/16] w-full max-w-[240px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
                    <video
                      src={renderedVideo.url}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Video Details & Action Panel */}
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    <span>✓</span>
                    <span>9:16 Video Ready for Shorts & Reels</span>
                  </div>

                  <h4 className="text-xl font-black text-white">
                    {plan.title}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-500 block uppercase">Resolution</span>
                      <span className="font-bold text-white">540 × 960 (9:16)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-500 block uppercase">Frame Rate</span>
                      <span className="font-bold text-white">30 FPS Smooth</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-500 block uppercase">Audio Track</span>
                      <span className="font-bold text-white">Synthesized Ambient</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-500 block uppercase">Format</span>
                      <span className="font-bold text-white">WebM Video File</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleDownloadVideo}
                      className="btn-primary py-2.5 px-5 text-sm font-bold shadow-lg"
                    >
                      ⬇ Download Video File (.webm)
                    </button>
                    <button
                      type="button"
                      onClick={handleRenderPlayableVideo}
                      className="btn-secondary py-2.5 px-4 text-xs font-bold bg-white/10 text-white hover:bg-white/20 border-white/20"
                    >
                      🔄 Re-Render Video
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* State 3: Not rendered yet callout */}
            {!renderedVideo && !renderingVideo && (
              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-300">
                  <p className="font-semibold text-white mb-0.5">
                    Ready to render your playable video file?
                  </p>
                  <p className="text-slate-400">
                    ContentBloom AI's upgraded engine renders scene-specific compositions, charts, kinetic captions, and audio chimes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRenderPlayableVideo}
                  className="btn-primary text-xs py-2 px-4 shrink-0 shadow-md font-bold"
                >
                  ▶️ Render Playable Video
                </button>
              </div>
            )}
          </div>

          {/* Scene-by-Scene Storyboard */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>🎞️</span> Scene-by-Scene Storyboard & Visual Composition ({plan.scenes.length} Scenes)
            </h3>

            {plan.scenes.map((scene, index) => (
              <div
                key={scene.scene_number || index}
                className="card border-slate-200 hover:border-slate-300 transition-colors shadow-xs"
              >
                {/* Scene Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      {scene.scene_number}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Scene {scene.scene_number}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      ⏱️ {scene.duration_seconds}s
                    </span>
                    <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      Transition: {scene.transition}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `SCENE ${scene.scene_number} [${scene.composition_type || 'Standard'}]:\nVisual: ${scene.visual_description}\nVoiceover: "${scene.voiceover}"\nOn-Screen: [${scene.on_screen_text}]`,
                          `scene-${index}`
                        )
                      }
                      className="text-xs font-semibold text-bloom-600 hover:text-bloom-700"
                    >
                      {copiedKey === `scene-${index}` ? '✓ Copied' : '📋 Copy Scene'}
                    </button>
                  </div>
                </div>

                {/* Composition Type Selector */}
                <div className="mb-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Visual Composition Archetype
                  </label>
                  <select
                    value={scene.composition_type || (index === 0 ? 'hook_intro' : index === plan.scenes.length - 1 ? 'cta_outro' : 'step_card')}
                    onChange={(e) => handleSceneEdit(index, 'composition_type', e.target.value)}
                    className="input-field py-1.5 text-xs font-semibold"
                  >
                    {COMPOSITION_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} — {opt.desc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Visual Direction & On-Screen Text */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        🔤 On-Screen Text (Concise kinetic caption)
                      </span>
                      <input
                        type="text"
                        value={scene.on_screen_text}
                        onChange={(e) =>
                          handleSceneEdit(index, 'on_screen_text', e.target.value)
                        }
                        className="input-field py-1.5 text-xs font-mono font-bold text-purple-900 bg-purple-50/40"
                        placeholder="Key words to display on screen"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        👁️ Visual Action & Camera Framing
                      </span>
                      <textarea
                        rows={2}
                        value={scene.visual_description}
                        onChange={(e) =>
                          handleSceneEdit(index, 'visual_description', e.target.value)
                        }
                        className="input-field py-2 text-xs leading-relaxed"
                        placeholder="Describe camera framing and action"
                      />
                    </div>

                    {scene.visual_prompt && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            B-Roll Diffusion Prompt
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(scene.visual_prompt, `prompt-${index}`)
                            }
                            className="text-[10px] font-bold text-bloom-600"
                          >
                            {copiedKey === `prompt-${index}` ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-[11px] font-mono text-slate-600 truncate">
                          {scene.visual_prompt}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Voiceover Narration */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          🎙️ Voiceover Narration (Spoken Word)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(scene.voiceover, `vo-${index}`)}
                          className="text-[11px] font-bold text-bloom-600 hover:text-bloom-700"
                        >
                          {copiedKey === `vo-${index}` ? '✓ Copied' : 'Copy VO'}
                        </button>
                      </div>

                      <textarea
                        rows={4}
                        value={scene.voiceover}
                        onChange={(e) =>
                          handleSceneEdit(index, 'voiceover', e.target.value)
                        }
                        className="input-field py-2 text-xs sm:text-sm font-sans leading-relaxed text-slate-900 font-medium"
                        placeholder="Word-for-word spoken narration"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-50">
                      <span>Word count: {scene.voiceover.split(/\s+/).filter(Boolean).length} words</span>
                      <span>Pacing: ~{scene.duration_seconds}s</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to action & footer */}
          <div className="card bg-gradient-to-r from-bloom-50 to-purple-50/50 border-bloom-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-bloom-700 block mb-1">
              📣 Closing Call to Action
            </span>
            <p className="text-base font-bold text-slate-900">
              "{plan.call_to_action}"
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
