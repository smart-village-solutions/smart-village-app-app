import _uniqBy from 'lodash/uniqBy';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useQuery } from 'react-apollo';
import { Alert, Keyboard, TouchableOpacity } from 'react-native';
import { Divider } from 'react-native-elements';

import { RegularText, Wrapper } from '../components';
import { device, namespace, secrets, staticRestSuffix } from '../config';
import { graphqlFetchPolicy, openLink } from '../helpers';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';
import { getLocationData } from '../screens';
import { SettingsContext } from '../SettingsProvider';

import { useStaticContent } from './staticContent';
import { useRefreshTime } from './TimeHooks';

export const useWasteAddresses = ({
  minSearchLength = 0,
  search = ''
}: {
  minSearchLength?: number;
  search?: string;
}) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const addressesRefreshTime = useRefreshTime('waste-addresses');
  const addressesFetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime: addressesRefreshTime
  });
  const { data, loading, error } = useQuery(getQuery(QUERY_TYPES.WASTE_ADDRESSES), {
    variables: { search },
    fetchPolicy: addressesFetchPolicy,
    skip: !addressesRefreshTime || search.length < minSearchLength
  });

  return {
    data,
    error,
    loading
  };
};

export const useWasteStreet = ({ selectedStreetId }: { selectedStreetId?: number }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const streetRefreshTime = useRefreshTime(
    selectedStreetId ? `waste-street-${selectedStreetId}` : 'waste-street'
  );
  const streetFetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime: streetRefreshTime
  });
  const { data, loading, error } = useQuery(getQuery(QUERY_TYPES.WASTE_STREET), {
    variables: { ids: selectedStreetId },
    fetchPolicy: streetFetchPolicy,
    skip: !streetRefreshTime || !selectedStreetId
  });

  return {
    data,
    error,
    loading
  };
};

export const useWasteTypes = () => {
  const { data, loading, error } = useStaticContent({
    refreshTimeKey: 'waste-types',
    name: 'wasteTypes',
    type: 'json'
  });

  return {
    data,
    error,
    loading
  };
};

export const useWasteUsedTypes = ({ streetData, typesData }) =>
  useMemo(
    () =>
      streetData?.[QUERY_TYPES.WASTE_ADDRESSES]?.[0]?.wasteLocationTypes?.reduce(
        (acc, { wasteType }) => {
          const typeData = typesData?.[wasteType];
          if (typeData) {
            acc[wasteType] = typeData;
          }
          return acc;
        },
        {}
      ),
    [streetData, typesData]
  );

export const useWasteMarkedDates = ({ streetData, selectedTypes }) =>
  useMemo(() => {
    const dates = {};
    const wasteLocationTypes = streetData?.[QUERY_TYPES.WASTE_ADDRESSES]?.[0]?.wasteLocationTypes;

    if (wasteLocationTypes && selectedTypes) {
      wasteLocationTypes.forEach((wasteLocationType) => {
        // only add marked dates for known types
        if (!selectedTypes[wasteLocationType.wasteType]) {
          return;
        }

        const { color, selected_color: selectedColor } = selectedTypes[wasteLocationType.wasteType];
        wasteLocationType?.listPickUpDates?.forEach((date) => {
          dates[date] = {
            marked: true,
            note: date.note,
            dots: [...(dates[date]?.dots ?? []), { color, selectedColor }]
          };
        });
      });
    }

    return dates;
  }, [streetData, selectedTypes]);

export const useStreetString = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { wasteAddresses = {} } = settings;
  const { twoStep: hasWasteAddressesTwoStep = false } = wasteAddresses;

  const getStreetString = useCallback(
    (address: { street?: string; zip?: string; city?: string }) => {
      if (!hasWasteAddressesTwoStep) {
        return address.street || '';
      }

      const zipAndCity = [address.zip, address.city].filter(Boolean).join(' ');

      return `${address.street} (${zipAndCity})`;
    },
    [hasWasteAddressesTwoStep]
  );

  return {
    getStreetString
  };
};

