// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AndroidConfig, withAndroidStyles } = require('expo/config-plugins');

// Android 15+ otherwise draws TextViews using glyph bounds, while React Native
// measures using glyph advances. The different wrapping can hide the last line.
// https://github.com/react/react-native/pull/58280
module.exports = (config) =>
  withAndroidStyles(config, (mod) => {
    mod.modResults = AndroidConfig.Styles.setStylesItem({
      item: { $: { name: 'android:useBoundsForWidth' }, _: 'false' },
      xml: mod.modResults,
      parent: AndroidConfig.Styles.getAppThemeGroup()
    });

    return mod;
  });
