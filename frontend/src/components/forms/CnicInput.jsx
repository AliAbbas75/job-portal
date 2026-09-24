import { t } from '../../i18n';
import { formatCnic } from '../../utils/format';
import { TextField } from './TextField';

/** CNIC field that inserts the dashes (00000-0000000-0) as the user types. */
export function CnicInput({ value, onChange, ...rest }) {
  return (
    <TextField
      label={t('fields.cnic')}
      hint={t('fields.cnicHint')}
      inputMode="numeric"
      autoComplete="off"
      placeholder="00000-0000000-0"
      maxLength={15}
      value={value}
      onChange={(event) => onChange(formatCnic(event.target.value))}
      {...rest}
    />
  );
}
