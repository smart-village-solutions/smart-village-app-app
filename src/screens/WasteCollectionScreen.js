import _sortBy from 'lodash/sortBy';
import _uniqBy from 'lodash/uniqBy';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
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
import { Calendar } from 'react-native-calendars';

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
import { colors, device, namespace, normalize, secrets, staticRestSuffix, texts } from '../config';
import { graphqlFetchPolicy, openLink } from '../helpers';
import { setupLocales } from '../helpers/calendarHelper';
import { useRefreshTime, useStaticContent } from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { getInAppPermission, showPermissionRequiredAlert } from '../pushNotifications';
import { getQuery, QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';

const dotSize = 6;

setupLocales();

const getMarkedDates = (types, streetData) => {
  let markedDates = {};

  const wasteLocationTypes = streetData?.[QUERY_TYPES.WASTE_ADDRESSES]?.[0]?.wasteLocationTypes;

  if (wasteLocationTypes && types) {
    wasteLocationTypes.forEach((wasteLocationType) => {
      // only add marked dates for known types
      if (!types[wasteLocationType.wasteType]) {
        return;
      }

      const { color, selected_color: selectedColor } = types[wasteLocationType.wasteType];
      wasteLocationType?.listPickUpDates?.forEach((date) => {
        markedDates[date] = {
          dots: [...(markedDates[date]?.dots ?? []), { color, selectedColor }]
        };
      });
    });
  }

  const today = moment().format('YYYY-MM-DD');

  // highlight today
  markedDates[today] = {
    ...(markedDates[today] ?? {}),
    selected: true,
    selectedColor: colors.lighterPrimary
  };

  return markedDates;
};

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
  const { globalSettings } = useContext(SettingsContext);
  const [inputValueCity, setInputValueCity] = useState('');
  const [inputValueCitySelected, setInputValueCitySelected] = useState(false);
  const [inputValue, setInputValue] = useState('');
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

  const wasteAddressesStreetCount = globalSettings?.settings?.wasteAddresses?.streetCount || 5;
  const wasteAddressesTwoStep = !!globalSettings?.settings?.wasteAddresses?.twoStep;

  const getStreetString = useCallback(
    (address) => {
      if (wasteAddressesTwoStep) {
        return address.street || '';
      }

      return `${address.street} (${address.zip} ${address.city})`;
    },
    [wasteAddressesTwoStep]
  );

  // show cities that contain the string in it
  // return empty list on an exact match (except for capitalization)
  const filterCities = useCallback(
    (currentInputValue, addressesData) => {
      if (currentInputValue === '') return [];

      const cities = addressesData?.filter(
        (address) =>
          address.city !== currentInputValue &&
          address.city?.toLowerCase().includes(currentInputValue.toLowerCase())
      );

      return _sortBy(_uniqBy(cities, 'city'), 'city');
    },
    [getStreetString]
  );

  // show streets that contain the string in it
  // consider the city if it is set because of the two step process
  // return empty list on an exact match (except for capitalization)
  const filterStreets = useCallback(
    (currentInputValue, addressesData) => {
      if (wasteAddressesTwoStep && inputValueCity === '') return [];
      if (currentInputValue === '') return [];

      const streets = addressesData
        ?.filter((address) => {
          const street = getStreetString(address);

          return (
            street !== currentInputValue &&
            street?.toLowerCase().includes(currentInputValue.toLowerCase())
          );
        })
        ?.filter((address) => (wasteAddressesTwoStep ? address.city === inputValueCity : true));

      return _sortBy(streets, 'street').slice(0, wasteAddressesStreetCount);
    },
    [getStreetString, inputValueCity]
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
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const filteredCities = wasteAddressesTwoStep ? filterCities(inputValueCity, addressesData) : [];
  const filteredStreets = filterStreets(inputValue, addressesData, inputValueCity);

  return (
    <SafeAreaViewFlex>
      <ScrollView keyboardShouldPersistTaps="handled">
        {wasteAddressesTwoStep && (
          <Autocomplete
            containerStyle={styles.autoCompleteContainer}
            data={filteredCities}
            disableFullscreenUI
            flatListProps={{
              renderItem: inputValueCitySelected ? null : renderSuggestionCities
            }}
            listStyle={styles.autoCompleteList}
            onChangeText={(text) => {
              setInputValueCitySelected(false);
              setSelectedStreetId(undefined);
              setInputValueCity(text);
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
              renderItem: renderSuggestion
            }}
            listStyle={styles.autoCompleteList}
            onChangeText={(text) => setInputValue(text)}
            placeholder="Straße"
            style={styles.autoCompleteInput}
            value={inputValue}
          />
        )}
        {selectedStreetId && (
          <Calendar
            dayComponent={NoTouchDay}
            markedDates={getMarkedDates(typesData, streetData)}
            markingType="multi-dot"
            renderArrow={renderArrow}
            theme={{
              todayTextColor: colors.primary,
              dotStyle: {
                borderRadius: dotSize / 2,
                height: dotSize,
                width: dotSize
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
  autoCompleteInputContainer: {
    borderRadius: 0,
    borderWidth: 0
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
  noBorderBottom: {
    borderBottomWidth: 0
  },
  noBorderTop: {
    borderTopWidth: 0,
    marginTop: normalize(-1)
  }
});

WasteCollectionScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
