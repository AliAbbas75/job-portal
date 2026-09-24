/** Centered card on a cream background for sign-up and login. */
export function AuthCard({ title, lead, children, footer }) {
  return (
    <div className="flex justify-center bg-cream px-4 py-12">
      <div className="flex w-full max-w-115 flex-col gap-4 rounded-md border border-heritage bg-white px-4 py-5 sm:p-8">
        <h1 className="text-2xl">{title}</h1>
        {lead && <p>{lead}</p>}
        {children}
        {footer && (
          <div className="border-t border-dashed border-heritage pt-4 text-center">{footer}</div>
        )}
      </div>
    </div>
  );
}
