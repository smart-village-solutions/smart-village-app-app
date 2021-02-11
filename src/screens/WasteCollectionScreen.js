import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import { Calendar } from 'react-native-calendars';
import { ScrollView, TouchableOpacity } from 'react-native';

import {
  Icon,
  RegularText,
  SafeAreaViewFlex,
  WrapperWithOrientation,
  WasteCalendarLegend,
  Button,
  Wrapper
} from '../components';
import { colors, device, normalize, texts } from '../config';
import { arrowLeft, arrowRight } from '../icons';
import { useQuery } from 'react-apollo';
import { getQuery, QUERY_TYPES } from '../queries';
import { useRefreshTime } from '../hooks';
import { graphqlFetchPolicy } from '../helpers';
import { NetworkContext } from '../NetworkProvider';

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

const renderArrow = (direction) =>
  direction === 'right' ? (
    <Icon xml={arrowRight(colors.primary)} style={styles.icon} />
  ) : (
    <Icon xml={arrowLeft(colors.primary)} style={styles.icon} />
  );

// show streets that contain the string in it
// return empty list on an exact match (except for capitalization)
const filterStreets = (currentInputValue, streetData) => {
  if (currentInputValue === '') return [];

  return streetData
    .filter((street) =>
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
  const typesRefreshTime = useRefreshTime('waste-types');
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

  const typesFetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime: typesRefreshTime
  });

  const { data, loading } = useQuery(getQuery(QUERY_TYPES.WASTE_ADDRESSES), {
    fetchPolicy: addressesFetchPolicy,
    skip: !addressesRefreshTime
  });

  const { data: typesData, loading: typesLoading } = useQuery(
    getQuery(QUERY_TYPES.PUBLIC_JSON_FILE),
    {
      variables: { name: 'wasteTypes' },
      fetchPolicy: typesFetchPolicy,
      skip: !typesRefreshTime
    }
  );

  // only query if we have a street selected
  const { data: streetData } = useQuery(getQuery(QUERY_TYPES.WASTE_STREET), {
    variables: { ids: selectedStreetId },
    fetchPolicy: streetFetchPolicy,
    skip: !streetRefreshTime || !selectedStreetId
  });

  const addressesData = data?.wasteAddresses;

  let parsedTypesData;
  try {
    if (typesData?.publicJsonFile?.content) {
      parsedTypesData = JSON.parse(typesData.publicJsonFile.content);
    }
  } catch (error) {
    console.warn(error, data);
  }

  let usedTypes = {};
  streetData?.[QUERY_TYPES.WASTE_ADDRESSES]?.[0]?.wasteLocationTypes?.forEach(
    (wasteLocationType) => {
      if (parsedTypesData?.[wasteLocationType.wasteType])
        usedTypes[wasteLocationType.wasteType] = parsedTypesData?.[wasteLocationType.wasteType];
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
        <RegularText>{getStreetString(item)}</RegularText>
      </TouchableOpacity>
    ),
    [setInputValue]
  );

  const goToReminder = useCallback(
    () => navigation.navigate('WasteReminder', { wasteTypes: usedTypes, streetData }),
    [navigation, usedTypes, streetData]
  );

  useEffect(() => {
    if (!addressesData) {
      return;
    }

    const item = addressesData.find(
      (street) => getStreetString(street).toLowerCase() === inputValue.toLowerCase()
    );

    setSelectedStreetId(item?.id);
  }, [inputValue, setSelectedStreetId, addressesData]);

  // TODO: loading logic
  if (loading || !data)
    return (
      <RegularText>
        {JSON.stringify({
          loading,
          data: !!data,
          typesLoading,
          typesData: !!typesData,
          typesRefreshTime
        })}
      </RegularText>
    );

  const filteredStreets = filterStreets(inputValue, addressesData);

  return (
    <SafeAreaViewFlex>
      <ScrollView keyboardShouldPersistTaps="always">
        <WrapperWithOrientation>
          <Autocomplete
            containerStyle={styles.autoCompleteContainer}
            data={filteredStreets}
            defaultValue={inputValue}
            onChangeText={(text) => setInputValue(text)}
            placeholder="Straße"
            renderItem={renderSuggestion}
          />
          <View style={styles.topMarginContainer}>
            <Calendar
              markedDates={getMarkedDates(parsedTypesData, streetData)}
              markingType="multi-dot"
              renderArrow={renderArrow}
              theme={{ todayTextColor: colors.primary }}
            />
            <WasteCalendarLegend data={usedTypes} />
          </View>
          {!!data && selectedStreetId && (
            <Wrapper>
              <Button title={texts.wasteCalendar.configureReminder} onPress={goToReminder} />
            </Wrapper>
          )}
        </WrapperWithOrientation>
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
  icon: {
    paddingHorizontal: normalize(14)
  },
  topMarginContainer:
    device.platform === 'android'
      ? {
          marginTop: 40
        }
      : {}
});

WasteCollectionScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Zurück Taste"
          accessibilityHint="Navigieren zurück zur vorherigen Seite"
        >
          <Icon xml={arrowLeft(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  };
};

WasteCollectionScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
