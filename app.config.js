import { secrets } from './src/config/secrets';

export default ({ config }) => {
  const sentryConfig = secrets[config.slug]?.sentryApi?.config;
  const hooks = sentryConfig
    ? {
        postPublish: [
          {
            file: 'sentry-expo/upload-sourcemaps',
            config: sentryConfig
          }
        ]
      }
    : {};

  return {
    ...config,
    hooks
  };
};
