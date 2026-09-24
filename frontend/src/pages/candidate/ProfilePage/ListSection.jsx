import { useState } from 'react';
import { deleteProfileItem, saveProfileItem } from '../../../api/profile';
import { Alert } from '../../../components/common/Alert';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { t } from '../../../i18n';
import { errorMessage } from '../../../utils/errorMessage';
import styles from './ProfilePage.module.css';

/**
 * Add / edit / remove entries of a list section (education, experience).
 * summarize(item) → { title, subtitle }; renderFields({ draft, setField, errors }) → inputs.
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
}) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  function startEdit(item) {
    setEditingId(item?.id ?? 'new');
    setDraft(item ?? emptyItem);
    setErrors({});
    setError(null);
  }

  function cancel() {
    setEditingId(null);
    setDraft(null);
  }

  async function run(action) {
    setBusy(true);
    setError(null);
    try {
      onSaved(await action());
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
    if (Object.keys(found).length === 0) run(() => saveProfileItem(section, draft));
  }

  const setField = (name) => (value) => setDraft((d) => ({ ...d, [name]: value }));

  // Only built while an entry is being added or edited (draft is null otherwise).
  const form = draft && (
    <form className={`${styles.form} ${styles.itemForm}`} onSubmit={save} noValidate>
      <h3 className={styles.itemFormTitle}>{editingId === 'new' ? labels.add : labels.edit}</h3>
      {renderFields({ draft, setField, errors })}
      <div className={styles.formActions}>
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
    <div className="stack">
      {error && <Alert variant="error">{errorMessage(error)}</Alert>}
      {items.length === 0 && editingId === null && <p>{labels.empty}</p>}
      <ul className={styles.entries}>
        {items.map((item) =>
          editingId === item.id ? (
            <li key={item.id}>{form}</li>
          ) : (
            <li key={item.id} className={styles.entry}>
              <div>
                <p className={styles.entryTitle}>{summarize(item).title}</p>
                <p className={styles.entryMeta}>{summarize(item).subtitle}</p>
              </div>
              <div className={styles.entryActions}>
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
