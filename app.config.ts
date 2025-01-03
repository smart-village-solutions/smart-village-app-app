import { ConfigContext, ExpoConfig } from 'expo/config';

import { secrets } from './src/config/secrets';

export default ({ config }: ConfigContext): ExpoConfig => {
  const namespace = config.slug;
  const sentryApi = namespace ? secrets[namespace]?.sentryApi : undefined;

  if (sentryApi?.config) {
    config.plugins?.push([
      '@sentry/react-native/expo',
      { project: sentryApi.config.project, organization: sentryApi.config.organization }
    ]);
  }

  return config;
};
