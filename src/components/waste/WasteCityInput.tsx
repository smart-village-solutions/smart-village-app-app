import React, { useContext, useEffect, useRef } from 'react';
import Autocomplete from 'react-native-autocomplete-input';

import { texts } from '../../config';
import { getAutoSelectableWasteAddress } from '../../helpers/wasteAddressHelper';
import { useFilterCities, useRenderSuggestions, useWasteAddresses } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { OrientationContext } from '../../OrientationProvider';
import { SettingsContext } from '../../SettingsProvider';
import { Label } from '../Label';
import { Wrapper } from '../Wrapper';

import { createWasteInputStyles } from './wasteInputStyles';
import { WasteSuggestionList } from './WasteSuggestionList';

type Props = {
  isFocused: boolean;
  renderSuggestions: Pick<
    ReturnType<typeof useRenderSuggestions>,
    | 'inputValueCity'
    | 'setInputValueCity'
    | 'inputValueCitySelected'
    | 'setInputValueCitySelected'
    | 'onSelectItem'
    | 'renderSuggestionCities'
  >;
  setIsFocused: (val: boolean) => void;
  setSelectedStreetId: (id?: number) => void;
};

export const WasteCityInput = ({
  isFocused,
  renderSuggestions,
  setIsFocused,
  setSelectedStreetId
}: Props) => {
  const { colors } = useTheme();
  const styles = useThemeStyles(createWasteInputStyles);
  const { dimensions } = useContext(OrientationContext);
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { wasteAddresses = {} } = settings;
  const {
    isInputAutoFocus,
    minSearchLengthTwoStep = 2,
    texts: wasteAddressesTexts = {},
    twoStep: hasWasteAddressesTwoStep = false
  } = wasteAddresses;
  const wasteTexts = { ...texts.wasteCalendar, ...wasteAddressesTexts };
  const {
    inputValueCity = '',
    setInputValueCity,
    inputValueCitySelected,
    setInputValueCitySelected,
    onSelectItem,
    renderSuggestionCities
  } = renderSuggestions;
  const { data, error, loading } = useWasteAddresses({
    minSearchLength: minSearchLengthTwoStep,
    search: inputValueCity
  });
  const { filterCities } = useFilterCities(isFocused);
  const addresses = data?.wasteAddresses;
  const cities = filterCities(inputValueCity, addresses);
  const autoSelectedCity = useRef<string | null>(null);

  useEffect(() => {
    if (!inputValueCitySelected) {
      autoSelectedCity.current = null;
      return;
    }

    if (
      !hasWasteAddressesTwoStep ||
      loading ||
      error ||
      autoSelectedCity.current === inputValueCity
    ) {
      return;
    }

    const address = getAutoSelectableWasteAddress(addresses, inputValueCity);
    if (!address) return;

    autoSelectedCity.current = inputValueCity;
    onSelectItem(address, { isAutoSelectedSingleOption: true });
  }, [
    addresses,
    error,
    hasWasteAddressesTwoStep,
    inputValueCity,
    inputValueCitySelected,
    loading,
    onSelectItem
  ]);

  /**
   * The variable `isCityResultsHidden` indicates whether the city results should be hidden based
   * on the focused state of the city input and the auto-focus configuration, considering the presence
   * of input value; it is set to `true` if the conditions are met, indicating that the city results
   * should be hidden.
   */
  const isCityResultsHidden = !(
    isFocused &&
    ((!isInputAutoFocus && inputValueCitySelected) || isInputAutoFocus)
  );

  return (
    <Wrapper>
      <Label bold>{wasteTexts.location}</Label>
      <Autocomplete
        autoCorrect={false}
        autoFocus={hasWasteAddressesTwoStep && isInputAutoFocus}
        containerStyle={styles.autoCompleteContainer}
        data={cities}
        disableFullscreenUI
        flatListProps={{
          keyboardShouldPersistTaps: 'handled',
          keyExtractor: (item, index) => `${item.id}-${index}`,
          renderItem: renderSuggestionCities,
          style: styles.autoCompleteList
        }}
        hideResults={isCityResultsHidden}
        inputContainerStyle={styles.autoCompleteInputContainer}
        listContainerStyle={[
          styles.autoCompleteListContainer,
          { maxHeight: dimensions.height / 2.5 }
        ]}
        onBlur={() => setIsFocused(false)}
        onChangeText={(text) => {
          setInputValueCitySelected(false);
          setSelectedStreetId(undefined);
          setInputValueCity(text);
        }}
        onFocus={() => setIsFocused(true)}
        placeholder={wasteTexts.location}
        renderResultList={WasteSuggestionList}
        placeholderTextColor={colors.placeholder}
        selectionColor={colors.primary}
        style={styles.autoCompleteInput}
        value={inputValueCity}
      />
    </Wrapper>
  );
};
