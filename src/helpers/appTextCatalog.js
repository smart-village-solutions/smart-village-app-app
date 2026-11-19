import gql from 'graphql-tag';
import * as Updates from 'expo-updates';
import { DevSettings } from 'react-native';

import { textsByLocale } from '../config/texts';

import { textFunctionParameters } from './appTextCatalogFunctions';
import { getMainServerConfig, getMainServerUrl } from './mainServerHelper';
import { addToStore, readFromStore, removeFromStore } from './storageHelper';

const SCHEMA = 'sva-mobile-app-texts-v2';
const query = gql`
  query AppTextCatalog($schema: String!, $locale: String!, $knownRevision: String) {
    appTextCatalog(schema: $schema, locale: $locale, knownRevision: $knownRevision)
  }
`;

const storageKey = (locale) =>
  JSON.stringify([
    'appTextCatalog',
    getMainServerUrl(),
    getMainServerConfig().oAuthClientId,
    SCHEMA,
    locale
  ]);
const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
const validEnvelope = (data, locale) =>
  object(data) &&
  data.schema === SCHEMA &&
  data.locale === locale &&
  typeof data.revision === 'string' &&
  /^[1-9][0-9]{0,18}$/.test(data.revision);

const validValues = (values) =>
  object(values) &&
  Object.keys(values).length <= 4000 &&
  JSON.stringify(values).length <= 1024 * 1024;

export const readAppTextCatalog = async (locale) => {
  try {
    const data = await readFromStore(storageKey(locale));
    return validEnvelope(data, locale) && validValues(data.values) ? data : null;
  } catch {
    return null;
  }
};

const tokenPattern = /\{\{([A-Za-z][A-Za-z0-9_]*)\}\}/g;
const pluralKeys = new Set([
  'participationProject.categoryCount',
  'wasteCalendar.scheduledWasteReminderCount'
]);
const safeTemplate = (value, parameters) =>
  typeof value === 'string' &&
  [...new Set(Array.from(value.matchAll(tokenPattern), ([, name]) => name))].sort().join(',') ===
    [...parameters].sort().join(',');

const textFunction = (key, value, catalog) => {
  if (!Object.hasOwn(textFunctionParameters, key)) return undefined;
  const parameters = textFunctionParameters[key];
  const templates = pluralKeys.has(key) ? value : [value];
  if (
    !Array.isArray(templates) ||
    templates.length !== (pluralKeys.has(key) ? 2 : 1) ||
    !templates.every((template) => safeTemplate(template, parameters))
  )
    return undefined;
  return (...args) => {
    const template = templates[templates.length === 2 && args[0] !== 1 ? 1 : 0];
    return template.replace(tokenPattern, (_, name) => {
      if (key === 'voucher.detailScreen.frequency') {
        return String(
          name === 'maxPerPerson' ? args[0] || 1 : catalog.voucher.detailScreen[args[1]]
        );
      }
      return String(args[parameters.indexOf(name)]);
    });
  };
};

const compatibleText = (original, value) =>
  (typeof original === 'string' && typeof value === 'string') ||
  (Array.isArray(original) &&
    Array.isArray(value) &&
    value.every((item) => typeof item === 'string'));

const mergeTexts = (base, values, path, catalog) => {
  for (const [segment, original] of Object.entries(base)) {
    const key = path ? `${path}.${segment}` : segment;
    if (key === 'screenTitles.home') continue;
    if (object(original)) {
      mergeTexts(original, values, key, catalog);
      continue;
    }
    if (!Object.hasOwn(values, key)) continue;
    const value = values[key];
    if (typeof original === 'function')
      base[segment] = textFunction(key, value, catalog) ?? original;
    else if (compatibleText(original, value)) base[segment] = value;
  }
};

const cloneTree = (tree) =>
  Object.fromEntries(
    Object.entries(tree).map(([key, value]) => [key, object(value) ? cloneTree(value) : value])
  );

export const applyAppTextCatalog = ({ locale, values }) => {
  const base = Object.hasOwn(textsByLocale, locale) ? textsByLocale[locale] : textsByLocale.de;
  const catalog = cloneTree(base);
  mergeTexts(catalog, values, '', catalog);
  return catalog;
};

export const refreshAppTextCatalog = async (client, locale, { reload = true } = {}) => {
  const current = await readAppTextCatalog(locale);
  const { data } = await client.query({
    query,
    fetchPolicy: 'no-cache',
    variables: { schema: SCHEMA, locale, knownRevision: current?.revision }
  });
  if (!data || !Object.hasOwn(data, 'appTextCatalog')) return;
  const next = data.appTextCatalog;
  if (next === null) {
    if (!current) return;
    await removeFromStore(storageKey(locale));
  } else {
    if (
      !validEnvelope(next, locale) ||
      next.revision === current?.revision ||
      !validValues(next.values)
    )
      return;
    await addToStore(storageKey(locale), next);
  }
  // Reload once after storing a changed snapshot so module-level labels are rebuilt as well.
  if (!reload) return;
  if (__DEV__) DevSettings.reload();
  else await Updates.reloadAsync();
};
