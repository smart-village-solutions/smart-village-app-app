import { AndroidConfig } from 'expo/config-plugins';

import withAndroidTextMeasurement from '../../config-plugins/withAndroidTextMeasurement';

const applyPlugin = async (xml) => {
  const config = withAndroidTextMeasurement({ name: 'Test', slug: 'test' });
  const result = await config.mods.android.styles({
    ...config,
    modResults: xml,
    modRequest: { nextMod: (mod) => mod }
  });

  return result.modResults;
};

describe('Android text measurement theme', () => {
  it('adds the setting to a generated theme without an existing override', async () => {
    const result = await applyPlugin({
      resources: {
        style: [{ $: { name: 'AppTheme', parent: 'Theme.AppCompat.DayNight.NoActionBar' } }]
      }
    });

    expect(AndroidConfig.Styles.getStylesGroupAsObject(result, { name: 'AppTheme' })).toEqual({
      'android:useBoundsForWidth': 'false'
    });
  });

  it('disables bounds-based wrapping without replacing customer theme settings', async () => {
    const xml = {
      resources: {
        style: [
          {
            $: { name: 'AppTheme', parent: 'CustomerTheme' },
            item: [
              { $: { name: 'colorPrimary' }, _: '@color/customer_primary' },
              { $: { name: 'android:useBoundsForWidth' }, _: 'true' }
            ]
          },
          { $: { name: 'Theme.App.SplashScreen', parent: 'Theme.SplashScreen' } }
        ]
      }
    };

    const result = await applyPlugin(xml);
    const appTheme = result.resources.style[0];

    expect(appTheme.$.parent).toBe('CustomerTheme');
    expect(AndroidConfig.Styles.getStylesGroupAsObject(result, { name: 'AppTheme' })).toEqual({
      colorPrimary: '@color/customer_primary',
      'android:useBoundsForWidth': 'false'
    });
    expect(result.resources.style[1]).toEqual({
      $: { name: 'Theme.App.SplashScreen', parent: 'Theme.SplashScreen' }
    });

    const snapshot = JSON.parse(JSON.stringify(result));
    expect(await applyPlugin(result)).toEqual(snapshot);
    expect(
      appTheme.item.filter((item) => item.$.name === 'android:useBoundsForWidth')
    ).toHaveLength(1);
  });
});
