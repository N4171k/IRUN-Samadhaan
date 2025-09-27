import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const TARGET_DEPENDENCIES = [
  {
    name: '@rollup/rollup-linux-x64-gnu',
    version: '4.34.8',
  },
  {
    name: '@tailwindcss/oxide-linux-x64-gnu',
    version: '4.0.14',
  },
];

const require = createRequire(import.meta.url);

const isLinux = process.platform === 'linux';
const isX64 = process.arch === 'x64';

if (!isLinux || !isX64) {
  console.log(
    `[prebuild] Linux/x64-only dependencies not required on ${process.platform}/${process.arch}.`
  );
  process.exit(0);
}

for (const dependency of TARGET_DEPENDENCIES) {
  const { name, version } = dependency;
  try {
    require.resolve(name);
    console.log(`[prebuild] ${name} already available.`);
  } catch (error) {
    console.log(`[prebuild] Installing ${name}@${version}...`);
    try {
      execSync(`npm install ${name}@${version} --no-save`, {
        stdio: 'inherit',
      });
    } catch (installError) {
      console.error(`[prebuild] Failed to install ${name}:`, installError);
      process.exit(1);
    }
  }
}
