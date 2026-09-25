import { useState } from 'react';
import { t } from '../../i18n';
import { Button } from './Button';

/** Shares the current page with the phone's share sheet, or copies its link. */
export function ShareButton({ title }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // The user closed the share sheet, or the clipboard isn't available.
    }
  }

  return (
    <>
      <Button variant="secondary" fullWidth onClick={share}>
        {t('share.button')}
      </Button>
      <p className="text-center text-sm" role="status">
        {copied ? t('share.copied') : ''}
      </p>
    </>
  );
}
