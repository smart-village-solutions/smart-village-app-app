import withAndroidOptionalPortrait from '../../config-plugins/withAndroidOptionalPortrait';

const optionalPortrait = {
  $: { 'android:name': 'android.hardware.screen.portrait', 'android:required': 'false' }
};

async function applyPlugin(manifest) {
  const config = withAndroidOptionalPortrait({});
  const { modResults } = await config.mods.android.manifest({
    modRequest: {},
    modResults: { manifest }
  });
  return modResults.manifest;
}

describe('withAndroidOptionalPortrait', () => {
  it('adds an optional portrait feature at the manifest root and preserves activity orientation', async () => {
    const application = [
      { activity: [{ $: { 'android:name': '.Browser', 'android:screenOrientation': 'portrait' } }] }
    ];

    expect(await applyPlugin({ application })).toEqual({
      application: [
        {
          activity: [{ $: { 'android:name': '.Browser', 'android:screenOrientation': 'portrait' } }]
        }
      ],
      'uses-feature': [optionalPortrait]
    });
  });

  it('updates the existing portrait feature and preserves other features', async () => {
    const camera = { $: { 'android:name': 'android.hardware.camera', 'android:required': 'true' } };
    const portrait = { $: { ...optionalPortrait.$, 'android:required': 'true' } };

    const manifest = await applyPlugin({ 'uses-feature': [camera, portrait] });

    expect(manifest['uses-feature']).toEqual([
      { $: { 'android:name': 'android.hardware.camera', 'android:required': 'true' } },
      optionalPortrait
    ]);
  });

  it('does not add a second portrait feature when applied again', async () => {
    const manifest = await applyPlugin({});

    expect((await applyPlugin(manifest))['uses-feature']).toEqual([optionalPortrait]);
  });
});
