/**
 * ErrorBanner — dismissible red alert shown when the API returns an error.
 *
 * Props:
 *   message   (string)    The human-readable error message.
 *   onDismiss (function)  Called when the user clicks the × button.
 */
export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null

  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-red-200
                 bg-red-50 px-4 py-3 text-sm text-red-800"
      role="alert"
    >
      {/* Icon */}
      <svg
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>

      {/* Message */}
      <p className="flex-1">{message}</p>

      {/* Dismiss */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto -mr-1 flex-shrink-0 rounded p-1
                     text-red-500 hover:bg-red-100 transition-colors"
          aria-label="Dismiss error"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
