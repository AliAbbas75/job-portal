// English strings, one file per area: en/<namespace>.json is available as t('<namespace>.<key>').
// Adding a new area = adding a new file; nothing else to register. Split files keep merge conflicts rare.
const files = import.meta.glob('./en/*.json', { eager: true, import: 'default' });
const en = Object.fromEntries(
  Object.entries(files).map(([path, messages]) => [path.match(/([^/]+)\.json$/)[1], messages]),
);

const messages = { en };
let language = 'en';

function lookup(key) {
  return key
    .split('.')
    .reduce((node, part) => (node == null ? undefined : node[part]), messages[language]);
}

/**
 * Translate a dotted key, e.g. t('jobs.searchPlaceholder', { count: 3 }).
 * With a numeric `count`, `<key>_zero` / `<key>_one` are used for 0 / 1 when they exist.
 * Missing keys return the key itself so they are easy to spot.
 */
const PLURAL_SUFFIX = { 0: '_zero', 1: '_one' };

export function t(key, vars = {}) {
  const suffix = PLURAL_SUFFIX[vars.count];
  const text = (suffix && lookup(`${key}${suffix}`)) ?? lookup(key);
  if (typeof text !== 'string') return key;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

export function getLanguage() {
  return language;
}

/** A list of items under a key (e.g. FAQ entries), or [] if missing. Items are not interpolated. */
export function tList(key) {
  const value = lookup(key);
  return Array.isArray(value) ? value : [];
}
