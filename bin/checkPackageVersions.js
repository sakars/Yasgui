#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Compare two semantic version strings
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

// Get repo version from lerna.json
const repoDir = path.dirname(__filename);
const repoFile = path.join(repoDir, "../lerna.json");
const repoData = JSON.parse(fs.readFileSync(repoFile, "utf8"));
const repoVersion = repoData.version;

// Check each package
const packagesDir = path.join(repoDir, "../packages");
const packages = fs.readdirSync(packagesDir);

let hasError = false;

packages.forEach((packageName) => {
  const packageFile = path.join(packagesDir, packageName, "package.json");

  // Skip if package.json doesn't exist
  if (!fs.existsSync(packageFile)) {
    return;
  }

  const packageData = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  const packageVersion = packageData.version;

  // Check if package version is higher than repo version
  if (compareVersions(packageVersion, repoVersion) > 0) {
    console.error(
      `ERROR: Package version for package '${packageName}' (${packageVersion}) is higher than the repository version (${repoVersion}). In this monorepo all packages are versioned in sync. To version and publish a package, run 'yarn run version' in the root of this repository.\n`
    );
    hasError = true;
  }
});

if (hasError) {
  process.exit(1);
}
