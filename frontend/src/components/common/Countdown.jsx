import { useEffect, useState } from 'react';
import { t } from '../../i18n';

function remaining(until, now) {
  const ms = Math.max(0, new Date(until) - now);
  const seconds = Math.floor(ms / 1000);
  return [
    { key: 'days', value: Math.floor(seconds / 86400) },
    { key: 'hours', value: Math.floor((seconds % 86400) / 3600) },
    { key: 'minutes', value: Math.floor((seconds % 3600) / 60) },
    { key: 'seconds', value: seconds % 60 },
  ];
}

/** Days / hours / minutes / seconds left until `until`, ticking every second. */
export function Countdown({ until }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const parts = remaining(until, now);
  return (
    <div className="rounded-md border border-heritage bg-white p-3">
      <p className="text-sm font-bold">{t('countdown.title')}</p>
      {/* Screen readers get the whole value once; the ticking digits are hidden from them. */}
      <p className="sr-only">
        {t('countdown.summary', { days: parts[0].value, hours: parts[1].value })}
      </p>
      <dl className="mt-2 grid grid-cols-4 gap-2 text-center" aria-hidden="true">
        {parts.map((part) => (
          <div key={part.key} className="flex flex-col-reverse">
            <dt className="text-xs">{t(`countdown.${part.key}`)}</dt>
            <dd className="text-2xl font-bold text-heritage tabular-nums">
              {String(part.value).padStart(2, '0')}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
