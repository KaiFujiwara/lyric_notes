import { ExpoConfig, ConfigContext } from 'expo/config';

const IS_DEV = process.env.APP_ENV === 'development';

const getUniqueIdentifier = () => {
  if (IS_DEV) return 'com.somedon.lyricsnotes.dev';
  return 'com.somedon.lyricsnotes';
};

const getAppName = () => {
  if (IS_DEV) return 'Lyrics Notes (Dev)';
  return 'Lyrics Notes';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'lyrics_notes',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'lyricsnotes',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: getUniqueIdentifier(),
  },
  android: {
    package: getUniqueIdentifier(),
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
  ],
  extra: {
    eas: {
      projectId: 'a3470b0c-5831-4f10-955d-4245bafa1123',
    },
    env: process.env.APP_ENV || 'production',
  },
  owner: 'somedon',
});