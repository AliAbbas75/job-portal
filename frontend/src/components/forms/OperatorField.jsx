import { t } from '../../i18n';
import { SelectField } from './SelectField';

const OPERATORS = ['jazz', 'telenor', 'ufone', 'zong'];

/** Mobile network, used to route the SMS code. onChange(value). */
export function OperatorField({ value, onChange, error, required }) {
  return (
    <SelectField
      label={t('fields.operator')}
      placeholder={t('fields.operatorPlaceholder')}
      options={OPERATORS.map((code) => ({ value: code, label: t(`operators.${code}`) }))}
      value={value}
      onChange={onChange}
      error={error}
      required={required}
    />
  );
}
