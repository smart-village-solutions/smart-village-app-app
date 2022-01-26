import { secrets } from './src/config/secrets';

let hooks = secrets.sentryApi?.config
  ? {
      postPublish: [
        secrets.sentryApi?.config && {
          file: 'sentry-expo/upload-sourcemaps',
          config: secrets.entryApi.config
        }
      ]
    }
  : {};

export default ({ config }) => ({
  ...config,
  hooks
});
