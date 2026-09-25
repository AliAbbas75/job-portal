import { t } from '../../i18n';
import { Badge } from './Badge';
import { Icon } from './Icon';

/** Fee status of an application. Nothing for applications without a fee. */
export function FeeBadge({ fee }) {
  if (!fee || fee.status === 'not_required') return null;
  const paid = fee.status === 'paid';
  return (
    <Badge variant={paid ? 'green' : 'gold'}>
      <Icon name={paid ? 'check' : 'clock'} size={14} />
      {t(`fee.status.${fee.status}`)}
    </Badge>
  );
}
