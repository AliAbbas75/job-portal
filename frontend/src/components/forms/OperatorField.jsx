import { useId } from 'react';
import { t } from '../../i18n';
import { Select } from './Select';

const OPERATORS = ['telenor', 'jazz', 'zong', 'ufone', 'onic'];

/** "Select Telecom Operator" dropdown (signup, login, apply wizard). onChange(code). */
export function OperatorField({ value, onChange, error, required = true }) {
  const id = useId();
  return (
    <div>
      <p id={`${id}-label`} className="mb-1.5 block text-sm font-bold">
        {t('auth.operator')} {required && <span className="text-ember">*</span>}
      </p>
      <Select
        id={id}
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
