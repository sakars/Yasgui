// distributeBuildFiles.js
const fs = require("fs");
const path = require("path");

const packages = ["yasgui", "yasr", "yasqe", "utils"];
const buildDir = path.join(__dirname, "../build/ts/packages");

packages.forEach((p) => {
  const pkgBuildDir = path.join(__dirname, `../packages/${p}/build`);
  // Remove existing build dir
  if (fs.existsSync(pkgBuildDir)) {
    fs.rmSync(pkgBuildDir, { recursive: true, force: true });
  }
  fs.mkdirSync(pkgBuildDir, { recursive: true });

  // Copy ts build
  const srcTs = path.join(buildDir, p);
  const destTs = path.join(pkgBuildDir, "ts");
  if (fs.existsSync(srcTs)) {
    fs.mkdirSync(destTs, { recursive: true });
    copyRecursiveSync(srcTs, destTs);
  }

  // Copy build/${p}* files
  const buildRoot = path.join(__dirname, "../build");
  const files = fs.readdirSync(buildRoot).filter((f) => f.startsWith(p));
  files.forEach((f) => {
    const src = path.join(buildRoot, f);
    const dest = path.join(pkgBuildDir, f);
    fs.copyFileSync(src, dest);
  });
});

function copyRecursiveSync(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((child) => {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
