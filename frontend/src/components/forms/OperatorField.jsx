import { useId } from 'react';
import { t } from '../../i18n';
import { Select } from './Select';

const OPERATORS = ['jazz', 'telenor', 'zong', 'ufone', 'scom', 'onic'];

/** "Select Telecom Operator" dropdown (signup, login, apply wizard). onChange(code). */
export function OperatorField({
  value,
  onChange,
  error,
  required = true,
  leadingIcon = 'signal',
  compact = false,
}) {
  const id = useId();
  return (
    <div>
      <p
        id={`${id}-label`}
        className={
          compact
            ? 'mb-1 block text-[11px] font-semibold text-black'
            : 'mb-1.5 block text-sm font-semibold text-black'
        }
      >
        {t('auth.operator')} {required && <span className="text-ember">*</span>}
      </p>
      <Select
        id={id}
        leadingIcon={leadingIcon}
        size={compact ? 'xs' : 'md'}
        labelledBy={`${id}-label`}
        describedBy={error ? `${id}-error` : undefined}
        invalid={Boolean(error)}
        placeholder={t('auth.operatorPlaceholder')}
        options={OPERATORS.map((code) => ({ value: code, label: t(`operators.${code}`) }))}
        value={value}
        onChange={onChange}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-ember">
          {error}
        </p>
      )}
    </div>
  );
}
