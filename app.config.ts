import { ExpoConfig, ConfigContext } from 'expo/config';

import { secrets } from './src/config/secrets';

export default ({ config }: ConfigContext): ExpoConfig => {
  const namespace = config.slug;
  const sentryApi = secrets[namespace].sentryApi;

  if (sentryApi?.config) {
    config.plugins?.push([
      '@sentry/react-native/expo',
      { project: sentryApi.project, organization: sentryApi.organization }
    ]);
  }

  return config;
};
