import { ConfigContext } from 'expo/config';

import configureApp from '../../app.config';
import withChangers from '../../modules/expo-changers/plugin';

jest.mock('../../modules/expo-changers/plugin', () => jest.fn((config) => config));
jest.mock('../../src/config/secrets', () => ({
  secrets: {
    'fixture-app': {
      'klima-taler': {
        clientId: '123',
        clientSecret: 'fixture-only-secret',
        clientName: 'fixture-app'
      }
    },
    'other-app': {
      'klima-taler': { clientId: '456', clientSecret: 'other-fixture', clientName: 'other-app' }
    }
  }
}));

beforeEach(() => jest.clearAllMocks());

test('builds include the native capability with credentials from their own namespace', () => {
  const config = { slug: 'fixture-app', extra: {} };
  configureApp({ config } as ConfigContext);
  expect(withChangers).toHaveBeenCalledWith(config, {
    configuration: {
      clientId: '123',
      clientSecret: 'fixture-only-secret',
      clientName: 'fixture-app'
    }
  });
  expect(config.extra).toEqual({});
});

test('the legacy build flag does not override runtime globalSettings activation', () => {
  const config = { slug: 'fixture-app', extra: { klimaTaler: { enabled: false } } };
  expect(configureApp({ config } as ConfigContext)).toBe(config);
  expect(withChangers).toHaveBeenCalled();
});

test('an unconfigured customer never inherits another customer connection', () => {
  const config = { slug: 'unconfigured-app' };
  configureApp({ config } as ConfigContext);
  expect(withChangers).toHaveBeenCalledWith(config, { configuration: undefined });
});
