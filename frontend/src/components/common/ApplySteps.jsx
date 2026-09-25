/** Candidate application 6-step pill progress bar matching user design specs. */
const CANDIDATE_STEPS = [
  { id: 1, key: 'identity', label: '1. Identity' },
  { id: 2, key: 'otp', label: '2. OTP' },
  { id: 3, key: 'profile', label: '3. Profile' },
  { id: 4, key: 'documents', label: '4. Documents' },
  { id: 5, key: 'review', label: '5. Review' },
  { id: 6, key: 'confirm', label: '6. Confirm' },
];

export function ApplySteps({ current = 'identity' }) {
  const currentIndex = CANDIDATE_STEPS.findIndex((s) => s.key === current);

  return (
    <nav aria-label="Application Progress" className="w-full my-4 font-['Instrument_Sans',sans-serif]">
      <ol className="flex flex-wrap items-center justify-center gap-2 text-xs">
        {CANDIDATE_STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex || (currentIndex === -1 && idx === 0);

          return (
            <li
              key={step.key}
              className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 font-medium ${
                isCurrent
                  ? 'border-[#1f4d36] bg-[#f0fdf4] text-[#1f4d36] font-semibold shadow-2xs'
                  : isDone
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold'
                  : 'border-gray-200 text-gray-400 bg-white'
              }`}
            >
              {isDone && <span className="text-emerald-700 font-bold">✓</span>}
              <span>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
