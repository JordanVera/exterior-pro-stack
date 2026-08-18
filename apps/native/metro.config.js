const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules/expo/node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;
config.transformer.unstable_allowRequireContext = true;

const expoNested = path.resolve(projectRoot, 'node_modules/expo/node_modules');
const extraNodeModules = { ...(config.resolver.extraNodeModules ?? {}) };
for (const name of [
  'expo-modules-core',
  'expo-asset',
  'expo-file-system',
  'expo-font',
  'expo-keep-awake',
  'expo-image-picker',
  'expo-image-manipulator',
]) {
  const nested = path.join(expoNested, name);
  const local = path.join(projectRoot, 'node_modules', name);
  if (fs.existsSync(path.join(local, 'package.json'))) {
    extraNodeModules[name] = local;
  } else if (fs.existsSync(path.join(nested, 'package.json'))) {
    extraNodeModules[name] = nested;
  }
}
config.resolver.extraNodeModules = extraNodeModules;

module.exports = withNativeWind(config, { input: './global.css' });
