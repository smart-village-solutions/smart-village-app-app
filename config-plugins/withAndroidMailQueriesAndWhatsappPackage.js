// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withAndroidManifest } = require('@expo/config-plugins');

function addIntentToQuery({ mod, intent }) {
  const copyMod = { ...mod };
  if (!copyMod.modResults.manifest.queries) {
    copyMod.modResults.manifest.queries = [{ intent: [] }];
  } else if (!copyMod.modResults.manifest.queries[0]) {
    copyMod.modResults.manifest.queries = [];
  }

  copyMod.modResults.manifest.queries.push({
    ...(!intent.dataScheme && { package: [{ $: { 'android:name': intent.actionName } }] }),
    ...(intent.dataScheme && {
      intent: {
        action: [{ $: { 'android:name': intent.actionName } }],
        data: [{ $: { 'android:scheme': intent.dataScheme } }]
      }
    })
  });

  return copyMod;
}

const withAndroidMailQueriesAndWhatsappPackage = (config) => {
  const mod = withAndroidManifest(config, (mod) => {
    let modified = addIntentToQuery({
      mod,
      intent: { actionName: 'android.intent.action.SENDTO', dataScheme: 'mailto' }
    });

    modified = addIntentToQuery({
      mod: modified,
      intent: { actionName: 'com.whatsapp' }
    });

    return modified;
  });

  return mod;
};

module.exports = withAndroidMailQueriesAndWhatsappPackage;
