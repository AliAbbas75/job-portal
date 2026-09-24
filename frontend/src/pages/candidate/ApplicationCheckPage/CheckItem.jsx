import { uploadDocument } from '../../../api/documents';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { DocumentUpload } from '../../../components/forms/DocumentUpload';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { cx } from '../../../utils/cx';
import { documentName, qualificationName } from '../../../utils/referenceLabels';

function describe(item, ref) {
  const { required } = item;
  switch (item.key) {
    case 'education':
      return {
        label: t('check.items.education'),
        rule: required.marks
          ? t('job.req.educationWithMarks', {
              level: qualificationName(ref, required.level),
              marks: required.marks,
            })
          : t('job.req.educationValue', { level: qualificationName(ref, required.level) }),
        detail:
          item.status === 'not_met'
            ? t(item.reason === 'marks' ? 'check.detail.marksLow' : 'check.detail.educationLow')
            : null,
      };
    case 'experience':
      return {
        label: t('check.items.experience'),
        rule: t('job.req.experienceValue', { count: required.years }),
        detail:
          item.status === 'missing'
            ? t('check.detail.experienceShort', { count: item.actual })
            : null,
      };
    case 'age':
      return {
        label: t('check.items.age'),
        rule: t('job.req.ageValue', { min: required.min, max: required.max }),
        detail: item.actual != null ? t('check.detail.age', { count: item.actual }) : null,
      };
    case 'domicile':
      return {
        label: t('check.items.domicile'),
        rule: required.provinces.join(', '),
        detail: item.status === 'not_met' ? t('check.detail.domicileOther') : null,
      };
    default:
      return {
        label: documentName(ref, item.documentType),
        rule: t('check.items.document'),
        detail: null,
      };
  }
}

const STATUS = {
  met: { icon: 'check', row: 'border-l-heritage', badge: 'bg-heritage text-white' },
  missing: { icon: 'x', row: 'border-l-pumpkin bg-cream', badge: 'bg-pumpkin text-black' },
  not_met: { icon: 'x', row: 'border-l-ember', badge: 'bg-ember text-white' },
};

const rowClass =
  'flex flex-wrap items-center gap-x-4 gap-y-3 border-l-6 px-4 py-3 not-first:border-t not-first:border-t-heritage not-first:[border-top-style:dashed]';

export function CheckItem({ item, reference, returnTo, onChanged }) {
  const { label, rule, detail } = describe(item, reference);

  if (item.key === 'document' && item.status === 'missing') {
    return (
      <li className={cx(rowClass, STATUS.missing.row)}>
        <DocumentUpload
          label={label}
          required
          divider={false}
          onUpload={async (file) => {
            await uploadDocument(item.documentType, file);
            onChanged();
          }}
        />
      </li>
    );
  }

  return (
    <li className={cx(rowClass, STATUS[item.status].row)}>
      <span
        className={cx(
          'grid size-7 flex-none place-items-center rounded-full',
          STATUS[item.status].badge,
        )}
      >
        <Icon name={STATUS[item.status].icon} size={16} />
      </span>
      <div className="min-w-0 flex-[1_1_260px]">
        <p className="font-bold">
          {label} <span className="font-normal">{rule}</span>
        </p>
        <p className={cx('text-sm', item.status === 'not_met' && 'font-medium text-ember')}>
          {t(`check.status.${item.status}`)}
          {detail && ` · ${detail}`}
        </p>
      </div>
      {item.status === 'missing' && item.fix && (
        <Button
          to={`${paths.profileSection(item.fix)}&returnTo=${encodeURIComponent(returnTo)}`}
          variant="secondary"
          size="sm"
        >
          {t('check.fixInProfile')}
        </Button>
      )}
    </li>
  );
}
