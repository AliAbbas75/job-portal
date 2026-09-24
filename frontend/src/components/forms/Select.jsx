import { useEffect, useId, useRef, useState } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../common/Icon';

/**
 * Dropdown used everywhere instead of <select>. The list shows 4 options and scrolls beyond that.
 * Accessible "select-only combobox" (WAI-ARIA): arrows, Home/End, Enter/Space, Escape, type-ahead.
 *
 * options: [{ value, label }]. `placeholder` adds a first option with value '' (e.g. "All ...").
 * onChange(value) receives the option's value.
 */
export function Select({
  id,
  value,
  onChange,
  options,
  placeholder,
  size = 'md',
  disabled = false,
  invalid = false,
  describedBy,
  labelledBy,
  ariaLabel,
  className,
}) {
  const autoId = useId();
  const baseId = id ?? autoId;
  const listId = `${baseId}-list`;
  const items =
    placeholder !== undefined ? [{ value: '', label: placeholder }, ...options] : options;
  const selectedIndex = items.findIndex((item) => item.value === value);
  const startIndex = Math.max(0, selectedIndex);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(startIndex);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const typed = useRef({ text: '', at: 0 });

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keep the active option visible inside the 4-item window.
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  function openList() {
    if (disabled) return;
    setActive(startIndex);
    setOpen(true);
  }

  function choose(index) {
    onChange(items[index].value);
    setOpen(false);
  }

  function typeAhead(key) {
    const now = Date.now();
    const text = (now - typed.current.at < 700 ? typed.current.text : '') + key.toLowerCase();
    typed.current = { text, at: now };
    const start = (open ? active : startIndex) + 1;
    const ordered = [...items.slice(start), ...items.slice(0, start)];
    const match = ordered.find((item) => item.label.toLowerCase().startsWith(text));
    if (!match) return;
    const index = items.indexOf(match);
    if (open) setActive(index);
    else onChange(match.value);
  }

  function onKeyDown(event) {
    if (disabled) return;
    const last = items.length - 1;
    const keys = {
      ArrowDown: () => (open ? setActive((i) => Math.min(last, i + 1)) : openList()),
      ArrowUp: () => (open ? setActive((i) => Math.max(0, i - 1)) : openList()),
      Home: () => open && setActive(0),
      End: () => open && setActive(last),
      Enter: () => (open ? choose(active) : openList()),
      ' ': () => (open ? choose(active) : openList()),
      Escape: () => setOpen(false),
      Tab: () => open && choose(active),
    };
    if (keys[event.key]) {
      if (event.key !== 'Tab') event.preventDefault();
      keys[event.key]();
    } else if (event.key.length === 1 && /\S/.test(event.key)) {
      typeAhead(event.key);
    }
  }

  return (
    <div ref={rootRef} className={cx('relative', className)}>
      <div
        id={baseId}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-controls={listId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${baseId}-opt-${active}` : undefined}
        aria-labelledby={labelledBy}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-disabled={disabled || undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cx(
          'flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm px-3 text-left select-none',
          size === 'sm' ? 'min-h-10 text-sm' : 'min-h-11',
          invalid ? 'border-2 border-ember' : 'border border-heritage',
          disabled ? 'cursor-not-allowed bg-surface' : 'bg-white',
        )}
      >
        <span className="truncate">{items[selectedIndex]?.label ?? ''}</span>
        <Icon
          name="chevronDown"
          size={16}
          className={cx('flex-none text-heritage transition-transform', open && 'rotate-180')}
        />
      </div>

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-labelledby={labelledBy}
        aria-label={ariaLabel}
        hidden={!open}
        className="absolute inset-x-0 top-full z-30 mt-1 dropdown-list rounded-sm border border-heritage bg-white"
      >
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <li
              key={item.value}
              id={`${baseId}-opt-${index}`}
              role="option"
              aria-selected={isSelected}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
              onMouseEnter={() => setActive(index)}
              className={cx(
                'flex h-10 cursor-pointer items-center justify-between gap-2 px-3',
                size === 'sm' && 'text-sm',
                index === active && 'bg-surface',
                isSelected && 'font-bold text-heritage',
              )}
            >
              <span className="truncate" title={item.label}>
                {item.label}
              </span>
              {isSelected && <Icon name="check" size={16} className="flex-none" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
