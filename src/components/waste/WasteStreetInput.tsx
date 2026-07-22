import React, { useContext, useMemo } from 'react';
import Autocomplete from 'react-native-autocomplete-input';

import { device, normalize, texts } from '../../config';
import { useFilterStreets, useKeyboardHeight, useWasteAddresses } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { OrientationContext } from '../../OrientationProvider';
import { SettingsContext } from '../../SettingsProvider';
import { Label } from '../Label';
import { LoadingSpinner } from '../LoadingSpinner';
import { Wrapper } from '../Wrapper';

import { createWasteInputStyles } from './wasteInputStyles';

type Props = {
  isFocused: boolean;
  renderSuggestions: {
    inputValue: string;
    inputValueCity: string;
    setInputValue: (value: string) => void;
    renderSuggestion: ({ item }: { item: any }) => JSX.Element;
  };
  setIsFocused: (val: boolean) => void;
};

export const WasteStreetInput = ({ isFocused, renderSuggestions, setIsFocused }: Props) => {
  const { colors } = useTheme();
  const styles = useThemeStyles(createWasteInputStyles);
  const { dimensions } = useContext(OrientationContext);
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { wasteAddresses = {} } = settings;
  const {
    isInputAutoFocus,
    minSearchLength = 2,
    twoStep: hasWasteAddressesTwoStep = false,
    texts: wasteAddressesTexts = {}
  } = wasteAddresses;
  const wasteTexts = { ...texts.wasteCalendar, ...wasteAddressesTexts };
  const { inputValue, inputValueCity, setInputValue, renderSuggestion } = renderSuggestions;
  const { data, loading } = useWasteAddresses({ minSearchLength, search: inputValue });
  const { filterStreets } = useFilterStreets(inputValueCity, isFocused);
  const streets = filterStreets(inputValue, data?.wasteAddresses);
  const isLoading = inputValue.length >= minSearchLength && loading;
  const keyboardHeight = useKeyboardHeight();
  const listContainerHeight = useMemo(() => {
    const listLength = streets?.length ?? 0;

    if (listLength < 6) {
      return device.platform === 'ios' ? 'auto' : listLength * (normalize(22) + 2 * normalize(16));
    } else {
      return dimensions.height / 2.5;
    }
  }, [streets, dimensions.height]);

  /**
   * The variable `isStreetResultsHidden` indicates whether the street results should be hidden based
   * on the focused state of the street input and the auto-focus configuration, considering the presence
   * of input value; it is set to `true` if the conditions are met, indicating that the street results
   * should be hidden.
   */
  const isStreetResultsHidden = !(
    isFocused &&
    ((!isInputAutoFocus && inputValue) || isInputAutoFocus)
  );

  return (
    <Wrapper style={styles.noPaddingTop}>
      <Label bold>{wasteTexts.street}</Label>
      <Autocomplete
        autoCorrect={false}
        autoFocus={!hasWasteAddressesTwoStep && isInputAutoFocus}
        containerStyle={[
          styles.autoCompleteContainer,
          hasWasteAddressesTwoStep && styles.noBorderTop
        ]}
        data={streets}
        disableFullscreenUI
        flatListProps={{
          keyboardShouldPersistTaps: 'handled',
          keyExtractor: (item, index) => `${item.id}-${index}`,
          renderItem: renderSuggestion,
          style: styles.autoCompleteList
        }}
        hideResults={isStreetResultsHidden}
        inputContainerStyle={styles.autoCompleteInputContainer}
        listContainerStyle={[
          styles.autoCompleteListContainer,
          { height: listContainerHeight, marginBottom: keyboardHeight }
        ]}
        onBlur={() => setIsFocused(false)}
        onChangeText={(text) => setInputValue(text)}
        onFocus={() => setIsFocused(true)}
        placeholder={wasteTexts.street}
        placeholderTextColor={colors.placeholder}
        selectionColor={colors.primary}
        style={styles.autoCompleteInput}
        value={inputValue}
      />
      <LoadingSpinner loading={isLoading} />
    </Wrapper>
  );
};
