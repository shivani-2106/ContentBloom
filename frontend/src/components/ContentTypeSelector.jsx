/**
 * ContentTypeSelector — choose what kind of content to generate.
 *
 * Props:
 *   value     (string)    Currently selected content-type key.
 *   onChange  (function)  Called with the new key when user selects.
 */

const CONTENT_TYPES = [
  {
    key: 'social_post',
    label: 'Social Post',
    description: 'Engaging caption + hashtags',
    icon: '✍️',
  },
  {
    key: 'video_script',
    label: 'Video Script',
    description: 'Hook, body & CTA script',
    icon: '🎙️',
  },
  {
    key: 'carousel',
    label: 'Carousel',
    description: 'Slide-by-slide content',
    icon: '🗂️',
  },
]

export default function ContentTypeSelector({ value, onChange }) {
  return (
    <div>
      <p className="section-label">Content Type</p>
      <div className="flex flex-col gap-2">
        {CONTENT_TYPES.map((ct) => {
          const selected = value === ct.key
          return (
            <button
              key={ct.key}
              type="button"
              onClick={() => onChange(ct.key)}
              className={`
                flex items-center gap-4 rounded-xl border-2 px-4 py-3
                text-left transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-bloom-500 focus:ring-offset-2
                ${
                  selected
                    ? 'border-bloom-500 bg-bloom-50'
                    : 'border-slate-200 bg-white hover:border-bloom-300 hover:bg-bloom-50/50'
                }
              `}
              aria-pressed={selected}
            >
              {/* Radio dot */}
              <span
                className={`
                  flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center
                  transition-colors duration-200
                  ${selected ? 'border-bloom-500 bg-bloom-500' : 'border-slate-300 bg-white'}
                `}
              >
                {selected && (
                  <span className="h-2 w-2 rounded-full bg-white block" />
                )}
              </span>

              <span className="text-xl">{ct.icon}</span>

              <div>
                <p className={`font-semibold text-sm ${selected ? 'text-bloom-700' : 'text-slate-800'}`}>
                  {ct.label}
                </p>
                <p className="text-xs text-slate-500">{ct.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
