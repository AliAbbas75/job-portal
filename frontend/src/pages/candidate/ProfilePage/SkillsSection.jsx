import { useState } from 'react';
import { updateProfileSection } from '../../../api/profile';
import { Alert } from '../../../components/common/Alert';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { TextField } from '../../../components/forms/TextField';
import { t } from '../../../i18n';
import { errorMessage } from '../../../utils/errorMessage';

const MAX_SKILLS = 30;

const has = (list, name) => list.some((s) => s.toLowerCase() === name.toLowerCase());

/** Skills and licences, saved as one list. suggestions: skill names read from a resume. */
export function SkillsSection({ profile, onSaved, suggestions = [] }) {
  const [skills, setSkills] = useState(profile.skills ?? []);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const suggested = suggestions.filter((name) => !has(skills, name));

  function add(name) {
    const value = name.trim();
    if (!value || has(skills, value) || skills.length >= MAX_SKILLS) return;
    setSkills((list) => [...list, value]);
    setStatus(null);
  }

  function addTyped(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    add(input);
    setInput('');
  }

  async function save() {
    setBusy(true);
    setStatus(null);
    try {
      onSaved(await updateProfileSection('skills', skills));
      setStatus({ saved: true });
    } catch (err) {
      setStatus({ error: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm">{t('profile.skillsLead')}</p>
      {status?.saved && <Alert variant="success">{t('profile.saved')}</Alert>}
      {status?.error && <Alert variant="error">{status.error}</Alert>}
      {skills.length === 0 ? (
        <p>{t('resume.skills.empty')}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {skills.map((name) => (
            <li
              key={name}
              className="inline-flex items-center gap-1 rounded-full bg-surface py-1 pr-1 pl-3 text-sm text-heritage"
            >
              {name}
              <button
                type="button"
                className="rounded-full p-1 hover:bg-white"
                onClick={() => setSkills((list) => list.filter((s) => s !== name))}
                aria-label={t('profile.removeNamed', { name })}
              >
                <Icon name="x" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-60 flex-1">
          <TextField
            label={t('resume.skills.add')}
            hint={t('resume.skills.addHint')}
            value={input}
            maxLength={120}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={addTyped}
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            add(input);
            setInput('');
          }}
        >
          <Icon name="plus" size={16} />
          {t('resume.skills.addButton')}
        </Button>
      </div>
      {suggested.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-heritage">{t('resume.suggested')}</p>
          <div className="flex flex-wrap gap-2">
            {suggested.map((name) => (
              <Button key={name} variant="ghost" size="sm" onClick={() => add(name)}>
                <Icon name="plus" size={14} />
                {name}
              </Button>
            ))}
          </div>
        </div>
      )}
      <div>
        <Button onClick={save} loading={busy}>
          {t('profile.save')}
        </Button>
      </div>
    </div>
  );
}
