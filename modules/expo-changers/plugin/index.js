const fs = require('node:fs');
const path = require('node:path');
const {
  withInfoPlist,
  withAndroidManifest,
  withProjectBuildGradle,
  withPodfile,
  withDangerousMod,
  AndroidConfig
} = require('expo/config-plugins');
const { XML } = require('expo/config-plugins');
const withBuildProperties = require('expo-build-properties').default;
const PERMISSIONS = [
  'ACCESS_FINE_LOCATION',
  'ACCESS_COARSE_LOCATION',
  'ACCESS_BACKGROUND_LOCATION',
  'ACTIVITY_RECOGNITION',
  'FOREGROUND_SERVICE',
  'FOREGROUND_SERVICE_LOCATION',
  'POST_NOTIFICATIONS',
  'CAMERA'
];
function mergePlist(plist) {
  const descriptions = {
    NSLocationWhenInUseUsageDescription:
      'Mit Ihrer Erlaubnis verwendet Klima-Taler Ihren Standort, um zurückgelegte Wege zu erfassen.',
    NSLocationAlwaysAndWhenInUseUsageDescription:
      'Mit Ihrer Einwilligung erfasst Klima-Taler Ihre Wege auch im Hintergrund.',
    NSMotionUsageDescription:
      'Bewegungsdaten werden verwendet, um die Art der Fortbewegung zu erkennen.',
    NSCameraUsageDescription: 'Die Kamera wird zum Scannen von Klima-Taler-QR-Codes verwendet.'
  };
  for (const [key, value] of Object.entries(descriptions)) plist[key] ??= value;
  plist.UIBackgroundModes = [...new Set([...(plist.UIBackgroundModes || []), 'location'])];
  return plist;
}
function mergeManifest(manifest) {
  manifest.manifest.$['xmlns:tools'] ??= 'http://schemas.android.com/tools';
  const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  // Expo Dev Launcher benötigt barcode_ui; Changers/Quickie benötigt barcode.
  // ML Kit unterstützt eine kommagetrennte Abhängigkeitsliste; Einträge der einbindenden App ebenfalls erhalten.
  app['meta-data'] ??= [];
  let mlkit = app['meta-data'].find(
    (x) => x.$['android:name'] === 'com.google.mlkit.vision.DEPENDENCIES'
  );
  if (!mlkit) {
    mlkit = { $: { 'android:name': 'com.google.mlkit.vision.DEPENDENCIES' } };
    app['meta-data'].push(mlkit);
  }
  mlkit.$['android:value'] = [
    ...new Set([
      ...(mlkit.$['android:value'] || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean),
      'barcode',
      'barcode_ui'
    ])
  ].join(',');
  mlkit.$['tools:replace'] = [
    ...new Set([
      ...(mlkit.$['tools:replace'] || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean),
      'android:value'
    ])
  ].join(',');
  app.activity ??= [];
  if (
    !app.activity.some((x) => x.$['android:name'] === 'com.blacksquared.sdk.activity.WebActivity')
  ) {
    app.activity.push({
      $: {
        'android:name': 'com.blacksquared.sdk.activity.WebActivity',
        'android:exported': 'false',
        'android:theme': '@style/Theme.AppCompat.Light.NoActionBar'
      }
    });
  }
  app.provider ??= [];
  const authority = '${applicationId}.fileprovider';
  const existing = app.provider.find((x) => x.$['android:authorities'] === authority);
  if (
    existing &&
    !existing['meta-data']?.some(
      (x) =>
        x.$['android:name'] === 'android.support.FILE_PROVIDER_PATHS' &&
        x.$['android:resource'] === '@xml/changers_file_paths'
    )
  )
    throw new Error(
      'Die Changers-FileProvider-Authority kollidiert mit einem vorhandenen Provider. Die Pfade in der Konfiguration der einbindenden App abgleichen.'
    );
  if (!existing) {
    app.provider.push({
      $: {
        'android:name': 'expo.modules.changers.ChangersFileProvider',
        'android:authorities': authority,
        'android:exported': 'false',
        'android:grantUriPermissions': 'true'
      },
      'meta-data': [
        {
          $: {
            'android:name': 'android.support.FILE_PROVIDER_PATHS',
            'android:resource': '@xml/changers_file_paths'
          }
        }
      ]
    });
  }
  app.$['android:fullBackupContent'] ??= '@xml/changers_backup_rules';
  app.$['android:dataExtractionRules'] ??= '@xml/changers_data_extraction_rules';
  app.$['tools:replace'] = [
    ...new Set([
      ...(app.$['tools:replace'] || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean),
      'android:fullBackupContent',
      'android:dataExtractionRules'
    ])
  ].join(',');
  return manifest;
}
async function mergeBackup(file, modern) {
  let doc = fs.existsSync(file)
    ? await XML.readXMLAsync({ path: file })
    : modern
    ? { 'data-extraction-rules': { 'cloud-backup': [{}], 'device-transfer': [{}] } }
    : { 'full-backup-content': {} };
  const rootKey = modern ? 'data-extraction-rules' : 'full-backup-content';
  if (doc[rootKey] === '') doc[rootKey] = {};
  const root = doc[rootKey];
  if (!root || typeof root !== 'object')
    throw new Error('Nicht unterstützte Backup-Regeln: ' + file);
  const targets = modern
    ? ['cloud-backup', 'device-transfer'].map((key) => {
        root[key] ||= [{}];
        if (root[key][0] === '') root[key][0] = {};
        return root[key][0];
      })
    : [root];
  for (const target of targets) {
    target.exclude ||= [];
    // Die Backup-Ausnahmen des transitiven Pusher-1.9.0-AAR ebenfalls übernehmen.
    for (const [domain, entry] of [
      ['sharedpref', 'motiontag_tracker.xml'],
      ['sharedpref', 'changers_activated.xml'],
      ['sharedpref', 'com.pusher.pushnotifications.PushNotificationsInstance.xml'],
      ['file', 'beams/.']
    ]) {
      if (!target.exclude.some((x) => x.$.domain === domain && x.$.path === entry))
        target.exclude.push({ $: { domain, path: entry } });
    }
  }
  await XML.writeXMLAsync({ path: file, xml: doc });
}
function withChangers(config, options = {}) {
  // The verified provider connection uses the SDK's stage transport. This is not
  // an app environment selector. Never infer a different host from the SVA slug.
  const environment = 'stage';
  if (!config.version) throw new Error('Changers requires an app version for OTA isolation.');
  config.runtimeVersion = `${config.version}-changers-2`;

  config = withBuildProperties(config, { ios: { enableSceneSupport: true } });
  config = withPodfile(config, (c) => {
    c.modResults.contents = withSimulatorCompatibility(c.modResults.contents);
    return c;
  });
  const provider = options.configuration || {};
  if (provider.clientId && !/^\d+$/.test(String(provider.clientId)))
    throw new Error('Changers clientId must be numeric.');
  config = withInfoPlist(config, (c) => {
    c.modResults = mergePlist(c.modResults);
    c.modResults.ChangersConfiguration = {
      environment,
      clientId: String(provider.clientId || ''),
      clientName: provider.clientName || '',
      clientSecret: provider.clientSecret || ''
    };
    return c;
  });
  config = AndroidConfig.Permissions.withPermissions(
    config,
    PERMISSIONS.map((p) => 'android.permission.' + p)
  );
  config = withAndroidManifest(config, async (c) => {
    c.modResults = mergeManifest(c.modResults);
    const res = path.join(c.modRequest.platformProjectRoot, 'app/src/main/res/xml');
    fs.mkdirSync(res, { recursive: true });
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(c.modResults);
    for (const [key, modern] of [
      ['android:fullBackupContent', false],
      ['android:dataExtractionRules', true]
    ]) {
      const ref = app.$[key];
      if (ref === 'false') continue;
      if (!/^@xml\/[a-z0-9_]+$/.test(ref))
        throw new Error('Keine sichere Zusammenführung möglich für ' + key);
      await mergeBackup(path.join(res, ref.slice(5) + '.xml'), modern);
    }
    return c;
  });
  config = withProjectBuildGradle(config, (c) => {
    const block = `// @generated expo-changers-repositories begin
allprojects {
  repositories {
    exclusiveContent {
      forRepository { maven { url 'https://pkgs.dev.azure.com/motiontag/releases/_packaging/releases/maven/v1' } }
      filter { includeGroup 'de.motiontag' }
    }
    exclusiveContent {
      forRepository { maven { url 'https://jitpack.io' } }
      filter { includeGroupByRegex 'com.github.Changers.*' }
    }
  }
}
// @generated expo-changers-repositories end`;
    c.modResults.contents =
      c.modResults.contents
        .replace(
          /\n?\/\/ @generated expo-changers-repositories begin[\s\S]*?\/\/ @generated expo-changers-repositories end\n?/g,
          '\n'
        )
        .trimEnd() +
      '\n\n' +
      block +
      '\n';
    return c;
  });
  config = withDangerousMod(config, [
    'android',
    async (c) => {
      const root = c.modRequest.platformProjectRoot;
      // Die dokumentierte Pfadressource des Anbieters wird in dessen AAR mitgeliefert.
      const assets = path.join(root, 'app/src/main/assets');
      fs.mkdirSync(assets, { recursive: true });
      fs.writeFileSync(
        path.join(assets, 'changers-config.json'),
        JSON.stringify({
          environment,
          clientId: String(provider.clientId || ''),
          clientName: provider.clientName || '',
          clientSecret: provider.clientSecret || ''
        })
      );
      return c;
    }
  ]);
  return config;
}
module.exports = withChangers;
function withSimulatorCompatibility(contents) {
  const marker = '# @generated expo-changers-simulator';
  if (contents.includes(marker)) return contents;
  const hook = /^([ \t]*)post_integrate do \|(\w+)\|/m;
  const requirement = `${marker}\nrequire_relative '../modules/expo-changers/ios/simulator_compatibility'\n`;
  if (hook.test(contents)) {
    return (
      contents
        .replace(
          hook,
          (match, indent, installer) =>
            `${match}\n${indent}  ExpoChangersSimulatorCompatibility.apply(${installer})`
        )
        .trimEnd() + `\n\n${requirement}`
    );
  }
  if (/^\s*post_integrate\b/m.test(contents))
    throw new Error('Changers requires a post_integrate hook with a named installer argument.');
  return `${contents.trimEnd()}\n\n${requirement}
post_integrate do |installer|
  ExpoChangersSimulatorCompatibility.apply(installer)
end
`;
}
module.exports.withSimulatorCompatibility = withSimulatorCompatibility;
module.exports.mergePlist = mergePlist;
module.exports.mergeManifest = mergeManifest;
module.exports.mergeBackup = mergeBackup;
