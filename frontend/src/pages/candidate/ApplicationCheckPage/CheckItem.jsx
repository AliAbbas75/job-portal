import { uploadDocument } from '../../../api/documents';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { DocumentUpload } from '../../../components/forms/DocumentUpload';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { documentName, qualificationName } from '../../../utils/referenceLabels';
import styles from './ApplicationCheckPage.module.css';

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

const ICONS = { met: 'check', missing: 'x', not_met: 'x' };

export function CheckItem({ item, reference, returnTo, onChanged }) {
  const { label, rule, detail } = describe(item, reference);

  if (item.key === 'document' && item.status === 'missing') {
    return (
      <li className={`${styles.item} ${styles.missing}`}>
        <DocumentUpload
          label={label}
          required
          onUpload={async (file) => {
            await uploadDocument(item.documentType, file);
            onChanged();
          }}
        />
      </li>
    );
  }

  return (
    <li className={`${styles.item} ${styles[item.status]}`}>
      <span className={styles.icon}>
        <Icon name={ICONS[item.status]} size={16} />
      </span>
      <div className={styles.text}>
        <p className={styles.label}>
          {label} <span className={styles.rule}>{rule}</span>
        </p>
        <p className={styles.status}>
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
