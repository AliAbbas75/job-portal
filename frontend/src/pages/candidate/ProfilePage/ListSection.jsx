import { useState } from 'react';
import { deleteProfileItem, saveProfileItem } from '../../../api/profile';
import { Alert } from '../../../components/common/Alert';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { t } from '../../../i18n';
import { errorMessage } from '../../../utils/errorMessage';

/**
 * Add / edit / remove entries of a list section (education, experience, BPS-15+ sections).
 * summarize(item) → { title, subtitle }; renderFields({ draft, setField, errors }) → inputs.
 * suggestions: entries read from a resume ({ ...item, confidence }), each reviewed in the form
 * before it is saved; those below lowConfidence are flagged.
 */
export function ListSection({
  section,
  items,
  emptyItem,
  summarize,
  renderFields,
  validate,
  onSaved,
  labels,
  suggestions = [],
  lowConfidence = 0,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [suggestionIndex, setSuggestionIndex] = useState(null);
  const [handled, setHandled] = useState([]);

  function startEdit(item) {
    setEditingId(item?.id ?? 'new');
    setDraft(item ?? emptyItem);
    setErrors({});
    setError(null);
  }

  function review(index) {
    const { confidence: _confidence, ...item } = suggestions[index];
    const known = Object.fromEntries(Object.entries(item).filter(([, value]) => value != null));
    startEdit(null);
    setDraft({ ...emptyItem, ...known });
    setSuggestionIndex(index);
  }

  function cancel() {
    setEditingId(null);
    setDraft(null);
    setSuggestionIndex(null);
  }

  async function run(action, usedSuggestion = null) {
    setBusy(true);
    setError(null);
    try {
      onSaved(await action());
      if (usedSuggestion !== null) setHandled((h) => [...h, usedSuggestion]);
      cancel();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  function save(event) {
    event.preventDefault();
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length === 0)
      run(() => saveProfileItem(section, draft), suggestionIndex);
  }

  const pending = suggestions
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => !handled.includes(index) && index !== suggestionIndex);
  const setField = (name) => (value) => setDraft((d) => ({ ...d, [name]: value }));

  // Only built while an entry is being added or edited (draft is null otherwise).
  const form = draft && (
    <form
      className="flex flex-col gap-4 rounded-md border border-dashed border-heritage bg-cream p-4"
      onSubmit={save}
      noValidate
    >
      <h3 className="text-lg">{editingId === 'new' ? labels.add : labels.edit}</h3>
      {renderFields({ draft, setField, errors })}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={busy}>
          {t('profile.save')}
        </Button>
        <Button variant="ghost" onClick={cancel}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4">
      {error && <Alert variant="error">{errorMessage(error)}</Alert>}
      {items.length === 0 && editingId === null && <p>{labels.empty}</p>}
      <ul className="flex flex-col gap-3">
        {items.map((item) =>
          editingId === item.id ? (
            <li key={item.id}>{form}</li>
          ) : (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 border-l-4 border-heritage bg-surface px-4 py-3"
            >
              <div>
                <p className="font-bold">{summarize(item).title}</p>
                <p className="text-sm">{summarize(item).subtitle}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => startEdit(item)}
                  disabled={busy}
                >
                  <Icon name="edit" size={14} />
                  {t('profile.edit')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => run(() => deleteProfileItem(section, item.id))}
                  disabled={busy}
                  aria-label={t('profile.removeNamed', { name: summarize(item).title })}
                >
                  <Icon name="trash" size={16} />
                </Button>
              </div>
            </li>
          ),
        )}
      </ul>
      {pending.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-heritage">{t('resume.suggested')}</p>
          <ul className="flex flex-col gap-2">
            {pending.map(({ item, index }) => (
              <li
                key={index}
                className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-dashed border-heritage bg-white px-4 py-3"
              >
                <div>
                  <p className="font-bold">{summarize(item).title}</p>
                  <p className="text-sm">{summarize(item).subtitle}</p>
                  {item.confidence < lowConfidence && (
                    <Badge variant="gold">{t('resume.checkThis')}</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => review(index)}
                    disabled={busy || editingId !== null}
                  >
                    {t('resume.review')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHandled((h) => [...h, index])}
                    disabled={busy}
                  >
                    {t('resume.dismiss')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {editingId === 'new'
        ? form
        : editingId === null && (
            <Button variant="secondary" onClick={() => startEdit(null)}>
              <Icon name="plus" size={16} />
              {labels.add}
            </Button>
          )}
    </div>
  );
}
