import React, { useContext, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { colors, device, normalize } from '../../config';
import { SettingsContext } from '../../SettingsProvider';
import { Wrapper } from '../Wrapper';

import { WasteCityInput } from './WasteCityInput';
import { WasteStreetInput } from './WasteStreetInput';

export const WasteInputForm = ({
  renderSuggestions = {
    inputValue: '',
    inputValueCity: '',
    setInputValue: () => {},
    setInputValueCity: () => {},
    inputValueCitySelected: false,
    setInputValueCitySelected: () => {},
    renderSuggestionCities: () => <></>,
    renderSuggestion: () => <></>
  },
  setSelectedStreetId
}: {
  renderSuggestions: {
    inputValue: string;
    inputValueCity: string;
    setInputValue: (value: string) => void;
    setInputValueCity: (value: string) => void;
    inputValueCitySelected: boolean;
    setInputValueCitySelected: (value: boolean) => void;
    renderSuggestionCities: ({ item }: { item: any }) => JSX.Element;
    renderSuggestion: ({ item }: { item: any }) => JSX.Element;
  };
  setSelectedStreetId: (id?: number) => void;
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { wasteAddresses = {} } = settings;
  const { twoStep: hasWasteAddressesTwoStep = false } = wasteAddresses;
  const [isCityInputFocused, setIsCityInputFocused] = useState(false);
  const [isStreetInputFocused, setIsStreetInputFocused] = useState(false);
  const { inputValueCitySelected } = renderSuggestions;

  return (
    <>
      {/* Render city input field if two-step address selection is enabled */}
      {hasWasteAddressesTwoStep && (
        <WasteCityInput
          isFocused={isCityInputFocused}
          renderSuggestions={renderSuggestions}
          setIsFocused={setIsCityInputFocused}
          setSelectedStreetId={setSelectedStreetId}
        />
      )}

      {/* Render empty container for spacing as the inputs are overlaying on Androids */}
      {hasWasteAddressesTwoStep && device.platform === 'android' && (
        <>
          <Wrapper />
          <Wrapper style={styles.noPaddingTop} />
        </>
      )}

      {/* Render street input field if city is selected or two-step is disabled */}
      {(!hasWasteAddressesTwoStep || (hasWasteAddressesTwoStep && inputValueCitySelected)) && (
        <WasteStreetInput
          isFocused={isStreetInputFocused}
          setIsFocused={setIsStreetInputFocused}
          renderSuggestions={renderSuggestions}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  autoCompleteContainer: {
    paddingHorizontal: 0
  },
  autoCompleteInputContainer: {
    borderColor: colors.gray40,
    borderRadius: normalize(8),
    borderWidth: normalize(1),
    height: normalize(42)
  },
  autoCompleteInput: {
    backgroundColor: colors.transparent,
    color: colors.darkText,
    paddingLeft: normalize(12),
    paddingRight: normalize(6),
    paddingVertical: device.platform === 'ios' ? normalize(10) : normalize(8),
    fontFamily: 'regular',
    fontSize: normalize(14),
    height: normalize(42),
    lineHeight: normalize(20)
  },
  autoCompleteList: {
    paddingHorizontal: normalize(6),
    position: 'relative',
    ...Platform.select({
      ios: {
        borderWidth: 0
      },
      android: {
        borderColor: colors.gray20,
        borderRadius: 0,
        borderWidth: normalize(1),
        maxHeight: normalize(300)
      }
    })
  },
  autoCompleteListContainer: {
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3
  },
  noPaddingTop: {
    paddingTop: 0
  },
  noBorderTop: {
    borderTopWidth: 0,
    marginTop: normalize(-1)
  }
});
