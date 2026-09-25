import { t } from '../../i18n';
import { Badge } from './Badge';

const VARIANT = {
  draft: 'outline',
  pending_approval: 'gold',
  returned: 'cream',
  rejected: 'red',
  approved: 'soft',
  published: 'green',
  closed: 'cream',
};

/** Workflow status of a job on the staff pages. */
export function JobStatusBadge({ status }) {
  return <Badge variant={VARIANT[status] ?? 'soft'}>{t(`adminJobs.status.${status}`)}</Badge>;
}
