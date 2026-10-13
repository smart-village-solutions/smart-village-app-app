import { buildSentryAppTags } from '../../src/helpers/sentryAppContext';

describe('Sentry app and OTA identity', () => {
  it('retains native identity separately from a sandbox slug and update', () => {
    expect(
      buildSentryAppTags({
        applicationId: 'de.ni.osnabrueck.app',
        slug: 'studio-sandbox',
        channel: 'production',
        runtimeVersion: 'fingerprint-hash',
        updateId: 'update-id',
        isEmbeddedLaunch: false
      })
    ).toEqual({
      'app.identifier': 'de.ni.osnabrueck.app',
      'app.slug': 'studio-sandbox',
      'expo.channel': 'production',
      'expo.runtime_version': 'fingerprint-hash',
      'expo.update_id': 'update-id',
      'expo.is_embedded_launch': 'false'
    });
  });
  it('handles unavailable native metadata without inventing a customer or environment', () => {
    expect(buildSentryAppTags({ slug: 'smart-village-app', isEmbeddedLaunch: true })).toEqual({
      'app.identifier': 'unknown',
      'app.slug': 'smart-village-app',
      'expo.channel': 'unknown',
      'expo.runtime_version': 'unknown',
      'expo.update_id': 'embedded',
      'expo.is_embedded_launch': 'true'
    });
  });
});
