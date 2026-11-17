import { ConfigContext, ExpoConfig } from 'expo/config';

import withChangers from './modules/expo-changers/plugin';
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

  // Ship the native capability; globalSettings controls whether it runs.
  // Only native build mods consume credentials, never serialized Expo extra.
  return withChangers(config, {
    configuration: namespace ? secrets[namespace]?.['klima-taler'] : undefined
  });
};
