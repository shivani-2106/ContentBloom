import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlatformSelector from '../components/PlatformSelector'
import ContentTypeSelector from '../components/ContentTypeSelector'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'
import { generateContent } from '../api/contentApi'

const MIN_CHARS = 50
const MAX_CHARS = 10_000

export default function Generate() {
  const navigate = useNavigate()

  // Source and output preferences
  const [sourceContent, setSourceContent] = useState('')
  const [platform, setPlatform] = useState('linkedin')
  const [contentType, setContentType] = useState('social_post')

  // AI customization
  const [tone, setTone] = useState('friendly')
  const [targetAudience, setTargetAudience] = useState('general')
  const [length, setLength] = useState('medium')
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [includeEmojis, setIncludeEmojis] = useState(true)

  // Request status
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const charCount = sourceContent.length
  const charOverMax = charCount > MAX_CHARS
  const isValid = charCount >= MIN_CHARS && !charOverMax

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isValid || loading) return

    setError('')
    setLoading(true)

    try {
      const data = await generateContent({
        source_content: sourceContent,
        platform,
        content_type: contentType,
        tone,
        target_audience: targetAudience,
        length,
        include_hashtags: includeHashtags,
        include_emojis: includeEmojis,
      })

      // Preserve the existing Results page navigation.
      navigate('/results', {
        state: {
          result: data,
          customization: {
            tone,
            target_audience: targetAudience,
            length,
            include_hashtags: includeHashtags,
            include_emojis: includeEmojis,
          },
          source_content: sourceContent,
        },
      })
    } catch (err) {
      setError(err.message || 'Content generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && <LoadingSpinner />}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Page heading */}
        <div className="mb-8">
          <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700">
            AI-powered content studio
          </span>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Generate Content
          </h1>

          <p className="mt-2 text-slate-500">
            Transform one idea into platform-ready content tailored to your
            audience, tone, and goals.
          </p>
        </div>

        {/* Error message */}
        <div className="mb-6">
          <ErrorBanner
            message={error}
            onDismiss={() => setError('')}
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Source material */}
          <section className="card">
            <label
              htmlFor="source-content"
              className="section-label block"
            >
              Your Source Content
            </label>

            <p className="mt-1 mb-4 text-sm text-slate-500">
              Start with an idea, product description, article, or transcript.
            </p>

            <textarea
              id="source-content"
              className={`input-field resize-y min-h-52 font-mono text-sm ${
                charOverMax
                  ? 'border-red-400 focus:ring-red-400'
                  : ''
              }`}
              placeholder="Describe your idea or paste your source material here..."
              value={sourceContent}
              onChange={(e) => setSourceContent(e.target.value)}
              maxLength={MAX_CHARS + 100}
              required
              aria-describedby="source-counter"
            />

            <div
              id="source-counter"
              className={`mt-2 flex justify-between text-xs ${
                charOverMax ? 'text-red-500' : 'text-slate-400'
              }`}
            >
              <span>
                {charCount < MIN_CHARS && charCount > 0
                  ? `${MIN_CHARS - charCount} more characters needed`
                  : charCount === 0
                    ? `Minimum ${MIN_CHARS} characters required`
                    : charOverMax
                      ? 'Content exceeds the maximum length'
                      : 'Ready to generate'}
              </span>

              <span className={charOverMax ? 'font-semibold' : ''}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            </div>
          </section>

          {/* Platform selection */}
          <section className="card">
            <PlatformSelector
              value={platform}
              onChange={setPlatform}
            />
          </section>

          {/* Content type selection */}
          <section className="card">
            <ContentTypeSelector
              value={contentType}
              onChange={setContentType}
            />
          </section>

          {/* AI customization */}
          <section className="card">
            <div className="mb-6">
              <span className="text-2xl" aria-hidden="true">
                ✨
              </span>

              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                Customize Your Content
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Shape the AI output to match your brand and audience.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Tone */}
              <div>
                <label
                  htmlFor="tone"
                  className="section-label block mb-2"
                >
                  Writing Tone
                </label>

                <select
                  id="tone"
                  className="input-field"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="witty">Witty & Humorous</option>
                  <option value="inspirational">Inspirational</option>
                </select>

                <p className="mt-1 text-xs text-slate-500">
                  Choose how your content should sound.
                </p>
              </div>

              {/* Target audience */}
              <div>
                <label
                  htmlFor="target-audience"
                  className="section-label block mb-2"
                >
                  Target Audience
                </label>

                <select
                  id="target-audience"
                  className="input-field"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                >
                  <option value="general">General Audience</option>
                  <option value="students">Students</option>
                  <option value="creators">Content Creators</option>
                  <option value="startups">Startups</option>
                  <option value="businesses">Businesses</option>
                </select>

                <p className="mt-1 text-xs text-slate-500">
                  Tailor the message to the people you want to reach.
                </p>
              </div>

              {/* Content length */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="content-length"
                  className="section-label block mb-2"
                >
                  Content Length
                </label>

                <select
                  id="content-length"
                  className="input-field"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                >
                  <option value="short">Short & Concise</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long & Detailed</option>
                </select>
              </div>
            </div>

            {/* Output preferences */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Output Preferences
              </h3>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHashtags}
                    onChange={(e) =>
                      setIncludeHashtags(e.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-sky-600"
                  />

                  <span>
                    <span className="block text-sm font-medium text-slate-800">
                      Include hashtags
                    </span>
                    <span className="block text-xs text-slate-500">
                      Add relevant hashtags for the selected platform.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeEmojis}
                    onChange={(e) =>
                      setIncludeEmojis(e.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-sky-600"
                  />

                  <span>
                    <span className="block text-sm font-medium text-slate-800">
                      Include emojis
                    </span>
                    <span className="block text-xs text-slate-500">
                      Use emojis where appropriate to the selected tone.
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* Summary */}
          <section className="rounded-xl border border-sky-100 bg-sky-50 p-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Your generation settings
            </h3>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {[
                platform.replaceAll('_', ' '),
                contentType.replaceAll('_', ' '),
                tone,
                targetAudience,
                `${length} length`,
                includeHashtags ? 'hashtags on' : 'hashtags off',
                includeEmojis ? 'emojis on' : 'emojis off',
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-sky-100 bg-white px-3 py-1.5 capitalize text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || loading}
            className="btn-primary w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Generating your content...
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
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09-3.09Z"
                  />
                </svg>

                Generate Personalized Content
              </>
            )}
          </button>
        </form>
      </div>
    </>
  )
}