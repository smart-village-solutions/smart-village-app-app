import React from 'react';
import { render } from '@testing-library/react-native';

import { WasteCityInput } from '../../src/components/waste/WasteCityInput';
import { SettingsContext } from '../../src/SettingsProvider';

const address = { id: 42, city: 'Stadt', street: 'Alle Straßen' };
let mockAddresses: Array<{ id?: number; city: string; street: string }>;
let mockLoading: boolean;
let mockError: Error | undefined;

jest.mock('react-native-autocomplete-input', () => () => null);
jest.mock('../../src/components/Label', () => ({ Label: () => null }));
jest.mock('../../src/components/Wrapper', () => ({ Wrapper: ({ children }) => children }));
jest.mock('../../src/components/waste/WasteSuggestionList', () => ({
  WasteSuggestionList: () => null
}));
jest.mock('../../src/components/waste/wasteInputStyles', () => ({
  createWasteInputStyles: () => ({})
}));
jest.mock('../../src/config', () => ({ texts: { wasteCalendar: { location: 'City' } } }));
jest.mock('../../src/hooks', () => ({
  useFilterCities: () => ({ filterCities: () => [] }),
  useWasteAddresses: () => ({
    data: { wasteAddresses: mockAddresses },
    error: mockError,
    loading: mockLoading
  })
}));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/hooks/useThemeStyles', () => ({
  useThemeStyles: (createStyles: () => object) => createStyles()
}));
jest.mock('../../src/OrientationProvider', () => ({
  OrientationContext: jest.requireActual('react').createContext({ dimensions: { height: 800 } })
}));
jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: jest.requireActual('react').createContext({})
}));

const onSelectItem = jest.fn();

const input = ({ selected = true, twoStep = true } = {}) => (
  <SettingsContext.Provider
    value={{ globalSettings: { settings: { wasteAddresses: { twoStep } } } } as never}
  >
    <WasteCityInput
      isFocused={false}
      renderSuggestions={{
        inputValueCity: address.city,
        inputValueCitySelected: selected,
        onSelectItem,
        renderSuggestionCities: jest.fn(),
        setInputValueCity: jest.fn(),
        setInputValueCitySelected: jest.fn()
      }}
      setIsFocused={jest.fn()}
      setSelectedStreetId={jest.fn()}
    />
  </SettingsContext.Provider>
);

beforeEach(() => {
  onSelectItem.mockClear();
  mockAddresses = [address];
  mockLoading = false;
  mockError = undefined;
});

it('selects the one exact match after a confirmed city finishes loading', () => {
  mockAddresses.push({ id: 43, city: 'Stadtteil', street: 'Hauptstraße' });
  mockLoading = true;
  const tree = render(input({ selected: false }));

  tree.rerender(input());
  expect(onSelectItem).not.toHaveBeenCalled();

  mockLoading = false;
  tree.rerender(input());
  expect(onSelectItem).toHaveBeenCalledWith(address, { isAutoSelectedSingleOption: true });

  mockAddresses = [{ ...address, id: 44 }];
  tree.rerender(input());
  expect(onSelectItem).toHaveBeenCalledTimes(1);

  tree.rerender(input({ selected: false }));
  tree.rerender(input());
  expect(onSelectItem).toHaveBeenCalledTimes(2);
});

it('leaves the address for manual selection with multiple matches or a query error', () => {
  mockAddresses.push({ ...address, id: 43 });
  const tree = render(input());
  expect(onSelectItem).not.toHaveBeenCalled();

  mockAddresses = [address];
  mockError = new Error('Address lookup failed');
  tree.rerender(input());
  expect(onSelectItem).not.toHaveBeenCalled();
});

it('leaves address selection manual when two-step mode is disabled', () => {
  render(input({ twoStep: false }));
  expect(onSelectItem).not.toHaveBeenCalled();
});
