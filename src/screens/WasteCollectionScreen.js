import _sortBy from 'lodash/sortBy';
import _uniqBy from 'lodash/uniqBy';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-apollo';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import { Calendar as RNCalendar } from 'react-native-calendars';

import {
  Button,
  LoadingContainer,
  NoTouchDay,
  RegularText,
  renderArrow,
  SafeAreaViewFlex,
  WasteCalendarLegend,
  Wrapper
} from '../components';
import { FeedbackFooter } from '../components/FeedbackFooter';
import {
  colors,
  consts,
  device,
  namespace,
  normalize,
  secrets,
  staticRestSuffix,
  texts
} from '../config';
import { graphqlFetchPolicy, openLink } from '../helpers';
import { setupLocales } from '../helpers/calendarHelper';
import { useRefreshTime, useStaticContent } from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { OrientationContext } from '../OrientationProvider';
import { getInAppPermission, showPermissionRequiredAlert } from '../pushNotifications';
import { getQuery, QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';

setupLocales();

const { CALENDAR } = consts;
const { DOT_SIZE } = CALENDAR;

const today = moment().format('YYYY-MM-DD');

const getLocationData = (streetData) => {
  return {
    city: streetData?.wasteAddresses?.[0]?.city,
    street: streetData?.wasteAddresses?.[0]?.street,
    zip: streetData?.wasteAddresses?.[0]?.zip
  };
};

// eslint-disable-next-line complexity
export const WasteCollectionScreen = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { dimensions } = useContext(OrientationContext);
  const { globalSettings } = useContext(SettingsContext);
  const [inputValueCity, setInputValueCity] = useState('');
  const [inputValueCitySelected, setInputValueCitySelected] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isCityInputFocused, setIsCityInputFocused] = useState(false);
  const [isStreetInputFocused, setIsStreetInputFocused] = useState(false);
  const [selectedStreetId, setSelectedStreetId] = useState();

  const addressesRefreshTime = useRefreshTime('waste-addresses');
  const streetRefreshTime = useRefreshTime(`waste-${selectedStreetId}`);

  const addressesFetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime: addressesRefreshTime
  });

  const streetFetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime: streetRefreshTime
  });

  const { data, loading } = useQuery(getQuery(QUERY_TYPES.WASTE_ADDRESSES), {
    fetchPolicy: addressesFetchPolicy,
    skip: !addressesRefreshTime
  });

  const { data: typesData, loading: typesLoading } = useStaticContent({
    refreshTimeKey: 'waste-types',
    name: 'wasteTypes',
    type: 'json'
  });

  // only query if we have a street selected
  const { data: streetData } = useQuery(getQuery(QUERY_TYPES.WASTE_STREET), {
    variables: { ids: selectedStreetId },
    fetchPolicy: streetFetchPolicy,
    skip: !streetRefreshTime || !selectedStreetId
  });

  const addressesData = data?.wasteAddresses;

  let usedTypes = {};
  streetData?.[QUERY_TYPES.WASTE_ADDRESSES]?.[0]?.wasteLocationTypes?.forEach(
    (wasteLocationType) => {
      if (typesData?.[wasteLocationType.wasteType])
        usedTypes[wasteLocationType.wasteType] = typesData?.[wasteLocationType.wasteType];
    }
  );

  const isInputAutoFocus = globalSettings?.settings?.wasteAddresses?.isInputAutoFocus;
  const wasteAddressesStreetCount = globalSettings?.settings?.wasteAddresses?.streetCount || 5;
  const wasteAddressesTwoStep = !!globalSettings?.settings?.wasteAddresses?.twoStep;

  const getStreetString = useCallback(
    (address) => {
      if (wasteAddressesTwoStep) {
        return address.street || '';
      }

      return `${address.street} (${[address.zip, address.city].filter(Boolean).join(' ')})`;
    },
    [wasteAddressesTwoStep]
  );

  // show cities that contain the string in it
  // return empty list on an exact match (except for capitalization)
  const filterCities = useCallback(
    (currentInputValue, addressesData) => {
      if (isInputAutoFocus && currentInputValue === '' && !isCityInputFocused) return [];

      const cities = addressesData?.filter(
        (address) =>
          address.city !== currentInputValue &&
          address.city?.toLowerCase().includes(currentInputValue.toLowerCase())
      );

      return _sortBy(_uniqBy(cities, 'city'), 'city');
    },
    [getStreetString, isCityInputFocused]
  );

  // show streets that contain the string in it
  // consider the city if it is set because of the two step process
  // return empty list on an exact match (except for capitalization)
  const filterStreets = useCallback(
    (currentInputValue, addressesData) => {
      if (wasteAddressesTwoStep && inputValueCity === '') return [];
      if (isInputAutoFocus && currentInputValue === '' && !isStreetInputFocused) return [];

      const streets = addressesData
        ?.filter((address) => {
          const street = getStreetString(address);

          return (
            street !== currentInputValue &&
            street?.toLowerCase().includes(currentInputValue.toLowerCase())
          );
        })
        ?.filter((address) => (wasteAddressesTwoStep ? address.city === inputValueCity : true));

      const sortedStreets = _sortBy(streets, 'street');

      if (isInputAutoFocus) {
        return sortedStreets;
      }

      return sortedStreets.slice(0, wasteAddressesStreetCount);
    },
    [getStreetString, inputValueCity, isStreetInputFocused]
  );

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
          <RegularText>{item.city}</RegularText>
        </Wrapper>
      </TouchableOpacity>
    ),
    [setInputValueCity]
  );

  const renderSuggestion = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() => {
          setInputValue(getStreetString(item));
          Keyboard.dismiss();
        }}
      >
        <Wrapper>
          <RegularText>{getStreetString(item)}</RegularText>
        </Wrapper>
      </TouchableOpacity>
    ),
    [setInputValue]
  );

  const triggerExport = useCallback(() => {
    const { street, zip, city } = getLocationData(streetData);

    const baseUrl = secrets[namespace].serverUrl + staticRestSuffix.wasteCalendarExport;

    let params = `street=${encodeURIComponent(street)}`;

    if (zip) {
      params += `&zip=${encodeURIComponent(zip)}`;
    }

    if (city) {
      params += `&city=${encodeURIComponent(city)}`;
    }

    const combinedUrl = baseUrl + params;

    if (device.platform === 'android') {
      Alert.alert(
        texts.wasteCalendar.exportAlertTitle,
        texts.wasteCalendar.exportAlertBody,
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
  }, [isMainserverUp, streetData]);

  const goToReminder = useCallback(async () => {
    const locationData = getLocationData(streetData);

    const navigate = () =>
      navigation.navigate('WasteReminder', { wasteTypes: usedTypes, locationData });

    const inAppPushPermission = await getInAppPermission();

    if (inAppPushPermission) {
      navigate();
    } else {
      showPermissionRequiredAlert(navigate);
    }
  }, [navigation, usedTypes, streetData]);

  const markedDates = useMemo(() => {
    let dates = {};
    const wasteLocationTypes = streetData?.[QUERY_TYPES.WASTE_ADDRESSES]?.[0]?.wasteLocationTypes;

    if (wasteLocationTypes && typesData) {
      wasteLocationTypes.forEach((wasteLocationType) => {
        // only add marked dates for known types
        if (!typesData[wasteLocationType.wasteType]) {
          return;
        }

        const { color, selected_color: selectedColor } = typesData[wasteLocationType.wasteType];
        wasteLocationType?.listPickUpDates?.forEach((date) => {
          dates[date] = {
            dots: [...(dates[date]?.dots ?? []), { color, selectedColor }]
          };
        });
      });
    }

    // highlight today
    dates[today] = {
      ...(dates[today] ?? {}),
      selected: true,
      selectedColor: colors.lighterPrimary
    };

    return dates;
  }, [streetData, typesData, today]);

  useEffect(() => {
    if (!addressesData || !inputValue || (wasteAddressesTwoStep && !inputValueCity)) {
      setSelectedStreetId(undefined);
      return;
    }

    const item = addressesData.find((address) => {
      if (wasteAddressesTwoStep) {
        return (
          address.city === inputValueCity &&
          getStreetString(address).toLowerCase() === inputValue.toLowerCase()
        );
      }

      return getStreetString(address).toLowerCase() === inputValue.toLowerCase();
    });

    setSelectedStreetId(item?.id);
  }, [addressesData, inputValue, setSelectedStreetId]);

  useEffect(() => {
    if (wasteAddressesTwoStep && addressesData?.length && !!inputValueCity) {
      const cityData = addressesData?.filter(
        (address) => address.city?.toLowerCase() === inputValueCity.toLowerCase()
      );

      if (cityData?.length == 1) {
        setInputValue(getStreetString(cityData[0]));
      }
    }
  }, [addressesData, inputValueCity]);

  if (loading || typesLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  const filteredCities = wasteAddressesTwoStep ? filterCities(inputValueCity, addressesData) : [];
  const filteredStreets = filterStreets(inputValue, addressesData, inputValueCity);
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
    <SafeAreaViewFlex>
      <ScrollView keyboardShouldPersistTaps="handled">
        {wasteAddressesTwoStep && (
          <Autocomplete
            containerStyle={styles.autoCompleteContainer}
            data={filteredCities}
            disableFullscreenUI
            flatListProps={{
              height: inputValueCitySelected ? undefined : dimensions.height - normalize(170),
              keyboardShouldPersistTaps: 'handled',
              renderItem: inputValueCitySelected ? null : renderSuggestionCities
            }}
            hideResults={inputValueCitySelected}
            listStyle={styles.autoCompleteList}
            onChangeText={(text) => {
              setInputValueCitySelected(false);
              setSelectedStreetId(undefined);
              setInputValueCity(text);
            }}
            onFocus={() => {
              setIsCityInputFocused(true);
              setIsStreetInputFocused(false);
            }}
            placeholder="Ortschaft"
            style={styles.autoCompleteInput}
            value={inputValueCity}
          />
        )}
        {(!wasteAddressesTwoStep || (wasteAddressesTwoStep && inputValueCitySelected)) && (
          <Autocomplete
            containerStyle={[
              styles.autoCompleteContainer,
              wasteAddressesTwoStep && styles.noBorderTop
            ]}
            data={filteredStreets}
            disableFullscreenUI
            flatListProps={{
              height: dimensions.height - normalize(220),
              keyboardShouldPersistTaps: 'handled',
              renderItem: renderSuggestion
            }}
            hideResults={isStreetResultsHidden}
            listStyle={styles.autoCompleteList}
            onChangeText={(text) => setInputValue(text)}
            onBlur={() => setIsStreetInputFocused(false)}
            onFocus={() => setIsStreetInputFocused(true)}
            placeholder="Straße"
            style={styles.autoCompleteInput}
            value={inputValue}
          />
        )}
        {selectedStreetId && (
          <RNCalendar
            dayComponent={NoTouchDay}
            markedDates={markedDates}
            markingType="multi-dot"
            renderArrow={renderArrow}
            firstDay={1}
            theme={{
              todayTextColor: colors.primary,
              dotStyle: {
                borderRadius: DOT_SIZE / 2,
                height: DOT_SIZE,
                width: DOT_SIZE
              }
            }}
          />
        )}
        <WasteCalendarLegend data={usedTypes} />
        {!selectedStreetId && (
          <Wrapper>
            <RegularText center>
              {wasteAddressesTwoStep
                ? texts.wasteCalendar.hintCityAndStreet
                : texts.wasteCalendar.hintStreet}
            </RegularText>
          </Wrapper>
        )}
        {!!streetData && !!usedTypes && (
          <Wrapper>
            <Button title={texts.wasteCalendar.configureReminder} onPress={goToReminder} />
            <Button title={texts.wasteCalendar.exportCalendar} onPress={triggerExport} />
          </Wrapper>
        )}
        <FeedbackFooter />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  autoCompleteContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.shadow,
    borderBottomWidth: 1,
    width: '100%'
  },
  autoCompleteInput: {
    borderColor: colors.shadow,
    borderWidth: 1,
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(16),
    height: normalize(44),
    paddingHorizontal: normalize(10)
  },
  autoCompleteList: {
    margin: 0
  },
  noBorderTop: {
    borderTopWidth: 0,
    marginTop: normalize(-1)
  }
});

WasteCollectionScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
