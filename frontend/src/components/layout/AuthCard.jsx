/** Centered card on a clean white background for sign-up, login, and OTP verification. */
export function AuthCard({ title, lead, children, footer }) {
  return (
    <div className="flex justify-center bg-white px-4 py-12 md:py-16 font-['Instrument_Sans',sans-serif]">
      <div className="flex w-full max-w-[450px] flex-col items-center">
        {title && (
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">{title}</h1>
        )}
        {lead && (
          <p className="text-xs md:text-sm text-gray-500 text-center max-w-xs md:max-w-sm mb-6 leading-relaxed">
            {lead}
          </p>
        )}
        <div className="w-full">{children}</div>
        {footer && (
          <div className="mt-6 text-center text-xs text-gray-600 font-normal">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
