import { secrets } from './src/config/secrets';

export default ({ config }) => {
  const namespace = config.slug;
  const sentryApi = secrets[namespace].sentryApi;
  const hooks = sentryApi?.config
    ? {
        postPublish: [
          {
            file: 'sentry-expo/upload-sourcemaps',
            config: sentryApi.config
          }
        ]
      }
    : {};

  return {
    ...config,
    hooks
  };
};
