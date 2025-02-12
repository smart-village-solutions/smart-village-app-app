const fs = require('fs');
const path = require('path');

const licenseFilePath = path.join(__dirname, '../../licenses.json');
const licensesMdPath = path.join(__dirname, '../../LICENSES.md');
const rawData = fs.readFileSync(licenseFilePath, 'utf8');
const dependencies = JSON.parse(rawData);
const licenseCounts = {};

Object.values(dependencies).forEach(({ licenses }) => {
  if (!licenses) return;

  const cleanedLicenses = licenses.replace(/[()]/g, '').replace(/\*/g, '').replace(/ /g, '-');

  cleanedLicenses.split(/-OR-|-AND-/).forEach((licenseType) => {
    licenseType = licenseType.trim();

    if (!licenseType) return;

    licenseCounts[licenseType] = (licenseCounts[licenseType] || 0) + 1;
  });
});

const sortedLicenses = Object.entries(licenseCounts).sort((a, b) => {
  if (b[1] !== a[1]) {
    return b[1] - a[1]; // Zuerst nach Anzahl sortieren (absteigend)
  }

  return a[0].localeCompare(b[0]); // Dann alphabetisch (aufsteigend)
});

const getLicenseUrl = (license) => {
  if (license.toLowerCase() === "public-domain") {
    return 'https://en.wikipedia.org/wiki/Public_domain';
  }

  if (license.toLowerCase() === "bsd") {
    return 'https://en.wikipedia.org/wiki/BSD_licenses';
  }

  return `https://spdx.org/licenses/${license}.html`;
};

let licenseSummary = '## Licenses overview\n\n';
licenseSummary += '| License | Packages count |\n';
licenseSummary += '|---------|---------------:|\n';

sortedLicenses.forEach(([license, count]) => {
  const link = getLicenseUrl(license);

  licenseSummary += `| [${license}](${link}) | ${count} |\n`;
});

let existingMd = fs.existsSync(licensesMdPath) ? fs.readFileSync(licensesMdPath, 'utf8') : '';

if (existingMd.includes('## License Overview')) {
  existingMd = existingMd.replace(/## License Overview[\s\S]*?(\n#|$)/, licenseSummary + '$1');
} else {
  existingMd += '\n\n' + licenseSummary;
}

fs.writeFileSync(licensesMdPath, existingMd, 'utf8');
