const fs = require('fs');

const licensesFile = 'licenses.json';

try {
  const rawData = fs.readFileSync(licensesFile, 'utf8');
  const licenses = JSON.parse(rawData);

  for (const key in licenses) {
    delete licenses[key].path;
    delete licenses[key].licenseFile;
  }

  fs.writeFileSync(licensesFile, JSON.stringify(licenses, null, 2), 'utf8');
} catch (error) {
  process.exit(1);
}
