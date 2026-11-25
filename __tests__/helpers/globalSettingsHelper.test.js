import { mergeGlobalSettings } from '../../src/helpers/globalSettingsHelper';

const cachedSettings = {
  sections: { eventDetailTitle: 'Event', headlineEvents: 'Events' },
  waste: { cityId: 1 }
};
const contentWithoutSections = { navigation: 'tab' };

describe('mergeGlobalSettings', () => {
  it('drops only the cached event detail title when the server omits sections', () => {
    const settings = mergeGlobalSettings(cachedSettings, contentWithoutSections, 'network-only');

    expect(settings).toEqual({
      navigation: 'tab',
      sections: { headlineEvents: 'Events' },
      waste: { cityId: 1 }
    });
    expect(settings.sections).not.toHaveProperty('eventDetailTitle');
    expect(cachedSettings.sections.eventDetailTitle).toBe('Event');
  });

  it('keeps the cached title when the cache-only response omits sections', () => {
    const settings = mergeGlobalSettings(cachedSettings, contentWithoutSections, 'cache-only');

    expect(settings.sections).toBe(cachedSettings.sections);
  });

  it.each([undefined, {}])('keeps cached settings for absent content (%p)', (content) => {
    expect(mergeGlobalSettings(cachedSettings, content, 'network-only')).toBe(cachedSettings);
  });

  it.each([{}, { eventDetailTitle: 'Termin' }])(
    'uses the sections supplied by the server',
    (sections) => {
      expect(mergeGlobalSettings(cachedSettings, { sections }, 'network-only').sections).toBe(
        sections
      );
    }
  );
});
