import { useState } from 'react';
import { updateProfileSection } from '../../../api/profile';
import { Alert } from '../../../components/common/Alert';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { TextField } from '../../../components/forms/TextField';
import { t } from '../../../i18n';
import { errorMessage } from '../../../utils/errorMessage';

/**
 * BPS-15+: statement of purpose (T-056). onSaved(profile). suggestion: { value, confidence } read
 * from a resume, offered until the candidate uses it.
 */
export function StatementSection({ profile, onSaved, suggestion, lowConfidence = 0 }) {
  const [text, setText] = useState(profile.statementOfPurpose ?? '');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  async function save(event) {
    event.preventDefault();
    if (!text.trim()) {
      setStatus({ error: t('validation.required') });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      onSaved(await updateProfileSection('statement', { statementOfPurpose: text.trim() }));
      setStatus({ saved: true });
    } catch (err) {
      setStatus({ error: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={save} noValidate>
      {status?.saved && <Alert variant="success">{t('profile.saved')}</Alert>}
      {suggestion?.value && suggestion.value !== text && (
        <div className="flex flex-col gap-2 rounded-sm border border-dashed border-heritage bg-white px-4 py-3">
          <p className="text-sm font-bold text-heritage">{t('resume.suggested')}</p>
          <p className="text-sm">{suggestion.value}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => setText(suggestion.value)}>
              {t('resume.useThis')}
            </Button>
            {suggestion.confidence < lowConfidence && (
              <Badge variant="gold">{t('resume.checkThis')}</Badge>
            )}
          </div>
        </div>
      )}
      <TextField
        label={t('resume.statement.label')}
        hint={t('resume.statement.hint')}
        multiline
        rows={5}
        maxLength={4000}
        value={text}
        onChange={(e) => setText(e.target.value)}
        error={status?.error}
      />
      <div>
        <Button type="submit" loading={busy}>
          {t('profile.save')}
        </Button>
      </div>
    </form>
  );
}
