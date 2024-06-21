import { secrets } from './src/config/secrets';

export default ({ config }) => {
  const namespace = config.slug;
  const sentryApi = secrets[namespace].sentryApi;

  const plugins = sentryApi.config
    ? [
        ...config.plugins,
        [
          '@sentry/react-native/expo',
          { project: sentryApi.project, organization: sentryApi.organization }
        ]
      ]
    : [...config.plugins];

  return {
    ...config,
    plugins
  };
};
