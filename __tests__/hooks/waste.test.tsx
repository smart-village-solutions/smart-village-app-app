import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { useWasteTypes } from '../../src/hooks/waste';
import { useStaticContent } from '../../src/hooks/staticContent';

jest.mock('../../src/components', () => ({
  RegularText: () => null,
  Wrapper: () => null
}));

jest.mock('../../src/config', () => ({
  device: {},
  namespace: 'test',
  secrets: {},
  staticRestSuffix: ''
}));

jest.mock('../../src/helpers', () => ({
  graphqlFetchPolicy: jest.fn(() => 'cache-first'),
  openLink: jest.fn()
}));

jest.mock('../../src/NetworkProvider', () => {
  const React = require('react');

  return {
    NetworkContext: React.createContext({ isConnected: true, isMainserverUp: true })
  };
});

jest.mock('../../src/SettingsProvider', () => {
  const React = require('react');

  return {
    SettingsContext: React.createContext({ globalSettings: { settings: {} } })
  };
});

jest.mock('../../src/queries', () => ({
  getQuery: jest.fn(),
  QUERY_TYPES: {
    WASTE_ADDRESSES: 'wasteAddresses',
    WASTE_STREET: 'wasteStreet'
  }
}));

jest.mock('../../src/screens', () => ({
  getLocationData: jest.fn()
}));

jest.mock('../../src/hooks/staticContent', () => ({
  useStaticContent: jest.fn(() => ({ data: { paper: {} }, error: undefined, loading: false }))
}));

const TestWasteTypes = () => {
  useWasteTypes();

  return null;
};

describe('useWasteTypes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the stable waste types refresh-time key', async () => {
    await act(async () => {
      renderer.create(<TestWasteTypes />);
    });

    expect(useStaticContent).toHaveBeenCalledWith({
      refreshTimeKey: 'waste-types',
      name: 'wasteTypes',
      type: 'json'
    });
  });
});
