/**
 * PlatformSelector — toggle buttons for choosing the target social platform.
 *
 * Props:
 *   value     (string)    Currently selected platform key.
 *   onChange  (function)  Called with the new platform key when user clicks.
 */

const PLATFORMS = [
  {
    key: 'linkedin',
    label: 'LinkedIn',
    description: 'Professional audience',
    emoji: '💼',
    color: 'from-blue-500 to-blue-700',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    description: 'Visual storytelling',
    emoji: '📸',
    color: 'from-pink-500 to-purple-600',
  },
  {
    key: 'youtube_shorts',
    label: 'YouTube Shorts',
    description: 'Short-form video',
    emoji: '🎬',
    color: 'from-red-500 to-red-700',
  },
]

export default function PlatformSelector({ value, onChange }) {
  return (
    <div>
      <p className="section-label">Target Platform</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PLATFORMS.map((p) => {
          const selected = value === p.key
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onChange(p.key)}
              className={`
                relative flex flex-col items-center gap-2 rounded-xl border-2 p-4
                text-center transition-all duration-200 focus:outline-none
                focus:ring-2 focus:ring-bloom-500 focus:ring-offset-2
                ${
                  selected
                    ? 'border-bloom-500 bg-bloom-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-bloom-300 hover:bg-bloom-50/50'
                }
              `}
              aria-pressed={selected}
            >
              {/* Gradient icon badge */}
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center text-lg`}>
                {p.emoji}
              </div>

              <div>
                <p className={`font-semibold text-sm ${selected ? 'text-bloom-700' : 'text-slate-800'}`}>
                  {p.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
              </div>

              {/* Selected tick */}
              {selected && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center
                                 rounded-full bg-bloom-500">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24"
                       strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
