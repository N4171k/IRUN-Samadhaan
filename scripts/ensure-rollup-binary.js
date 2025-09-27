import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const TARGET_PACKAGE = '@rollup/rollup-linux-x64-gnu';
const TARGET_VERSION = '4.34.8';

const require = createRequire(import.meta.url);

const isLinux = process.platform === 'linux';
const isX64 = process.arch === 'x64';

if (!isLinux || !isX64) {
  console.log(
    `[prebuild] ${TARGET_PACKAGE}@${TARGET_VERSION} not required on ${process.platform}/${process.arch}.`
  );
  process.exit(0);
}

try {
  require.resolve(TARGET_PACKAGE);
  console.log(`[prebuild] ${TARGET_PACKAGE} already available.`);
} catch (error) {
  console.log(`[prebuild] Installing ${TARGET_PACKAGE}@${TARGET_VERSION}...`);
  try {
    execSync(`npm install ${TARGET_PACKAGE}@${TARGET_VERSION} --no-save`, {
      stdio: 'inherit'
    });
  } catch (installError) {
    console.error(`[prebuild] Failed to install ${TARGET_PACKAGE}:`, installError);
    process.exit(1);
  }
}
