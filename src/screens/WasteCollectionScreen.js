import { useFocusEffect } from '@react-navigation/native';
import _sortBy from 'lodash/sortBy';
import _isArray from 'lodash/isArray';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { Overlay } from 'react-native-elements';

import {
  BoldText,
  Button,
  DefaultKeyboardAvoidingView,
  DrawerHeader,
  HeaderLeft,
  LoadingSpinner,
  RegularText,
  renderArrow,
  SafeAreaViewFlex,
  WasteCalendarLegend,
  WasteHeader,
  WasteInputForm,
  WasteList,
  Wrapper,
  WrapperRow
} from '../components';
import { DayComponent } from '../components/DayComponent';
import { FeedbackFooter } from '../components/FeedbackFooter';
import { colors, consts, device, Icon, normalize, texts } from '../config';
import { momentFormat, parseListItemsFromQuery } from '../helpers';
import { setupLocales } from '../helpers/calendarHelper';
import {
  useKeyboardHeight,
  useRenderSuggestions,
  useStreetString,
  useWasteAddresses,
  useWasteMarkedDates,
  useWasteStreet,
  useWasteTypes,
  useWasteUsedTypes
} from '../hooks';
import { OrientationContext } from '../OrientationProvider';
import { QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';

setupLocales();

const { CALENDAR } = consts;
const { DOT_SIZE } = CALENDAR;

export const today = moment().format('YYYY-MM-DD');

export const getLocationData = (streetData) => {
  if (!streetData) return;

  return {
    city: streetData?.wasteAddresses?.[0]?.city,
    street: streetData?.wasteAddresses?.[0]?.street,
    zip: streetData?.wasteAddresses?.[0]?.zip
  };
};

/**
 * WasteCollectionScreen component handles the waste collection screen functionality.
 * It manages the state and logic for displaying waste collection information, including
 * waste addresses, types, and calendar events. It also provides navigation to the waste
 * reminder screen and handles user interactions for selecting city and street inputs.
 */
/* eslint-disable complexity */
export const WasteCollectionScreen = ({ navigation }) => {
  const { dimensions } = useContext(OrientationContext);
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType, settings = {}, waste = {} } = globalSettings;
  const { wasteAddresses = {} } = settings;
  const {
    hasCalendar = true,
    hasHeaderSearchBarOption = false,
    minSearchLength = 5,
    texts: wasteAddressesTexts = {},
    twoStep: hasWasteAddressesTwoStep = false
  } = wasteAddresses;
  const {
    inputValue,
    setInputValue,
    inputValueCity,
    setInputValueCity,
    inputValueCitySelected,
    setInputValueCitySelected,
    renderSuggestionCities,
    renderSuggestion
  } = useRenderSuggestions();
  const wasteTexts = { ...texts.wasteCalendar, ...wasteAddressesTexts };
  const [isRehydrating, setIsRehydrating] = useState(false);
  const [isCityInputFocused, setIsCityInputFocused] = useState(false);
  const [isStreetInputFocused, setIsStreetInputFocused] = useState(false);
  const [selectedStreetId, setSelectedStreetId] = useState(waste.streetId);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isDayOverlayVisible, setIsDayOverlayVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const { data } = useWasteAddresses({ minSearchLength, search: inputValue || inputValueCity });
  const addressesData = data?.wasteAddresses;
  const { data: typesData, loading: typesLoading } = useWasteTypes();
  const { data: streetData } = useWasteStreet({ selectedStreetId });
  const locationData = getLocationData(streetData);
  const usedTypes = useWasteUsedTypes({ streetData, typesData });
  const [selectedTypes, setSelectedTypes] = useState();
  const { getStreetString } = useStreetString();
  const markedDates = useWasteMarkedDates({
    streetData,
    selectedTypes: selectedTypes || typesData
  });
  const keyboardHeight = useKeyboardHeight();
  const [isReset, setIsReset] = useState(false);
  const query = QUERY_TYPES.WASTE_STREET;

  const listItems = useMemo(() => {
    if (!markedDates || !selectedTypes) return;

    const parsedListItem = parseListItemsFromQuery(query, markedDates);

    // sort by listDate and filter out all entries in the past and that have no dots
    return _sortBy(parsedListItem, 'listDate').filter((item) => {
      if (!item.dots?.length) return false;

      const dotsColors = item.dots.map((dot) => dot.color);
      const hasMatchesForItem = Object.keys(selectedTypes).some(
        (typeKey) => selectedTypes[typeKey] && dotsColors?.includes(selectedTypes[typeKey].color)
      );

      return item.listDate >= today && hasMatchesForItem;
    });
  }, [markedDates, selectedTypes]);

  // Monitors changes to `addressesData` and `inputValueCity` when the two-step
  // address selection (`hasWasteAddressesTwoStep`) is enabled. If only one city matches the input,
  // it automatically sets the corresponding street value in the input field. This improves
  // usability by reducing the need for additional user input when there is only one option.
  useEffect(() => {
    if (hasWasteAddressesTwoStep && addressesData?.length && inputValueCity) {
      const cityData = addressesData?.filter(
        (address) => address.city?.toLowerCase() === inputValueCity.toLowerCase()
      );

      if (cityData?.length == 1) {
        setInputValue(getStreetString(cityData[0]));
      }
    }
  }, [addressesData, inputValueCity]);

  useEffect(() => {
    if (
      !!selectedStreetId &&
      _isArray(streetData?.wasteAddresses) &&
      !streetData.wasteAddresses.length
    ) {
      resetSelectedStreetId();
    }
  }, [streetData?.wasteAddresses, selectedStreetId]);

  // Checks whether the user has completed the city and street input.
  // If the input is incomplete, it resets the `selectedStreetId` to allow the user to start over.
  // Otherwise, it searches for a matching address in `addressesData` based on the input values.
  // If a match is found, it navigates to the waste settings screen with the selected street id.
  useEffect(() => {
    if (
      !addressesData ||
      (!hasHeaderSearchBarOption &&
        !waste.streetId &&
        (!inputValue || (hasWasteAddressesTwoStep && !inputValueCity)))
    ) {
      setSelectedStreetId(undefined);
      return;
    }

    const item = addressesData.find((address) => {
      if (hasWasteAddressesTwoStep) {
        return (
          address.city === inputValueCity &&
          getStreetString(address).toLowerCase() === inputValue.toLowerCase()
        );
      }

      return getStreetString(address).toLowerCase() === inputValue.toLowerCase();
    });

    if (item?.id) {
      setSelectedStreetId(waste.streetId);
      setIsReset(false);
      navigation.navigate(ScreenName.WasteCollectionSettings, { currentSelectedStreetId: item.id });
    }
  }, [addressesData, inputValue, inputValueCity, waste.streetId, getStreetString]);

  // Initializes the `selectedTypes` state based on the available waste types (`usedTypes`)
  // and the user's previously selected type keys (`waste.selectedTypeKeys`).
  // If `selectedTypeKeys` is present, it maps the keys to the corresponding values in `usedTypes`.
  // Otherwise, it defaults to selecting all available types.
  // The effect triggers whenever `usedTypes` or `waste.selectedTypeKeys` change.
  useEffect(() => {
    if (!usedTypes) return;

    setSelectedTypes(
      Object.fromEntries(
        (waste.selectedTypeKeys?.length ? waste.selectedTypeKeys : Object.keys(usedTypes)).map(
          (typeKey) => [typeKey, usedTypes[typeKey]]
        )
      )
    );
  }, [usedTypes, waste.selectedTypeKeys]);

  // Ensures that when the screen comes into focus, the state is properly reset and rehydrated.
  // If a street id already exists in the waste settings, it is used to set the `selectedStreetId`
  // state. The `isRehydrating` flag prevents unnecessary UI updates during this process.
  useFocusEffect(
    useCallback(() => {
      setIsRehydrating(true);
      !!waste.streetId && setSelectedStreetId(waste.streetId);
      setIsRehydrating(false);
    }, [waste.streetId])
  );

  const goToReminder = useCallback(
    () =>
      navigation.navigate(ScreenName.WasteCollectionSettings, {
        currentSelectedStreetId: selectedStreetId
      }),
    [navigation, selectedStreetId]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        !!streetData && !!usedTypes ? (
          <WrapperRow itemsCenter>
            <HeaderLeft
              onPress={goToReminder}
              backImage={({ tintColor }) => (
                <Icon.EditSetting
                  color={tintColor}
                  style={[styles.icon, !hasCalendar && styles.noPaddingRight]}
                />
              )}
            />

            {hasCalendar && (
              <HeaderLeft
                onPress={() => setShowCalendar(!showCalendar)}
                backImage={({ tintColor }) =>
                  showCalendar ? (
                    <Icon.List color={tintColor} style={[styles.icon, styles.noPaddingRight]} />
                  ) : (
                    <Icon.Calendar color={tintColor} style={[styles.icon, styles.noPaddingRight]} />
                  )
                }
              />
            )}

            {navigationType === 'drawer' && (
              <DrawerHeader navigation={navigation} style={styles.icon} />
            )}
          </WrapperRow>
        ) : navigationType === 'drawer' ? (
          <DrawerHeader navigation={navigation} style={styles.icon} />
        ) : null
    });

    if (isReset) {
      navigation.setOptions({
        headerLeft: () => (
          <HeaderLeft
            onPress={() => {
              setSelectedStreetId(waste.streetId);
              setIsReset(false);
            }}
            backImage={({ tintColor }) => (
              <Icon.Close
                color={tintColor}
                size={normalize(22)}
                style={{ paddingHorizontal: normalize(14) }}
              />
            )}
          />
        )
      });
    } else {
      navigation.setOptions({
        headerLeft: () => <HeaderLeft onPress={navigation.goBack} />
      });
    }
  }, [goToReminder, showCalendar, streetData, usedTypes, isReset, waste.streetId]);

  const resetSelectedStreetId = useCallback(async () => {
    setSelectedStreetId(undefined);
    setInputValue('');
    setInputValueCity('');
    setInputValueCitySelected(false);
    setIsReset(true);
  }, []);

  const wasteHeader = useCallback(() => {
    return <WasteHeader locationData={locationData} onPress={resetSelectedStreetId} />;
  }, [locationData, resetSelectedStreetId]);

  const wasteList = useCallback(() => {
    return (
      <WasteList
        data={selectedStreetId ? listItems : []}
        ListHeaderComponent={wasteHeader()}
        query={query}
        selectedTypes={selectedTypes}
      />
    );
  }, [selectedStreetId, listItems, wasteHeader, query, selectedTypes]);

  const onDayPress = useCallback((day) => {
    setSelectedDay(day.dateString);
    setIsDayOverlayVisible(true);
  }, []);

  if (isRehydrating || typesLoading) {
    return <LoadingSpinner loading />;
  }

  return (
    <SafeAreaViewFlex>
      {!hasHeaderSearchBarOption ? (
        !selectedStreetId ? (
          <DefaultKeyboardAvoidingView>
            <Wrapper>
              <RegularText small>
                {hasWasteAddressesTwoStep ? wasteTexts.hintCityAndStreet : wasteTexts.hintStreet}
              </RegularText>
            </Wrapper>
            <WasteInputForm
              addressesData={addressesData}
              dimensions={dimensions}
              hasWasteAddressesTwoStep={hasWasteAddressesTwoStep}
              inputValue={inputValue}
              inputValueCity={inputValueCity}
              inputValueCitySelected={inputValueCitySelected}
              isCityInputFocused={isCityInputFocused}
              isStreetInputFocused={isStreetInputFocused}
              renderSuggestion={renderSuggestion}
              renderSuggestionCities={renderSuggestionCities}
              setInputValue={setInputValue}
              setInputValueCity={setInputValueCity}
              setInputValueCitySelected={setInputValueCitySelected}
              setIsCityInputFocused={setIsCityInputFocused}
              setIsStreetInputFocused={setIsStreetInputFocused}
              setSelectedStreetId={setSelectedStreetId}
            />
          </DefaultKeyboardAvoidingView>
        ) : showCalendar ? (
          <>
            {wasteHeader()}
            <Wrapper>
              <RegularText small>{wasteTexts.calendarIntro}</RegularText>
            </Wrapper>
            <RNCalendar
              dayComponent={DayComponent}
              firstDay={1}
              markedDates={markedDates}
              markingType="multi-dot"
              onDayPress={onDayPress}
              renderArrow={renderArrow}
              theme={{
                todayTextColor: colors.primary,
                todayBackgroundColor: colors.lighterPrimaryRgba,
                indicatorColor: colors.refreshControl,
                dotStyle: {
                  borderRadius: DOT_SIZE / 2,
                  height: DOT_SIZE,
                  marginBottom: normalize(8),
                  marginTop: normalize(8),
                  width: DOT_SIZE
                }
              }}
            />
            <Overlay
              animationType="fade"
              isVisible={isDayOverlayVisible}
              onBackdropPress={() => setIsDayOverlayVisible(false)}
              windowBackgroundColor={colors.overlayRgba}
              overlayStyle={[styles.overlay, styles.overlayWidth]}
              supportedOrientations={['portrait', 'landscape']}
            >
              {!!selectedDay && (
                <WrapperRow spaceBetween>
                  <BoldText>{momentFormat(selectedDay, 'dddd, DD.MM.YYYY')}</BoldText>

                  <TouchableOpacity
                    onPress={() => setIsDayOverlayVisible(false)}
                    style={styles.overlayCloseButton}
                  >
                    <Icon.Close size={normalize(20)} color={colors.darkText} />
                  </TouchableOpacity>
                </WrapperRow>
              )}

              {!!usedTypes && (
                <WasteCalendarLegend data={usedTypes} dots={markedDates?.[selectedDay]?.dots} />
              )}

              <Button title={texts.close} onPress={() => setIsDayOverlayVisible(false)} />
            </Overlay>
            <FeedbackFooter containerStyle={styles.feedbackContainer} />
          </>
        ) : selectedTypes ? (
          wasteList()
        ) : null
      ) : selectedTypes && !showCalendar ? (
        wasteList()
      ) : null}
      {!selectedStreetId &&
        (device.platform === 'ios' || (device.platform === 'android' && !keyboardHeight)) && (
          <FeedbackFooter containerStyle={styles.feedbackContainer} />
        )}
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  feedbackContainer: {
    justifyContent: 'flex-end',
    marginTop: normalize(10)
  },
  icon: {
    paddingHorizontal: normalize(10)
  },
  overlay: {
    borderRadius: normalize(8),
    padding: normalize(30),
    paddingBottom: normalize(9)
  },
  overlayWidth: {
    width: '80%'
  }
});

WasteCollectionScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
