import { t } from '../../i18n';
import { Badge } from './Badge';

const VARIANTS = {
  submitted: 'soft',
  under_review: 'cream',
  rejected: 'red',
  offer: 'gold',
};

export function StatusBadge({ status }) {
  return <Badge variant={VARIANTS[status] ?? 'green'}>{t(`status.${status}`)}</Badge>;
}
