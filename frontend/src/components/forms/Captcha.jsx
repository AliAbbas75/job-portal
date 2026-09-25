import { useEffect, useId, useRef } from 'react';
import { t } from '../../i18n';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise = null;

function loadTurnstile() {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = reject;
    document.head.append(script);
  });
  return scriptPromise;
}

/**
 * CAPTCHA for signup and login. With VITE_TURNSTILE_SITE_KEY set it shows Cloudflare Turnstile
 * and reports its token; without it (development, tests) a checkbox stands in and reports
 * 'dev-placeholder', which the backend accepts only when no CAPTCHA secret is configured.
 * onChange(token or null).
 */
export function Captcha({ value, onChange, error }) {
  const container = useRef(null);
  const errorId = useId();

  useEffect(() => {
    if (!SITE_KEY) return undefined;
    let widgetId = null;
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !container.current) return;
        widgetId = turnstile.render(container.current, {
          sitekey: SITE_KEY,
          callback: (token) => onChange(token),
          'expired-callback': () => onChange(null),
          'error-callback': () => onChange(null),
        });
      })
      .catch(() => onChange(null));
    return () => {
      cancelled = true;
      if (widgetId !== null) window.turnstile?.remove(widgetId);
    };
  }, [onChange]);

  if (!SITE_KEY) {
    // Development stand-in, styled like the CAPTCHA box in the design.
    return (
      <div>
        <div className="flex items-center justify-between rounded-md border border-heritage bg-cream p-3">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium select-none">
            <input
              type="checkbox"
              className="size-4 accent-heritage"
              checked={Boolean(value)}
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={(event) => onChange(event.target.checked ? 'dev-placeholder' : null)}
            />
            {t('captcha.placeholder')}
          </label>
          <span className="text-xs">{t('auth.captchaPrivacy')}</span>
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-sm font-medium text-ember">
            {error}
          </p>
        )}
      </div>
    );
  }
  return (
    <div>
      <div ref={container} aria-describedby={error ? errorId : undefined} />
      {error && (
        <p id={errorId} className="text-sm font-medium text-ember">
          {error}
        </p>
      )}
    </div>
  );
}
