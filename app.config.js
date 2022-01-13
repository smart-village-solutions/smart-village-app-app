import { sentryApi } from './src/config/secrets';

export default {
  hooks: {
    postPublish: [
      sentryApi?.config && {
        file: 'sentry-expo/upload-sourcemaps',
        config: sentryApi.config
      }
    ]
  }
};
