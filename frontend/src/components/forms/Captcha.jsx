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
        <div className="flex h-13 items-center justify-between rounded-md border border-heritage/30 bg-surface/40 px-3 py-1.5">
          <label className="flex cursor-pointer items-center gap-2.5 text-xs font-normal text-black select-none">
            <input
              type="checkbox"
              className="size-4.5 rounded border-heritage/30 accent-heritage"
              checked={Boolean(value)}
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={(event) => onChange(event.target.checked ? 'dev-placeholder' : null)}
            />
            <span className="text-xs text-black">{t('captcha.placeholder')}</span>
          </label>
          <div className="flex flex-col items-center justify-center text-center">
            <svg className="size-5 text-heritage" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-[9px] font-semibold text-black/70 leading-tight">reCAPTCHA</span>
            <span className="text-[7.5px] text-black/50 leading-none">{t('auth.captchaPrivacy')}</span>
          </div>
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-xs font-medium text-ember">
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
