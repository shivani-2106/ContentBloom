/**
 * LoadingSpinner — full-screen overlay displayed while the API call is in flight.
 *
 * Props:
 *   message  (string)  Optional message shown below the spinner.
 */
export default function LoadingSpinner({ message = 'Generating your content…' }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center
                 bg-white/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* Spinner ring */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        <div
          className="absolute inset-0 rounded-full border-4 border-bloom-500
                     border-t-transparent animate-spin"
        />
      </div>

      {/* Pulsing brand icon */}
      <div className="mt-6 w-10 h-10 rounded-xl bg-gradient-to-br from-bloom-500 to-accent-500
                      flex items-center justify-center animate-pulse">
        <span className="text-white text-xs font-bold">CB</span>
      </div>

      <p className="mt-4 text-slate-600 font-medium text-sm">{message}</p>
      <p className="mt-1 text-slate-400 text-xs">This may take a few seconds…</p>
    </div>
  )
}
