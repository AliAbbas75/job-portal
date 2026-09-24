import { useEffect } from 'react';
import { t } from '../i18n';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${t('app.name')}` : t('app.name');
  }, [title]);
}
