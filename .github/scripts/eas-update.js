const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const appJsonPath = path.resolve(__dirname, '../../app.json');
// Read the file
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Ensure that expo.extra.otaVersion exists and is a number
if (!appJson.expo || typeof appJson.expo.extra.otaVersion !== 'number') {
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

execSync(`eas update --channel production --message "${updateMessage}"`, { stdio: 'inherit' });

// Perform Git commit
execSync('git add app.json', { stdio: 'inherit' });
execSync(`git commit -m "release: increment over-the-air version"`, { stdio: 'inherit' });

// Perform Git push
execSync('git push', { stdio: 'inherit' });

console.log('🚀 OTA update completed and Git is up-to-date!');
