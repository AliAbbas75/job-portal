import en from './en.json';

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
