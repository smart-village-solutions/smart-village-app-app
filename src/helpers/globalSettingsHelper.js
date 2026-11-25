import _isPlainObject from 'lodash/isPlainObject';

export const mergeGlobalSettings = (cachedSettings, content, fetchPolicy) => {
  if (!_isPlainObject(content) || Object.keys(content).length === 0) return cachedSettings;

  const settings = { ...cachedSettings, ...content };

  if (
    fetchPolicy === 'network-only' &&
    !Object.hasOwn(content, 'sections') &&
    Object.hasOwn(settings.sections ?? {}, 'eventDetailTitle')
  ) {
    settings.sections = { ...settings.sections };
    delete settings.sections.eventDetailTitle;
  }

  return settings;
};
