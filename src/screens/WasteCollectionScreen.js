import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
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

const streets = ['AdamStreet', 'EveStreet'];

const data = {
  paper: {
    dates: ['2021-01-24', '2021-01-14', '2021-01-19'],
    dot: { key: 'paper', color: 'blue', selectedColor: 'blue' },
    name: 'Papier'
  },
  recyclable: {
    dates: ['2021-01-24', '2021-01-20'],
    dot: { key: 'recyclable', color: 'yellow', selectedColor: 'yellow' },
    name: 'Gelbe Tonne'
  },
  residual: {
    dates: ['2021-01-24', '2021-01-20', '2021-01-03'],
    dot: { key: 'residual', color: 'black', selectedColor: 'black' },
    name: 'Restmüll'
  }
};

const getMarkedDates = () => {
  let markedDates = {};
  Object.keys(data).forEach((key) =>
    data[key]?.dates?.map((date) => {
      markedDates[date] = { dots: [...(markedDates[date]?.dots ?? []), data[key]?.dot] };
    })
  );

  const today = moment().format('YYYY-MM-DD');

  markedDates[today] = {
    ...markedDates[today],
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

const filterStreets = (currentInputValue) => {
  if (currentInputValue === '') return [];

  const regex = new RegExp(`${currentInputValue.trim()}`, 'i');

  return streets
    .filter((street) => street.search(regex) >= 0)
    .filter((street) => street !== currentInputValue);
};

export const WasteCollectionScreen = ({ navigation }) => {
  const [inputValue, setInputValue] = useState('');

  const renderSuggestion = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() => {
          setInputValue(item);
          Keyboard.dismiss();
        }}
      >
        <RegularText>{item}</RegularText>
      </TouchableOpacity>
    ),
    [setInputValue]
  );

  const goToReminder = useCallback(() => navigation.navigate('WasteReminder', { data }), [
    data,
    navigation
  ]);

  const filteredStreets = filterStreets(inputValue);

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
              markedDates={getMarkedDates()}
              markingType="multi-dot"
              renderArrow={renderArrow}
              theme={{ todayTextColor: colors.primary }}
            />
            <WasteCalendarLegend data={data} />
          </View>
          <Wrapper>
            <Button title={texts.wasteCalendar.configureReminder} onPress={goToReminder} />
          </Wrapper>
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
