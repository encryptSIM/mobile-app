import type { ExpoConfig, ConfigContext } from 'expo/config';
import { readFileSync } from 'fs';
import { join } from 'path';

function getVersionFromFile(): string {
  try {
    const versionPath = join(__dirname, 'version.txt');
    const version = readFileSync(versionPath, 'utf8').trim();
    console.log(`Using version from version.txt: ${version}`);
    return version;
  } catch (error) {
    console.warn('Could not read version.txt, using default version');
    return '0.0.3';
  }
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const PROD = 'prod'
  const DEV = 'dev'
  const env = process.env.ENVIRONMENT ?? DEV
  const ext = env === PROD ? '' : `.${env}`
  let name = `encryptSIM (${ext.slice(1).toUpperCase()})`
  if (env === PROD) name = "encryptSIM"
  console.log("ext", ext)
  console.log("name", name)
  const version = getVersionFromFile()

  return {
    ...config,
    name,
    version,
    // INCREMENT RUNTIME VERSION WHEN MODIFYING:
    // - package.json
    // - app.config.ts
    // - app.json
    "runtimeVersion": "runtime-1",
    slug: "encryptsim",
    ios: {
      ...config.ios,
      bundleIdentifier: `com.encryptsim.app${ext}`,
      entitlements: config.ios ? {
        ...config.ios.entitlements,
      } : {}
    },
    android: {
      ...config.android,
      package: `com.encryptsim.app${ext}`,
    },
  }
};