export const useFilterCities = (isCityInputFocused: boolean) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { wasteAddresses = {} } = settings;
  const { isInputAutoFocus, cityCount: wasteAddressesCityCount = 5 } = wasteAddresses;

  // filter cities that contain the string in it
  const filterCities = useCallback(
    (currentInputValue, addressesData) => {
      if (isInputAutoFocus && currentInputValue === '' && !isCityInputFocused) return [];

      const cities = addressesData?.filter((address) =>
        address.city?.toLowerCase().includes(currentInputValue?.toLowerCase())
      );

      const sortedCities = _uniqBy(cities, 'city');

      if (isInputAutoFocus) {
        return sortedCities;
      }

      return sortedCities.slice(0, wasteAddressesCityCount);
    },
    [isCityInputFocused]
  );

  return {
    filterCities
  };
};

export const useFilterStreets = (inputValueCity: string, isStreetInputFocused: boolean) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { wasteAddresses = {} } = settings;
  const {
    isInputAutoFocus,
    streetCount: wasteAddressesStreetCount = 5,
    twoStep: hasWasteAddressesTwoStep = false
  } = wasteAddresses;
  const { getStreetString } = useStreetString();

  // filter streets that contain the string in it
  // consider the city if it is set because of the two step process
  const filterStreets = useCallback(
    (currentInputValue, addressesData) => {
      if (hasWasteAddressesTwoStep && inputValueCity === '') return [];
      if (isInputAutoFocus && currentInputValue === '' && !isStreetInputFocused) return [];

      const streets = addressesData
        ?.filter((address) => {
          const street = getStreetString(address);

          return street?.toLowerCase().includes(currentInputValue.toLowerCase());
        })
        ?.filter((address) => (hasWasteAddressesTwoStep ? address.city === inputValueCity : true));

      if (isInputAutoFocus) {
        return streets || [];
      }

      return streets.slice(0, wasteAddressesStreetCount) || [];
    },
    [getStreetString, inputValueCity, isStreetInputFocused]
  );

  return {
    filterStreets
  };
};

export const useRenderSuggestions = (selectionCallback?: () => void) => {
  const [inputValueCity, setInputValueCity] = useState('');
  const [inputValueCitySelected, setInputValueCitySelected] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { getStreetString } = useStreetString();

  const renderSuggestionCities = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() => {
          setInputValue('');
          setInputValueCity(item.city);
          setInputValueCitySelected(true);
          Keyboard.dismiss();
        }}
      >
        <Wrapper>
          <RegularText small>{item.city}</RegularText>
        </Wrapper>
        <Divider />
      </TouchableOpacity>
    ),
    [setInputValue, setInputValueCity, setInputValueCitySelected]
  );

  const renderSuggestion = useCallback(
    ({ item }) => {
      const streetString = getStreetString(item);

      return (
        <TouchableOpacity
          onPress={() => {
            setInputValue(streetString);
            selectionCallback?.();
            Keyboard.dismiss();
          }}
        >
          <Wrapper>
            <RegularText small>{streetString}</RegularText>
          </Wrapper>
          <Divider />
        </TouchableOpacity>
      );
    },
    [setInputValue]
  );

  return {
    inputValue,
    setInputValue,
    inputValueCity,
    setInputValueCity,
    inputValueCitySelected,
    setInputValueCitySelected,
    renderSuggestionCities,
    renderSuggestion
  };
};

export const useTriggerExport = ({ streetData, wasteTexts }) => {
  const triggerExport = useCallback(
    ({ selectedTypes }: { selectedTypes: string[] }) => {
      const { street, zip, city } = getLocationData(streetData);

      const baseUrl = secrets[namespace].serverUrl + staticRestSuffix.wasteCalendarExport;

      let params = `street=${encodeURIComponent(street)}`;

      if (zip) {
        params += `&zip=${encodeURIComponent(zip)}`;
      }

      if (city) {
        params += `&city=${encodeURIComponent(city)}`;
      }

      if (selectedTypes?.length) {
        params += `&waste_types=${selectedTypes.join(',')}`;
      }

      const combinedUrl = baseUrl + params;

      if (device.platform === 'android') {
        return Alert.alert(
          wasteTexts.exportAlertTitle,
          wasteTexts.exportAlertBody,
          [
            {
              onPress: () => {
                openLink(combinedUrl);
              }
            }
          ],
          {
            onDismiss: () => {
              openLink(combinedUrl);
            }
          }
        );
      } else {
        openLink(combinedUrl);
      }
    },
    [streetData]
  );

  return {
    triggerExport
  };
};
