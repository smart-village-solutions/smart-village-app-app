import React, { useContext, useState } from 'react';

import { SettingsContext } from '../../SettingsProvider';

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
