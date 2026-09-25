/** Centred sign-up / login / OTP column on a white page (Figma candidate journey). */
export function AuthCard({ title, lead, children, footer }) {
  return (
    <div className="flex justify-center bg-white px-4 py-12 md:py-16">
      <div className="flex w-full max-w-md flex-col items-center">
        {title && <h1 className="mb-1 text-center text-2xl">{title}</h1>}
        {lead && <p className="mb-6 max-w-sm text-center text-sm">{lead}</p>}
        <div className="w-full">{children}</div>
        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
}
