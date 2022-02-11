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
  TouchableOpacity,
  View
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
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { FeedbackFooter } from '../components/FeedbackFooter';
import { colors, device, namespace, normalize, secrets, staticRestSuffix, texts } from '../config';
import { graphqlFetchPolicy, openLink, setupLocales } from '../helpers';
import { useRefreshTime, useStaticContent } from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { getInAppPermission, showPermissionRequiredAlert } from '../pushNotifications';
import { getQuery, QUERY_TYPES } from '../queries';

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

// show streets that contain the string in it
// return empty list on an exact match (except for capitalization)
const filterStreets = (currentInputValue, streetData) => {
  if (currentInputValue === '') return [];

  return streetData
    ?.filter((street) =>
      getStreetString(street).toLowerCase().includes(currentInputValue.toLowerCase())
    )
    .filter((street) => getStreetString(street) !== currentInputValue)
    .slice(0, 5);
};

const getStreetString = (item) => {
  return `${item.street} (${item.zip} ${item.city})`;
};

export const WasteCollectionScreen = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
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

    const params = `street=${encodeURIComponent(street)}&zip=${encodeURIComponent(
      zip
    )}&city=${encodeURIComponent(city)}`;

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
    if (!addressesData) {
      return;
    }

    const item = addressesData.find(
      (street) => getStreetString(street).toLowerCase() === inputValue.toLowerCase()
    );

    setSelectedStreetId(item?.id);
  }, [addressesData, inputValue, setSelectedStreetId]);

  if (loading || typesLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const filteredStreets = filterStreets(inputValue, addressesData);

  return (
    <SafeAreaViewFlex>
      <ScrollView keyboardShouldPersistTaps="handled">
        <WrapperWithOrientation>
          <Autocomplete
            containerStyle={styles.autoCompleteContainer}
            data={filteredStreets}
            defaultValue={inputValue}
            disableFullscreenUI
            onChangeText={(text) => setInputValue(text)}
            placeholder="Straße"
            renderItem={renderSuggestion}
            style={styles.autoCompleteInput}
            listStyle={styles.autoCompleteList}
          />
          <View style={styles.topMarginContainer}>
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
            <WasteCalendarLegend data={usedTypes} />
          </View>
          {!selectedStreetId && (
            <Wrapper>
              <RegularText center>{texts.wasteCalendar.hint}</RegularText>
            </Wrapper>
          )}
          {!!streetData && !!usedTypes && (
            <Wrapper>
              <Button title={texts.wasteCalendar.configureReminder} onPress={goToReminder} />
              <Button title={texts.wasteCalendar.exportCalendar} onPress={triggerExport} />
            </Wrapper>
          )}
        </WrapperWithOrientation>
        <FeedbackFooter />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  autoCompleteContainer:
    device.platform === 'android'
      ? {
          alignSelf: 'center',
          flex: 1,
          position: 'absolute',
          top: 0,
          width: '100%',
          zIndex: 1
        }
      : {},
  autoCompleteInput: {
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(16),
    padding: normalize(8)
  },
  autoCompleteList: {
    margin: 0
  },
  topMarginContainer:
    device.platform === 'android'
      ? {
          marginTop: normalize(44)
        }
      : {}
});

WasteCollectionScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
