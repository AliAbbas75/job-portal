import { useState } from 'react';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { TextField } from '../../../components/forms/TextField';
import { t } from '../../../i18n';
import { SectionForm } from './SectionForm';

export function SkillsSection({ profile, onSaved }) {
  const [entry, setEntry] = useState('');

  return (
    <SectionForm section="skills" initial={profile.skills} onSaved={onSaved}>
      {({ draft, setDraft }) => {
        function add() {
          const skill = entry.trim();
          if (skill && !draft.includes(skill)) setDraft([...draft, skill]);
          setEntry('');
        }
        return (
          <>
            <p>{t('profile.skillsLead')}</p>
            <div className="flex items-end gap-2 [&>:first-child]:flex-1">
              <TextField
                label={t('fields.skill')}
                placeholder={t('profile.skillPlaceholder')}
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    add();
                  }
                }}
              />
              <Button variant="secondary" onClick={add}>
                <Icon name="plus" size={16} />
                {t('profile.add')}
              </Button>
            </div>
            {draft.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {draft.map((skill) => (
                  <li
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-surface py-1 pr-1 pl-3 font-medium text-heritage"
                  >
                    {skill}
                    <button
                      type="button"
                      className="grid size-6 cursor-pointer place-items-center rounded-full bg-transparent text-inherit hover:bg-heritage hover:text-white"
                      onClick={() => setDraft(draft.filter((s) => s !== skill))}
                      aria-label={t('profile.removeNamed', { name: skill })}
                    >
                      <Icon name="x" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        );
      }}
    </SectionForm>
  );
}
