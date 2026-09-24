import { t } from '../i18n';

/** User-facing message for an ApiError code, falling back to a generic message. */
export function errorMessage(error) {
  const key = `errors.${error?.code}`;
  const message = t(key);
  return message === key ? t('errors.generic') : message;
}
