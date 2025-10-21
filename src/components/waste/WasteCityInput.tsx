import React, { useContext, useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';

import { colors, device, normalize, texts } from '../../config';
import { useFilterCities, useKeyboardHeight, useWasteAddresses } from '../../hooks';
import { OrientationContext } from '../../OrientationProvider';
import { SettingsContext } from '../../SettingsProvider';
import { Label } from '../Label';
import { Wrapper } from '../Wrapper';

type Props = {
  isFocused: boolean;
  renderSuggestions: {
    inputValueCity: string;
    setInputValueCity: (value: string) => void;
    inputValueCitySelected: boolean;
    setInputValueCitySelected: (value: boolean) => void;
    renderSuggestionCities: ({ item }: { item: any }) => JSX.Element;
  };
  setIsFocused: (val: boolean) => void;
  setSelectedStreetId: (id?: number) => void;
};

export const WasteCityInput = ({
  isFocused,
  renderSuggestions,
  setIsFocused,
  setSelectedStreetId
}: Props) => {
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
    renderSuggestionCities
  } = renderSuggestions;
  const { data } = useWasteAddresses({
    minSearchLength: minSearchLengthTwoStep,
    search: inputValueCity
  });
  const { filterCities } = useFilterCities(isFocused);
  const cities = filterCities(inputValueCity, data?.wasteAddresses);
  const keyboardHeight = useKeyboardHeight();
  const listContainerHeight = useMemo(() => {
    const listLength = cities?.length ?? 0;

    if (listLength < 6) {
      return device.platform === 'ios' ? 'auto' : listLength * (normalize(22) + 2 * normalize(16));
    } else {
      return dimensions.height / 2.5;
    }
  }, [cities, dimensions.height]);

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
          {
            height: inputValueCitySelected ? undefined : listContainerHeight,
            marginBottom: keyboardHeight
          }
        ]}
        onBlur={() => setIsFocused(false)}
        onChangeText={(text) => {
          setInputValueCitySelected(false);
          setSelectedStreetId(undefined);
          setInputValueCity(text);
        }}
        onFocus={() => setIsFocused(true)}
        placeholder={wasteTexts.location}
        style={styles.autoCompleteInput}
        value={inputValueCity}
      />
    </Wrapper>
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
  }
});
