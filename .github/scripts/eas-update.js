const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

const appJsonPath = path.resolve(__dirname, '../../app.json');
// Read the file
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Native compatibility must be derived from the actual native dependencies.
// Refuse inherited release configuration that could deliver new JS to old binaries.
const runtimePolicies = [
  appJson.expo?.runtimeVersion,
  appJson.expo?.ios?.runtimeVersion ?? appJson.expo?.runtimeVersion,
  appJson.expo?.android?.runtimeVersion ?? appJson.expo?.runtimeVersion
];
if (runtimePolicies.some((runtime) => runtime?.policy !== 'fingerprint')) {
  throw new Error(
    'OTA updates require the fingerprint runtime policy and a compatible native build.'
  );
}

// The installed uploader requires this even when the project is configured via app.config.ts.
if (!process.env.SENTRY_AUTH_TOKEN) {
  throw new Error('SENTRY_AUTH_TOKEN is required to upload OTA source maps.');
}
const sourceMapUploader = require.resolve('@sentry/react-native/scripts/expo-upload-sourcemaps');

// Ensure that expo.extra.otaVersion exists and is a number
if (!appJson.expo || typeof appJson.expo.extra?.otaVersion !== 'number') {
  console.error('❌ Error: expo.extra.otaVersion is missing or is not a number.');
  process.exit(1);
}

// Execute EAS Update with provided message argument
const updateMessage = process.argv.slice(2).join(' ');
if (!updateMessage) {
  console.error('❌ Error: You must provide an EAS Update message!');
  process.exit(1);
}

// Increment the over-the-air version
appJson.expo.extra.otaVersion += 1;

// Save and lint the file
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
execSync(`yarn prettier --write ${appJsonPath}`, { stdio: 'inherit' });

console.log(`✅ expo.extra.otaVersion has been incremented to ${appJson.expo.extra.otaVersion}.`);

execFileSync('eas', ['update', '--channel', 'production', '--message', updateMessage], {
  stdio: 'inherit'
});

// Upload the exact artifacts exported by EAS, not a second bundle with different debug IDs.
execFileSync(process.execPath, [sourceMapUploader, 'dist'], { stdio: 'inherit' });

// Perform Git commit
execSync('git add app.json', { stdio: 'inherit' });
execSync(`git commit -m "release: increment over-the-air version"`, { stdio: 'inherit' });

// Perform Git push
execSync('git push', { stdio: 'inherit' });

console.log('🚀 OTA update completed and Git is up-to-date!');
