const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '..', 'public');
const distDir = path.resolve(__dirname, '..', 'dist');

async function ensureDirExists(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function cleanDir(dir) {
  await fs.promises.rm(dir, { recursive: true, force: true });
}

async function copyDir(from, to) {
  await fs.promises.cp(from, to, { recursive: true });
}

async function main() {
  const publicExists = fs.existsSync(publicDir);

  if (!publicExists) {
    throw new Error(`Public directory not found at ${publicDir}`);
  }

  await cleanDir(distDir);
  await ensureDirExists(distDir);
  await copyDir(publicDir, distDir);

  console.log(`Static files copied from ${publicDir} to ${distDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
