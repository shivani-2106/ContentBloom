import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { generateContent, improveContent } from '../api/contentApi'
import { saveContentHistory } from '../utils/contentHistory'

const PLATFORM_LABELS = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube_shorts: 'YouTube Shorts',
}

const TYPE_LABELS = {
  social_post: 'Social Post',
  video_script: 'Video Script',
  carousel: 'Carousel',
}

export default function Results() {
  const location = useLocation()

  const resultData = location.state?.result
  const sourceContent = location.state?.source_content ?? ''
  const customization = location.state?.customization ?? {}

  const [text, setText] = useState(resultData?.result ?? '')
  const [copied, setCopied] = useState(false)
  const [loadingAction, setLoadingAction] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

useEffect(() => {
  const initialText = resultData?.result ?? ''

  setText(initialText)
  setError('')
  setSuccess('')

  if (initialText.trim() && resultData) {
    saveContentHistory({
      sourceContent,
      content: initialText,
      platform: resultData.platform,
      contentType: resultData.content_type,
      tone: customization.tone ?? 'friendly',
      targetAudience: customization.targetAudience ?? 'general',
      length: customization.length ?? 'medium',
    })
  }
}, [resultData, sourceContent, customization])

  if (!resultData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-slate-500 mb-6">
          No content to display. Please generate content first.
        </p>
        <Link to="/generate" className="btn-primary">
          Go to Generate
        </Link>
      </div>
    )
  }

  const { platform, content_type } = resultData
  const platformLabel = PLATFORM_LABELS[platform] ?? platform
  const typeLabel = TYPE_LABELS[content_type] ?? content_type

  const requestSettings = {
    platform,
    content_type,
    tone: customization.tone ?? 'friendly',
    target_audience: customization.targetAudience ?? 'general',
    length: customization.length ?? 'medium',
    include_hashtags: customization.includeHashtags ?? true,
    include_emojis: customization.includeEmojis ?? true,
  }
  function saveCurrentVersion(content, action = 'generated') {
  if (!content?.trim()) return

  saveContentHistory({
    sourceContent,
    content,
    platform,
    contentType: content_type,
    tone: requestSettings.tone,
    targetAudience: requestSettings.target_audience,
    length: requestSettings.length,
    action,
  })
}
  async function handleCopy() {
    setError('')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()

      const copiedSuccessfully = document.execCommand('copy')
      document.body.removeChild(el)

      if (copiedSuccessfully) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        setError('Unable to copy automatically. Please select and copy the text.')
      }
    }
  }

  function handleDownload() {
    const filename =
      `ContentBloom_${platformLabel}_${typeLabel}.txt`.replace(/\s+/g, '_')

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

  async function handleRegenerate() {
    if (!sourceContent) {
      setError(
        'The original source content is unavailable. Return to Generate and submit your content again.'
      )
      return
    }

    setLoadingAction('regenerate')
    setError('')
    setSuccess('')

    try {
      const data = await generateContent({
        source_content: sourceContent,
        ...requestSettings,
      })

      if (!data?.result) {
        throw new Error('The server returned empty content. Please try again.')
      }

      setText(data.result)
      saveCurrentVersion(data.result, 'regenerated')
setSuccess('A fresh version has been generated and saved to history!')
    } catch (err) {
      setError(err.message || 'Could not regenerate content. Please try again.')
    } finally {
      setLoadingAction('')
    }
  }

  async function handleImprove() {
    if (!text.trim()) {
      setError('There is no content to improve.')
      return
    }

    if (!sourceContent) {
      setError(
        'The original source content is unavailable. Return to Generate and submit your content again.'
      )
      return
    }

    setLoadingAction('improve')
    setError('')
    setSuccess('')

    try {
      const data = await improveContent({
        source_content: sourceContent,
        current_content: text,
        ...requestSettings,
      })

      if (!data?.result) {
        throw new Error(
          'The improvement endpoint did not return content in the expected format.'
        )
      }

     setText(data.result)
     saveCurrentVersion(data.result, 'improved')
     setSuccess('Your improved content has been saved to history!')
    } catch (err) {
      setError(
        err.message ||
          'Could not improve content. Check that the backend improvement endpoint is implemented.'
      )
    } finally {
      setLoadingAction('')
    }
  }

  const isBusy = loadingAction !== ''

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Your Generated Content
          </h1>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center rounded-full bg-bloom-100 px-3 py-1 text-xs font-semibold text-bloom-700">
              {platformLabel}
            </span>

            <span className="inline-flex items-center rounded-full bg-accent-400/20 px-3 py-1 text-xs font-semibold text-accent-600">
              {typeLabel}
            </span>
          </div>
        </div>

        <Link to="/generate" className="btn-secondary text-sm py-2 px-4">
          ← Generate Again
        </Link>
      </div>

      {/* Feedback messages */}
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          ✓ {success}
        </div>
      )}

      {/* Editable content */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="section-label">Generated Content</p>

          <span className="text-xs text-slate-400">
            {text.length} characters · Editable
          </span>
        </div>

        <textarea
          className="input-field resize-y min-h-64 font-mono text-sm leading-relaxed"
          value={text}
          onChange={(event) => {
            setText(event.target.value)
            setError('')
            setSuccess('')
          }}
          aria-label="Editable generated content"
          disabled={isBusy}
        />

        {isBusy && (
          <p className="mt-3 text-sm text-slate-500">
            {loadingAction === 'regenerate'
              ? ' Creating a fresh version of your content…'
              : ' Improving your content…'}
          </p>
        )}
      </div>

      {/* AI actions */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Make It Even Better
        </h2>

        <p className="text-sm text-slate-500 mb-5">
          Explore a fresh version or refine your current content without
          leaving this page.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isBusy || !sourceContent}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAction === 'regenerate'
              ? '⏳ Regenerating…'
              : '🔄 Regenerate'}
          </button>

          <button
            type="button"
            onClick={handleImprove}
            disabled={isBusy || !sourceContent || !text.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAction === 'improve'
              ? '⏳ Improving…'
              : '✨ Improve Content'}
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Regenerate creates a new version from your original input. Improve
          Content refines the version currently in the editor.
        </p>
      </div>

      {/* Copy and download */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="btn-primary"
          disabled={!text.trim()}
        >
          {copied ? (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                />
              </svg>
              Copy to Clipboard
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="btn-secondary"
          disabled={!text.trim()}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          Download .txt
        </button>

        <button
  type="button"
  onClick={() => {
    saveCurrentVersion(text, 'edited')
    setSuccess('Your edited content has been saved to history!')
    setError('')
  }}
  className="btn-secondary"
  disabled={!text.trim() || isBusy}
>
  💾 Save to History
</button>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Edit your content before copying or downloading. Regenerate and
        Improve Content are separate actions, so you stay in control of the
        final version.
      </p>
    </div>
  )
}
