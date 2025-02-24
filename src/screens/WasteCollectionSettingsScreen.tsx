import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import _isEmpty from 'lodash/isEmpty';
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState
} from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider, ListItem, Tooltip } from 'react-native-elements';

import {
  BoldText,
  Button,
  Dot,
  HeaderLeft,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  Switch,
  Wrapper,
  WrapperHorizontal,
  WrapperRow,
  WrapperVertical
} from '../components';
import {
  colors,
  consts,
  device,
  Icon,
  namespace,
  normalize,
  secrets,
  staticRestSuffix,
  texts
} from '../config';
import { formatTime, openLink, storageHelper } from '../helpers';
import {
  useFilterStreets,
  useRenderSuggestions,
  useStreetString,
  useWasteAddresses,
  useWasteStreet,
  useWasteTypes,
  useWasteUsedTypes
} from '../hooks';
import { areValidReminderSettings } from '../jsonValidation';
import {
  getInAppPermission,
  getReminderSettings,
  showPermissionRequiredAlert,
  updateWasteReminderSettings
} from '../pushNotifications';
import { WasteSettingsActions, wasteSettingsReducer, WasteSettingsState } from '../reducers';
import { getLocationData } from '../screens';
import { SettingsContext } from '../SettingsProvider';
import { WasteReminderSettingJson } from '../types';

const keyExtractor = (item: string, index: number) => `index${index}-${item}`;

const initialWasteSettingsState: WasteSettingsState = {
  activeTypes: {},
  typeSettings: {},
  selectedTypeKeys: [],
  notificationSettings: {},
  showNotificationSettings: false,
  onDayBefore: true,
  reminderTime: new Date('2000-01-01T09:00:00.000+01:00')
};

