import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';

import { colors, device, normalize, texts } from '../../config';
import { useFilterCities, useFilterStreets } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { Label } from '../Label';
import { Wrapper } from '../Wrapper';

type WasteInputFormProps = {
  addressesData: any;
  dimensions: {
    height: number;
    width: number;
  };
  hasWasteAddressesTwoStep: boolean;
  inputValue: string;
  inputValueCity: string;
  inputValueCitySelected: string;
  isCityInputFocused: boolean;
  isStreetInputFocused: boolean;
  renderSuggestion: ({ item }: { item: any }) => JSX.Element;
  renderSuggestionCities: ({ item }: { item: any }) => JSX.Element;
  setInputValue: (value: string) => void;
  setInputValueCity: (value: string) => void;
  setInputValueCitySelected: (value: boolean) => void;
  setIsCityInputFocused: (value: boolean) => void;
  setIsStreetInputFocused: (value: boolean) => void;
  setSelectedStreetId: (id: string | undefined) => void;
};

/* eslint-disable complexity */
export const WasteInputForm = ({
  addressesData,
  dimensions,
  hasWasteAddressesTwoStep,
  inputValue,
  inputValueCity,
  inputValueCitySelected,
  isCityInputFocused,
  isStreetInputFocused,
  renderSuggestion,
  renderSuggestionCities,
  setInputValue,
  setInputValueCity,
  setInputValueCitySelected,
  setIsCityInputFocused,
  setIsStreetInputFocused,
  setSelectedStreetId
}: WasteInputFormProps) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { wasteAddresses = {} } = settings;
  const { isInputAutoFocus, texts: wasteAddressesTexts = {} } = wasteAddresses;
  const wasteTexts = { ...texts.wasteCalendar, ...wasteAddressesTexts };
  const { filterCities } = useFilterCities(isCityInputFocused);
  const { filterStreets } = useFilterStreets(inputValueCity, isStreetInputFocused);
  const filteredCities = filterCities(inputValueCity, addressesData);
  const filteredStreets = filterStreets(inputValue, addressesData);
  /**
   * The variable `isStreetResultsHidden` indicates whether the street results should be hidden based
   * on the focused state of the street input and the auto-focus configuration, considering the presence
   * of input value; it is set to `true` if the conditions are met, indicating that the street results
   * should be hidden.
   */
  const isCityResultsHidden = !(
    isCityInputFocused &&
    ((!isInputAutoFocus && inputValueCitySelected) || isInputAutoFocus)
  );
  /**
   * The variable `isStreetResultsHidden` indicates whether the street results should be hidden based
   * on the focused state of the street input and the auto-focus configuration, considering the presence
   * of input value; it is set to `true` if the conditions are met, indicating that the street results
   * should be hidden.
   */
  const isStreetResultsHidden = !(
    isStreetInputFocused &&
    ((!isInputAutoFocus && inputValue) || isInputAutoFocus)
  );

  return (
    <>
      {/* Render city input field if two-step address selection is enabled */}
      {hasWasteAddressesTwoStep && (
        <Wrapper>
          <Label bold>{wasteTexts.location}</Label>
          <Autocomplete
            containerStyle={styles.autoCompleteContainer}
            data={filteredCities}
            disableFullscreenUI
            flatListProps={{
              height: inputValueCitySelected
                ? undefined
                : filteredCities?.length < 6
                ? device.platform === 'ios'
                  ? 'auto'
                  : dimensions.height / 5
                : dimensions.height / 2.5,
              keyboardShouldPersistTaps: 'handled',
              keyExtractor: (item, index) => `${item.id}-${index}`,
              renderItem: renderSuggestionCities,
              style: styles.autoCompleteList
            }}
            hideResults={isCityResultsHidden}
            inputContainerStyle={styles.autoCompleteInputContainer}
            listContainerStyle={styles.autoCompleteListContainer}
            onChangeText={(text) => {
              setInputValueCitySelected(false);
              setSelectedStreetId(undefined);
              setInputValueCity(text);
            }}
            onBlur={() => setIsCityInputFocused(false)}
            onFocus={() => {
              setIsCityInputFocused(true);
              setIsStreetInputFocused(false);
            }}
            placeholder={wasteTexts.location}
            style={styles.autoCompleteInput}
            value={inputValueCity}
          />
        </Wrapper>
      )}

      {/* Render empty container for spacing as the inputs are overlaying on Androids */}
      {device.platform === 'android' && (
        <>
          <Wrapper />
          <Wrapper style={styles.noPaddingTop} />
        </>
      )}

      {/* Render street input field if city is selected or two-step is disabled */}
      {(!hasWasteAddressesTwoStep || (hasWasteAddressesTwoStep && inputValueCitySelected)) && (
        <Wrapper style={styles.noPaddingTop}>
          <Label bold>{wasteTexts.street}</Label>
          <Autocomplete
            containerStyle={[
              styles.autoCompleteContainer,
              hasWasteAddressesTwoStep && styles.noBorderTop
            ]}
            data={filteredStreets}
            disableFullscreenUI
            flatListProps={{
              height:
                filteredStreets?.length < 6
                  ? device.platform === 'ios'
                    ? 'auto'
                    : dimensions.height / 5
                  : dimensions.height / 2.5,
              keyboardShouldPersistTaps: 'handled',
              keyExtractor: (item, index) => `${item.id}-${index}`,
              renderItem: renderSuggestion,
              style: styles.autoCompleteList
            }}
            hideResults={isStreetResultsHidden}
            inputContainerStyle={styles.autoCompleteInputContainer}
            listContainerStyle={styles.autoCompleteListContainer}
            onChangeText={(text) => setInputValue(text)}
            onBlur={() => setIsStreetInputFocused(false)}
            onFocus={() => {
              setIsCityInputFocused(false);
              setIsStreetInputFocused(true);
            }}
            placeholder={wasteTexts.street}
            style={styles.autoCompleteInput}
            value={inputValue}
          />
        </Wrapper>
      )}
    </>
  );
};
/* eslint-enable complexity */

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
    borderWidth: 0,
    paddingHorizontal: normalize(6)
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
