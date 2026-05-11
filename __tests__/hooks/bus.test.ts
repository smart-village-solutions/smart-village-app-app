jest.mock('../../src/queries/bus', () => ({
  findPublicServices: jest.fn(),
  getPublicService: jest.fn()
}));

jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: {}
}));

jest.mock('../../src/hooks/staticContent', () => ({
  useStaticContent: jest.fn()
}));

import { getBusQueryConfigKey } from '../../src/hooks/bus';

describe('getBusQueryConfigKey', () => {
  it('changes when relevant bus configuration changes', () => {
    expect(getBusQueryConfigKey({ uri: 'https://one.example', apiKey: 'alpha' })).not.toEqual(
      getBusQueryConfigKey({ uri: 'https://two.example', apiKey: 'alpha' })
    );

    expect(getBusQueryConfigKey({ uri: 'https://one.example', apiKey: 'alpha' })).not.toEqual(
      getBusQueryConfigKey({ uri: 'https://one.example', apiKey: 'beta' })
    );
  });

  it('stays stable for equal relevant configuration', () => {
    expect(
      getBusQueryConfigKey({ uri: 'https://one.example', apiKey: 'alpha', areaId: 1 })
    ).toEqual(getBusQueryConfigKey({ uri: 'https://one.example', apiKey: 'alpha', areaId: 2 }));
  });

  it('does not expose the raw api key in the query key', () => {
    const queryKey = getBusQueryConfigKey({ uri: 'https://one.example', apiKey: 'secret-key' });

    expect(queryKey).not.toContain('secret-key');
  });
});