/* eslint-disable complexity */
export const WasteCollectionSettingsScreen = () => {
  const navigation = useNavigation();
  const routeParams = useRoute().params;
  const { globalSettings, setGlobalSettings } = useContext(SettingsContext);
  const { settings = {}, waste = {} } = globalSettings;
  const { wasteAddresses = {} } = settings;
  const { texts: wasteAddressesTexts = {}, hasExport = true } = wasteAddresses;
  const wasteTexts = { ...texts.wasteCalendar, ...wasteAddressesTexts };
  const [loadedStoredSettingsInitially, setLoadedStoredSettingsInitially] = useState(false);
  const [loadingStoredSettings, setLoadingStoredSettings] = useState(true);
  const [errorWithStoredSettings, setErrorWithStoredSettings] = useState(false);
  const [selectedStreetId, setSelectedStreetId] = useState(routeParams?.currentSelectedStreetId);
  const [isStreetSelected, setIsStreetSelected] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPushPermissionGranted, setIsPushPermissionGranted] = useState(false);
  const [state, dispatch] = useReducer(wasteSettingsReducer, initialWasteSettingsState);
  const {
    activeTypes,
    typeSettings,
    selectedTypeKeys,
    notificationSettings,
    showNotificationSettings,
    onDayBefore,
    reminderTime
  } = state;
  const isInitial = waste.streetId === undefined;
  const { data, loading } = useWasteAddresses();
  const addressesData = data?.wasteAddresses;
  const { data: typesData, loading: typesLoading } = useWasteTypes();
  const { data: streetData, loading: streetLoading } = useWasteStreet({ selectedStreetId });
  const usedTypes = useWasteUsedTypes({ streetData, typesData });
  const usedTypeKeys = usedTypes ? Object.keys(usedTypes) : [];
  const locationData = getLocationData(streetData);
  const { getStreetString } = useStreetString();
  const streetName = locationData ? getStreetString(locationData) : undefined;
  const { inputValue, setInputValue, renderSuggestion } = useRenderSuggestions(() =>
    setIsStreetSelected(true)
  );
  const { filterStreets } = useFilterStreets('', false);
  const tooltipRef = useRef(null);

  const loadStoredSettingsFromServer = useCallback(async () => {
    if (isInitial) return;

    setLoadingStoredSettings(true);

    const storedSettingsOnServer = (await getReminderSettings())?.map(
      (setting: WasteReminderSettingJson) => ({
        ...setting,
        street: getStreetString(setting),
        // Replace null values with empty strings for city and zip in storedSettings to prevent
        // validation issues
        city: setting.city ?? '',
        zip: setting.zip ?? ''
      })
    );

    if (!areValidReminderSettings(storedSettingsOnServer)) {
      setErrorWithStoredSettings(true);
    } else {
      if (waste.streetId !== selectedStreetId) {
        dispatch({ type: WasteSettingsActions.setInitialWasteSettings, payload: usedTypeKeys });
      } else {
        dispatch({
          type: WasteSettingsActions.updateWasteSettings,
          payload: {
            serverSettings: storedSettingsOnServer.filter(
              (item) => item.street === waste.streetName
            ),
            selectedTypeKeys: waste.selectedTypeKeys
          }
        });
      }

      setErrorWithStoredSettings(false);
    }

    setLoadingStoredSettings(false);
  }, [getStreetString, state, streetName, waste, selectedStreetId, selectedTypeKeys]);

  const updateSettings = useCallback(async () => {
    let errorOccurred = false;

    // Process all active waste types
    const resettedActiveTypes: { [key: string]: { active: boolean; storeId?: string | number } } =
      {};
    await Promise.all(
      usedTypeKeys?.map(async (typeKey) => {
        const isActive = !!notificationSettings[typeKey];
        const storeId = activeTypes[typeKey]?.storeId;
        const newIdToStore = (await updateWasteReminderSettings(
          isActive,
          reminderTime,
          typeKey,
          onDayBefore,
          locationData,
          storeId
        )) as string | number | undefined;

        resettedActiveTypes[typeKey] = { active: isActive };

        // Store new id in the state if the type is active
        if (isActive && newIdToStore) {
          resettedActiveTypes[typeKey].storeId = newIdToStore;
        }

        // Track errors
        if (isActive && !newIdToStore) {
          errorOccurred = true;
        }
      })
    );

    // Update stored state with active types for the new location if everything was successful
    if (!errorOccurred) {
      dispatch({
        type: WasteSettingsActions.resetActiveTypes,
        payload: resettedActiveTypes
      });
    } else {
      // Reload stored settings in case of an error to avoid incorrect local state
      loadStoredSettingsFromServer();
    }
  }, [
    usedTypeKeys,
    activeTypes,
    notificationSettings,
    locationData,
    onDayBefore,
    reminderTime,
    loadStoredSettingsFromServer
  ]);

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
  }, [streetData]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />,
      headerRight: () =>
        selectedStreetId ? (
          <HeaderLeft
            onPress={async () => {
              await storageHelper.setGlobalSettings({
                ...globalSettings,
                waste: {
                  ...waste,
                  streetName,
                  streetId: selectedStreetId,
                  selectedTypeKeys
                }
              });
              setGlobalSettings({
                ...globalSettings,
                waste: {
                  ...waste,
                  streetName,
                  streetId: selectedStreetId,
                  selectedTypeKeys
                }
              });

              Object.entries(notificationSettings).forEach(([typeKey, typeValue]) =>
                dispatch({
                  type: WasteSettingsActions.setActiveType,
                  payload: { key: typeKey, value: typeValue }
                })
              );

              await updateSettings();

              navigation.goBack();
            }}
            text={wasteTexts.save}
          />
        ) : null,
      headerSearchBarOptions: {
        placeholder: texts.screenTitles.wasteCollection.select,
        onChangeText: (event) => {
          setIsStreetSelected(false);
          setInputValue(event.nativeEvent.text);
        },
        onBlur: () => setIsStreetSelected(true),
        tintColor: colors.primary
      }
    });
  }, [
    selectedStreetId,
    waste,
    selectedTypeKeys,
    notificationSettings,
    state,
    updateSettings,
    onDayBefore
  ]);

  // Set initial waste types used in the selected street
  useEffect(() => {
    if (usedTypes) {
      dispatch({ type: WasteSettingsActions.setInitialWasteSettings, payload: usedTypeKeys });
    }
  }, [usedTypes]);

  // Use this ref to prevent the useEffect from running multiple times
  const hasStartedLoadingStoredSettingsFromServer = useRef(false);

  useEffect(() => {
    const asyncLoadStoredSettingsFromServer = async () => {
      if (
        !hasStartedLoadingStoredSettingsFromServer.current &&
        !loadedStoredSettingsInitially &&
        !_isEmpty(typeSettings)
      ) {
        hasStartedLoadingStoredSettingsFromServer.current = true;
        await loadStoredSettingsFromServer();
        setLoadedStoredSettingsInitially(true);
      }
    };

    asyncLoadStoredSettingsFromServer();
  }, [typeSettings]);

  const onPressUpdateOnDayBefore = useCallback((value: boolean) => {
    tooltipRef?.current?.toggleTooltip();
    dispatch({ type: WasteSettingsActions.setOnDayBefore, payload: value });
  }, []);

  const onDatePickerChange = useCallback((_, newTime?: Date) => {
    if (!newTime) return;

    newTime.setMilliseconds(0);
    newTime.setSeconds(0);

    if (device.platform === 'android') {
      setShowDatePicker(false);
    }

    dispatch({ type: WasteSettingsActions.setReminderTime, payload: newTime });
  }, []);

  useEffect(() => {
    const getPermission = async () => {
      const inAppPermission = await getInAppPermission();

      setIsPushPermissionGranted(inAppPermission);
    };

    getPermission();
  }, [isPushPermissionGranted, showNotificationSettings]);

  if (loading || typesLoading || streetLoading || !loadedStoredSettingsInitially) {
    return <LoadingSpinner loading />;
  }

  const filteredStreets = filterStreets(inputValue, addressesData);

  if (inputValue && !isStreetSelected) {
    return (
      <SafeAreaViewFlex>
        <FlatList
          data={filteredStreets}
          keyboardShouldPersistTaps="handled"
          renderItem={renderSuggestion}
          contentContainerStyle={styles.resultsList}
        />
      </SafeAreaViewFlex>
    );
  }

  if (selectedStreetId) {
    return (
      <SafeAreaViewFlex>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={loadingStoredSettings}
              onRefresh={() => loadStoredSettingsFromServer()}
              colors={[colors.refreshControl]}
              tintColor={colors.refreshControl}
            />
          }
        >
          {!!locationData && (
            <Wrapper>
              <RegularText>{wasteTexts.myLocation}</RegularText>
              <BoldText>{streetName}</BoldText>
            </Wrapper>
          )}
          {!!usedTypeKeys?.length && !_isEmpty(typeSettings) && (
            <WrapperVertical style={[styles.paddingHorizontal]}>
              <WrapperVertical style={styles.mediumPaddingVertical}>
                <RegularText big>{wasteTexts.chooseCategory}</RegularText>
              </WrapperVertical>
              <FlatList
                data={usedTypeKeys.sort()}
                renderItem={({ item, index }) => {
                  return (
                    <ListItem
                      bottomDivider={index < usedTypeKeys.length - 1}
                      containerStyle={styles.listItemContainer}
                      accessibilityLabel={`(${usedTypes[item].label}) ${consts.a11yLabel.button}`}
                    >
                      <ListItem.Content>
                        <WrapperRow itemsCenter>
                          <Dot color={usedTypes[item].color} />
                          {usedTypes[item].color !== usedTypes[item].selected_color && (
                            <Dot color={usedTypes[item].selected_color} />
                          )}
                          <BoldText small> {usedTypes[item].label}</BoldText>
                        </WrapperRow>
                      </ListItem.Content>

                      <Switch
                        switchValue={typeSettings[item]}
                        toggleSwitch={() => {
                          dispatch({
                            type: WasteSettingsActions.setTypeSetting,
                            payload: { key: item, value: !typeSettings[item] }
                          });
                        }}
                      />
                    </ListItem>
                  );
                }}
                keyExtractor={keyExtractor}
                style={styles.borderRadius}
              />
            </WrapperVertical>
          )}
          <Wrapper style={[styles.noPaddingBottom, styles.paddingHorizontal]}>
            <WrapperVertical style={styles.mediumPaddingVertical}>
              <RegularText big>{wasteTexts.notifications}</RegularText>
            </WrapperVertical>
            <ListItem
              containerStyle={[styles.borderRadius, styles.listItemContainer]}
              accessibilityLabel={`(${wasteTexts.notificationsOn}) ${consts.a11yLabel.button}`}
            >
              <ListItem.Content>
                <BoldText small>{wasteTexts.notificationsOn}</BoldText>
              </ListItem.Content>
              <Switch
                switchValue={showNotificationSettings}
                toggleSwitch={async () => {
                  if (!isPushPermissionGranted) {
                    showPermissionRequiredAlert(() =>
                      dispatch({ type: WasteSettingsActions.toggleNotifications })
                    );
                    return;
                  }

                  dispatch({ type: WasteSettingsActions.toggleNotifications });
                }}
              />
            </ListItem>
          </Wrapper>
          <Collapsible collapsed={!showNotificationSettings}>
            <WrapperHorizontal>
              <Divider style={styles.divider} />
              <ListItem
                bottomDivider
                containerStyle={[styles.borderRadiusTop, styles.listItemContainer]}
                accessibilityLabel={`(${wasteTexts.daysBefore}) ${consts.a11yLabel.button}`}
              >
                <ListItem.Content>
                  <BoldText small>{wasteTexts.daysBefore}</BoldText>
                </ListItem.Content>
                <Tooltip
                  ref={tooltipRef}
                  backgroundColor={colors.surface}
                  containerStyle={[styles.borderRadius, styles.tooltipContainer]}
                  height={normalize(70)}
                  popover={
                    <View>
                      <TouchableOpacity onPress={() => onPressUpdateOnDayBefore(false)}>
                        <RegularText primary={!onDayBefore} style={styles.tooltipSelection}>
                          {wasteTexts.sameDay}
                        </RegularText>
                      </TouchableOpacity>
                      <Divider style={styles.dividerSmall} />
                      <TouchableOpacity onPress={() => onPressUpdateOnDayBefore(true)}>
                        <RegularText primary={onDayBefore} style={styles.tooltipSelection}>
                          {wasteTexts.oneDayBefore}
                        </RegularText>
                      </TouchableOpacity>
                    </View>
                  }
                  width={normalize(160)}
                  withOverlay={device.platform === 'android'}
                  overlayColor={colors.shadowRgba}
                  withPointer={false}
                >
                  <WrapperRow itemsCenter>
                    <RegularText small primary style={{ paddingVertical: normalize(4.85) }}>
                      {onDayBefore ? wasteTexts.oneDayBefore : wasteTexts.sameDay}{' '}
                    </RegularText>
                    <Icon.KeyboardArrowUpDown size={normalize(14)} />
                  </WrapperRow>
                </Tooltip>
              </ListItem>
              <ListItem
                containerStyle={[
                  styles.borderRadiusBottom,
                  styles.listItemContainer,
                  { paddingVertical: normalize(11.5) }
                ]}
                accessibilityLabel={`(${wasteTexts.timeOfDay}) ${consts.a11yLabel.button}`}
              >
                <ListItem.Content>
                  <BoldText small>{wasteTexts.timeOfDay}</BoldText>
                </ListItem.Content>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <View style={[styles.smallBorderRadius, styles.timeContainer]}>
                    <RegularText small>{formatTime(reminderTime)} Uhr</RegularText>
                  </View>
                </TouchableOpacity>
                {device.platform === 'ios' && (
                  <Modal
                    animationType="none"
                    transparent={true}
                    visible={showDatePicker}
                    supportedOrientations={['landscape', 'portrait']}
                  >
                    <View style={styles.modalContainer}>
                      <View style={styles.dateTimePickerContainerIOS}>
                        <SafeAreaView>
                          <WrapperHorizontal style={styles.paddingTop}>
                            <WrapperRow spaceBetween>
                              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <BoldText primary>{texts.dateTimePicker.cancel}</BoldText>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <BoldText primary>{texts.dateTimePicker.ok}</BoldText>
                              </TouchableOpacity>
                            </WrapperRow>
                          </WrapperHorizontal>

                          <DateTimePicker
                            display="spinner"
                            mode="time"
                            onChange={onDatePickerChange}
                            style={styles.dateTimePickerIOS}
                            textColor={colors.darkText}
                            value={reminderTime}
                          />
                        </SafeAreaView>
                      </View>
                    </View>
                  </Modal>
                )}
                {device.platform === 'android' && showDatePicker && (
                  <View style={styles.dateTimePickerContainerAndroid}>
                    <DateTimePicker
                      mode="time"
                      onChange={onDatePickerChange}
                      value={reminderTime}
                    />
                  </View>
                )}
              </ListItem>
              <Divider style={styles.divider} />
            </WrapperHorizontal>
            {!!selectedTypeKeys?.length && usedTypes && !_isEmpty(notificationSettings) && (
              <WrapperHorizontal>
                <FlatList
                  // filter out the keys in selectedTypeKeys that are not in usedTypes
                  data={selectedTypeKeys.filter((key) => usedTypes[key]).sort()}
                  renderItem={({ item, index }) => {
                    return (
                      <ListItem
                        bottomDivider={index < selectedTypeKeys.length - 1}
                        containerStyle={styles.listItemContainer}
                        accessibilityLabel={`(${usedTypes[item].label}) ${consts.a11yLabel.button}`}
                      >
                        <ListItem.Content>
                          <WrapperRow itemsCenter>
                            <Dot color={usedTypes[item].color} />
                            {usedTypes[item].color !== usedTypes[item].selected_color && (
                              <Dot color={usedTypes[item].selected_color} />
                            )}
                            <BoldText small> {usedTypes[item].label}</BoldText>
                          </WrapperRow>
                        </ListItem.Content>

                        <Switch
                          switchValue={notificationSettings[item]}
                          toggleSwitch={() => {
                            dispatch({
                              type: WasteSettingsActions.setNotificationSetting,
                              payload: { key: item, value: !notificationSettings[item] }
                            });
                          }}
                        />
                      </ListItem>
                    );
                  }}
                  keyExtractor={keyExtractor}
                  style={styles.borderRadius}
                />
              </WrapperHorizontal>
            )}
          </Collapsible>

          {!!hasExport && (
            <View style={styles.paddingTop}>
              <Wrapper style={styles.noPaddingBottom}>
                <Button title={wasteTexts.exportButton} onPress={triggerExport} />
              </Wrapper>
            </View>
          )}
        </ScrollView>
      </SafeAreaViewFlex>
    );
  }
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  borderRadius: {
    borderRadius: normalize(10)
  },
  smallBorderRadius: {
    borderRadius: normalize(6)
  },
  borderRadiusTop: {
    borderTopLeftRadius: normalize(10),
    borderTopRightRadius: normalize(10)
  },
  borderRadiusBottom: {
    borderBottomLeftRadius: normalize(10),
    borderBottomRightRadius: normalize(10)
  },
  container: {
    backgroundColor: colors.surface
  },
  divider: {
    backgroundColor: colors.placeholder
  },
  dividerSmall: {
    backgroundColor: colors.placeholder,
    marginVertical: normalize(4),
    width: normalize(140)
  },
  listItemContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 0
  },
  mediumPaddingVertical: {
    paddingBottom: normalize(8),
    paddingTop: normalize(8)
  },
  noPaddingBottom: {
    paddingBottom: 0
  },
  paddingHorizontal: {
    paddingHorizontal: normalize(16)
  },
  paddingTop: {
    paddingTop: normalize(14)
  },
  dateTimePickerContainerAndroid: {
    marginLeft: normalize(-14)
  },
  dateTimePickerContainerIOS: {
    backgroundColor: colors.surface
  },
  dateTimePickerIOS: {
    alignSelf: 'center'
  },
  modalContainer: {
    backgroundColor: colors.overlayRgba,
    flex: 1,
    justifyContent: 'flex-end'
  },
  timeContainer: {
    backgroundColor: colors.shadowRgba,
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(10),
    ...Platform.select({
      ios: {
        marginRight: normalize(-14)
      },
      android: {
        marginRight: 0
      }
    })
  },
  resultsList: {
    padding: normalize(14)
  },
  tooltipContainer: {
    borderColor: colors.shadowRgba,
    borderWidth: StyleSheet.hairlineWidth,
    left: 'auto',
    padding: 0,
    right: normalize(20),
    shadowColor: colors.shadowRgba,
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowOpacity: 1,
    shadowRadius: 8
  },
  tooltipSelection: {
    paddingHorizontal: normalize(8)
  }
});
