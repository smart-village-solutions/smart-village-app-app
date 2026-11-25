// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withAndroidManifest } = require('expo/config-plugins');

const portraitFeatureName = 'android.hardware.screen.portrait';

const withAndroidOptionalPortrait = (config) =>
  withAndroidManifest(config, (mod) => {
    const { manifest } = mod.modResults;
    const features = (manifest['uses-feature'] ??= []);
    const portraitFeature = features.find(({ $ }) => $?.['android:name'] === portraitFeatureName);

    if (portraitFeature) {
      portraitFeature.$['android:required'] = 'false';
    } else {
      features.push({ $: { 'android:name': portraitFeatureName, 'android:required': 'false' } });
    }

    return mod;
  });

module.exports = withAndroidOptionalPortrait;
