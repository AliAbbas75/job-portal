import { useState } from 'react';
import { updateProfileSection } from '../../../api/profile';
import { Alert } from '../../../components/common/Alert';
import { Button } from '../../../components/common/Button';
import { t } from '../../../i18n';
import { errorMessage } from '../../../utils/errorMessage';
import styles from './ProfilePage.module.css';

/**
 * Edit-and-save wrapper for one profile section.
 * children({ draft, setField, setDraft, errors }) renders the fields.
 * validate(draft) returns { field: message } for invalid fields.
 */
export function SectionForm({ section, initial, onSaved, validate = () => ({}), children }) {
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [saveError, setSaveError] = useState(null);

  const updateDraft = (next) => {
    setDraft(next);
    setStatus('idle');
  };
  const setField = (name) => (value) => updateDraft((d) => ({ ...d, [name]: value }));

  async function submit(event) {
    event.preventDefault();
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus('saving');
    try {
      onSaved(await updateProfileSection(section, draft));
      setStatus('saved');
    } catch (err) {
      setSaveError(err);
      setStatus('error');
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      {children({ draft, setField, setDraft: updateDraft, errors })}
      <div className={styles.formActions}>
        <Button type="submit" loading={status === 'saving'}>
          {t('profile.save')}
        </Button>
        {status === 'saved' && <Alert variant="success">{t('profile.saved')}</Alert>}
        {status === 'error' && <Alert variant="error">{errorMessage(saveError)}</Alert>}
      </div>
    </form>
  );
}
