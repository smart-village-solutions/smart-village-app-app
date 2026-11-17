import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import withChangers, {
  mergePlist,
  mergeManifest,
  mergeBackup,
  withSimulatorCompatibility
} from '../../modules/expo-changers/plugin';

test('simulator compatibility hook survives prebuild and preserves existing post-integration work', () => {
  for (const source of [
    'platform :ios, "16.4"\n',
    'post_integrate do |pods|\n  preserve_customer_setup(pods)\nend\n'
  ]) {
    const result = withSimulatorCompatibility(source);
    expect(withSimulatorCompatibility(result)).toBe(result);
    expect(result.match(/post_integrate do/g)).toHaveLength(1);
    expect(result).toContain('ExpoChangersSimulatorCompatibility.apply(');
    if (source.includes('preserve_customer_setup'))
      expect(result).toContain('preserve_customer_setup(pods)');
  }
});

test('Plist-Zusammenführung erhält eigene Berechtigungstexte und Hintergrundmodi', () => {
  const plist = {
    NSMotionUsageDescription: 'Eigener Berechtigungstext',
    UIBackgroundModes: ['audio', 'location']
  };
  const once = JSON.parse(JSON.stringify(mergePlist(plist)));
  assert.deepEqual(mergePlist(plist), once);
  assert.equal(plist.NSMotionUsageDescription, 'Eigener Berechtigungstext');
  assert.deepEqual(plist.UIBackgroundModes, ['audio', 'location']);
});
test('Manifest-Zusammenführung ist idempotent und erhält Backup-Regeln und App-Komponenten', () => {
  const manifest = {
    manifest: {
      $: {},
      application: [
        {
          $: {
            'android:name': '.MainApplication',
            'android:allowBackup': 'true',
            'android:usesCleartextTraffic': 'true',
            'android:networkSecurityConfig': '@xml/customer_network',
            'android:fullBackupContent': '@xml/custom'
          },
          receiver: [{ $: { 'android:name': '.CustomerReceiver', 'android:exported': 'false' } }],
          activity: [{ $: { 'android:name': '.MainActivity' } }],
          provider: [{ $: { 'android:name': 'OtherProvider', 'android:authorities': 'other' } }]
        }
      ]
    }
  };
  const once = JSON.parse(JSON.stringify(mergeManifest(manifest)));
  assert.deepEqual(mergeManifest(manifest), once);
  const app = manifest.manifest.application[0];
  assert.equal(app.$['android:allowBackup'], 'true');
  assert.equal(app.$['android:fullBackupContent'], '@xml/custom');
  expect(app.$['android:usesCleartextTraffic']).toBe('true');
  expect(app.$['android:networkSecurityConfig']).toBe('@xml/customer_network');
  expect(app.receiver).toHaveLength(3);
  expect(app.receiver[0].$['android:name']).toBe('.CustomerReceiver');
  expect(app.receiver[1].$['tools:node']).toBe('remove');
  expect(app.receiver[2].$).toEqual({
    'android:name': 'expo.modules.changers.ChangersBootReceiver',
    'android:exported': 'false'
  });
  expect(
    app.receiver[2]['intent-filter'][0].action.map((action) => action.$['android:name'])
  ).toEqual([
    'android.intent.action.BOOT_COMPLETED',
    'android.intent.action.QUICKBOOT_POWERON',
    'com.htc.intent.action.QUICKBOOT_POWERON',
    'android.intent.action.MY_PACKAGE_REPLACED'
  ]);
  assert.equal(app.activity.length, 2);
  assert.equal(app.provider.length, 2);
});
test('Backup-Zusammenführung erhält vorhandene Ausnahmen und ist wiederholbar', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'changers-test-'));
  try {
    const file = path.join(dir, 'backup.xml');
    await fs.writeFile(
      file,
      '<full-backup-content><exclude domain="sharedpref" path="secure.xml"/></full-backup-content>'
    );
    await mergeBackup(file, false);
    const once = await fs.readFile(file, 'utf8');
    await mergeBackup(file, false);
    assert.equal(await fs.readFile(file, 'utf8'), once);
    assert.match(once, /secure.xml/);
    assert.match(once, /motiontag_tracker.xml/);
    assert.match(once, /com.pusher.pushnotifications.PushNotificationsInstance.xml/);
    assert.match(once, /beams/);
    const modern = path.join(dir, 'modern.xml');
    await mergeBackup(modern, true);
    const one = await fs.readFile(modern, 'utf8');
    await mergeBackup(modern, true);
    assert.equal(await fs.readFile(modern, 'utf8'), one);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
test('Leere XML-Backup-Dokumente lassen sich zusammenführen', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'changers-empty-'));
  try {
    const file = path.join(dir, 'backup.xml');
    await fs.writeFile(file, '<full-backup-content/>');
    await mergeBackup(file, false);
    assert.match(await fs.readFile(file, 'utf8'), /motiontag_tracker.xml/);
    const modern = path.join(dir, 'modern.xml');
    await fs.writeFile(
      modern,
      '<data-extraction-rules><cloud-backup/><device-transfer/></data-extraction-rules>'
    );
    await mergeBackup(modern, true);
    assert.match(await fs.readFile(modern, 'utf8'), /motiontag_tracker.xml/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
test('Ein inkompatibler vorhandener FileProvider wird abgewiesen und nicht stillschweigend ersetzt', () => {
  const manifest = {
    manifest: {
      $: {},
      application: [
        {
          $: { 'android:name': '.MainApplication' },
          provider: [
            {
              $: { 'android:name': 'Other', 'android:authorities': '${applicationId}.fileprovider' }
            }
          ]
        }
      ]
    }
  };
  assert.throws(() => mergeManifest(manifest), /kollidiert/);
});
test('ML-Kit-Zusammenführung erhält vorhandene Modelle und beide Barcode-Abhängigkeiten', () => {
  const manifest = {
    manifest: {
      $: {},
      application: [
        {
          $: { 'android:name': '.MainApplication' },
          'meta-data': [
            {
              $: {
                'android:name': 'com.google.mlkit.vision.DEPENDENCIES',
                'android:value': 'face,barcode',
                'tools:replace': 'android:resource'
              }
            }
          ]
        }
      ]
    }
  };
  const once = JSON.parse(JSON.stringify(mergeManifest(manifest)));
  assert.deepEqual(mergeManifest(manifest), once);
  const metadata = manifest.manifest.application[0]['meta-data'][0].$;
  assert.equal(metadata['android:value'], 'face,barcode,barcode_ui');
  assert.equal(metadata['tools:replace'], 'android:resource,android:value');
});

test('native runtime is isolated and credentials are not serialized in public config', () => {
  const config = withChangers(
    {
      name: 'Fixture',
      slug: 'fixture',
      version: '5.0.0',
      sdkVersion: '57.0.27',
      extra: { customer: 'fixture' }
    },
    {
      configuration: {
        clientId: '1',
        clientName: 'fixture',
        clientSecret: 'test-only-provider-value'
      }
    }
  );
  expect(config.runtimeVersion).toBe('5.0.0-changers-2');
  expect(config.extra).toEqual({ customer: 'fixture' });
  expect(JSON.stringify(config)).not.toContain('test-only-provider-value');
});
