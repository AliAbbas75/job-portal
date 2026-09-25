import { useState } from 'react';
import { Button } from '../../../components/common/Button';
import { IconField } from '../../../components/forms/IconField';
import { OperatorField } from '../../../components/forms/OperatorField';
import { t } from '../../../i18n';
import { formatCnic } from '../../../utils/format';
import { isValidCnic, isValidMobile } from '../../../utils/validators';

/** Wizard step 1: CNIC, network and mobile. The backend checks they're the candidate's own. */
export function IdentityStep({ initial, busy, onBack, onContinue }) {
  const [cnic, setCnic] = useState(initial.cnic);
  const [operator, setOperator] = useState('');
  const [mobile, setMobile] = useState(initial.mobile);
  const [errors, setErrors] = useState({});

  function next() {
    const found = {};
    if (!isValidCnic(cnic)) found.cnic = t('validation.cnic');
    if (!operator) found.operator = t('validation.operator');
    if (!isValidMobile(mobile)) found.mobile = t('validation.mobile');
    setErrors(found);
    if (Object.keys(found).length === 0) onContinue({ cnic, mobile });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl text-black">{t('wizard.identityTitle')}</h1>
        <p className="mt-1 text-sm">{t('wizard.identityLead')}</p>
      </div>
      <IconField
        label={t('auth.cnic')}
        icon="idCard"
        inputMode="numeric"
        placeholder={t('auth.cnicPlaceholder')}
        value={cnic}
        onChange={(event) => setCnic(formatCnic(event.target.value))}
        error={errors.cnic}
        required
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <OperatorField value={operator} onChange={setOperator} error={errors.operator} />
        <IconField
          label={t('auth.mobile')}
          icon="phone"
          type="tel"
          inputMode="tel"
          placeholder={t('auth.mobilePlaceholder')}
          value={mobile}
          onChange={(event) => setMobile(event.target.value.trim())}
          error={errors.mobile}
          required
        />
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-surface pt-4">
        <Button variant="secondary" onClick={onBack}>
          {t('wizard.back')}
        </Button>
        <Button loading={busy} onClick={next}>
          {t('wizard.continue')}
        </Button>
      </div>
    </div>
  );
}
