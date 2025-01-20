import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
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
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider, ListItem, Tooltip } from 'react-native-elements';

import { colors, consts, device, Icon, normalize, texts } from '../../config';
import { formatTime, storageHelper } from '../../helpers';
import {
  useFilterStreets,
  useRenderSuggestions,
  useStreetString,
  useWasteAddresses,
  useWasteStreet,
  useWasteTypes,
  useWasteUsedTypes
} from '../../hooks';
import { areValidReminderSettings, parseReminderSettings } from '../../jsonValidation';
import {
  deleteReminderSetting,
  getReminderSettings,
  updateReminderSettings
} from '../../pushNotifications';
import { getLocationData } from '../../screens';
import { SettingsContext } from '../../SettingsProvider';
import { ReminderSettingJson, ReminderSettings } from '../../types';
import { HeaderLeft } from '../HeaderLeft';
import { LoadingSpinner } from '../LoadingSpinner';
import { Switch } from '../Switch';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperHorizontal, WrapperRow, WrapperVertical } from '../Wrapper';

import { ReminderSettingsActionType, reminderSettingsReducer } from './ReminderSettingsReducer';
import { Dot } from './WasteCalendarLegendEntry';

const initialReminderTime = new Date();
initialReminderTime.setHours(9);
initialReminderTime.setMinutes(0);

const initialSettings: ReminderSettings = {
  activeTypes: {},
  onDayBefore: false,
  reminderTime: initialReminderTime
};

const keyExtractor = (item: string, index: number) => `index${index}-${item}`;

/* eslint-disable complexity */
export const WasteCollectionSettings = ({
  currentSelectedStreetId
}: {
  currentSelectedStreetId: number;
}) => {
  const navigation = useNavigation();
  const { globalSettings, setGlobalSettings } = useContext(SettingsContext);
  const { waste = {} } = globalSettings;
  const [state, dispatch] = useReducer(reminderSettingsReducer, initialSettings);
  const { onDayBefore, reminderTime } = state;
  const [loadingStoredSettings, setLoadingStoredSettings] = useState(true);
  const [errorWithStoredSettings, setErrorWithStoredSettings] = useState(false);
  const [selectedStreetId, setSelectedStreetId] = useState(currentSelectedStreetId);
  const [isStreetSelected, setIsStreetSelected] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [localSelectedTime, setLocalSelectedTime] = useState<Date>(new Date());
  const { data, loading } = useWasteAddresses();
  const addressesData = data?.wasteAddresses;
  const { data: typesData, loading: typesLoading } = useWasteTypes();
  const { data: streetData, loading: streetLoading } = useWasteStreet({ selectedStreetId });
  const usedTypes = useWasteUsedTypes({ streetData, typesData });
  const locationData = getLocationData(streetData);
  const { getStreetString } = useStreetString();
  const streetName = locationData ? getStreetString(locationData) : undefined;
  const { inputValue, setInputValue, renderSuggestion } = useRenderSuggestions(() =>
    setIsStreetSelected(true)
  );
  const { filterStreets } = useFilterStreets('', false);
  const [typeKeys, setTypeKeys] = useState<string[]>([]);
  const [selectedTypeKeys, setSelectedTypeKeys] = useState<string[]>();

  const [typeSettings, setTypeSettings] = useState();
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState();
  const [updateOnDayBefore, setUpdateOnDayBefore] = useState(onDayBefore);
  const tooltipRef = useRef(null);

  const loadStoredSettings = useCallback(
    async (street: string) => {
      setLoadingStoredSettings(true);

      // replace null values with empty strings for city and zip in storedSettings to prevent
      // validation issues
      const storedSettings = (await getReminderSettings())?.map((setting: ReminderSettingJson) => ({
        ...setting,
        street: getStreetString(setting),
        city: setting.city ?? '',
        zip: setting.zip ?? ''
      }));

      if (!areValidReminderSettings(storedSettings)) {
        setErrorWithStoredSettings(true);
      } else {
        const newSettings: ReminderSettings = parseReminderSettings(storedSettings, street);
        // If there is no street stored, it is the initial call, set all types to active. Otherwise
        // set to false if there is no value from stored settings.
        const isInitial = waste.streetId === undefined;

        // apply old street settings to new street if present
        if (!isInitial && !!state.activeTypesForOldStreet) {
          newSettings.activeTypesForOldStreet = state.activeTypesForOldStreet;
        }

        typeKeys.forEach((typeKey) => {
          newSettings.activeTypes[typeKey] ??= { active: isInitial };
        });

        const determinedNotificationSettings = typeKeys?.reduce(
          (acc, typeKey) => ({
            ...acc,
            [typeKey]: newSettings.activeTypes?.[typeKey]?.active ?? isInitial
          }),
          {}
        );

        setNotificationSettings(determinedNotificationSettings);
        dispatch({ type: ReminderSettingsActionType.OVERWRITE, payload: newSettings });
        setLocalSelectedTime(newSettings.reminderTime);
        setUpdateOnDayBefore(newSettings.onDayBefore);
        setErrorWithStoredSettings(false);
      }

      setLoadingStoredSettings(false);
    },
    [typeKeys, getStreetString, waste, state.activeTypesForOldStreet]
  );

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
                  streetId: selectedStreetId,
                  selectedTypeKeys
                }
              });
              setGlobalSettings({
                ...globalSettings,
                waste: {
                  ...waste,
                  streetId: selectedStreetId,
                  selectedTypeKeys
                }
              });

              !!notificationSettings &&
                Object.entries(notificationSettings)?.forEach(([typeKey, typeValue]) =>
                  dispatch({
                    type: ReminderSettingsActionType.UPDATE_ACTIVE_TYPE,
                    payload: { key: typeKey, value: typeValue }
                  })
                );

              await updateSettings();

              navigation.goBack();
            }}
            text="Speichern"
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
    updateOnDayBefore
  ]);

  // Set initial waste types used in the selected street
  useEffect(() => usedTypes && setTypeKeys(Object.keys(usedTypes)), [usedTypes]);

  // Set type settings and notification settings initially and when editing waste type settings
  useEffect(() => {
    if (loadingStoredSettings || !typeKeys?.length) {
      return;
    }

    // If there is no street stored, it is the initial call, set all types to active. Otherwise
    // read from state to set all types.
    const isInitial = waste.streetId === undefined || !!state.activeTypesForOldStreet;

    const determinedTypeSettings = typeKeys.reduce(
      (acc, typeKey) => ({
        ...acc,
        [typeKey]:
          waste.selectedTypeKeys?.includes(typeKey) ??
          state.activeTypes?.[typeKey]?.active ??
          isInitial
      }),
      {}
    );

    !typeSettings && setTypeSettings(determinedTypeSettings);
  }, [loadingStoredSettings, typeKeys, state.activeTypes, state.activeTypesForOldStreet, waste]);

  useEffect(() => {
    if (!addressesData || !inputValue) {
      return;
    }

    const item = addressesData.find(
      (address) => getStreetString(address).toLowerCase() === inputValue.toLowerCase()
    );

    if (item?.id) {
      if (item.id !== currentSelectedStreetId) {
        // if street changed, store value for old street to be able to delete it later.
        // if switching street between saving and updating with the server, this can lead to
        // overwriting the old street settings with temporary ones. we can prevent this by
        // checking for `storeIds` in the old street settings and only dispatching the action
        // if there are any.
        !!state.activeTypes &&
          Object.values(state.activeTypes).some((entry) => !!entry?.storeId) &&
          dispatch({ type: ReminderSettingsActionType.SET_ACTIVE_TYPES_FOR_OLD_STREET });
      }

      setSelectedStreetId(item.id);
    }
  }, [addressesData, getStreetString, inputValue]);

  useEffect(() => {
    !!streetName && loadStoredSettings(streetName);
  }, [loadStoredSettings, streetName]);

  // Filter notification settings switches based on type settings switches
  useEffect(() => {
    if (!typeSettings || !typeKeys?.length) {
      return;
    }

    setSelectedTypeKeys(typeKeys.filter((typeKey) => typeSettings[typeKey]));
    setNotificationSettings((prevSettings) => ({
      ...prevSettings,
      ...typeKeys.reduce((acc, typeKey) => {
        // if something is set to false in typeSettings, set it to false in notificationSettings,
        // that will be hidden in the interface
        if (typeSettings[typeKey] === false) {
          acc[typeKey] = false;
        }
        return acc;
      }, {})
    }));
  }, [typeSettings]);

  // Turn off "all" settings toggle if all notifications are off
  useEffect(() => {
    !!notificationSettings &&
      setShowNotificationSettings(Object.values(notificationSettings).some((active) => !!active));
  }, [notificationSettings]);

  const onAbortIOS = useCallback(() => {
    setShowDatePicker(false);
    setLocalSelectedTime(reminderTime);
  }, [reminderTime]);

  const onAcceptIOS = useCallback(() => {
    setShowDatePicker(false);
    dispatch({ type: ReminderSettingsActionType.UPDATE_TIME, payload: localSelectedTime });
  }, [localSelectedTime]);

  const onDatePickerChange = useCallback((_, newTime?: Date) => {
    if (device.platform === 'android') {
      setShowDatePicker(false);

      if (newTime) {
        newTime.setMilliseconds(0);
        newTime.setSeconds(0);
        dispatch({ type: ReminderSettingsActionType.UPDATE_TIME, payload: newTime });
      }
    }

    setLocalSelectedTime((time) => newTime || time);
  }, []);

  const onPressUpdateOnDayBefore = useCallback((value) => {
    tooltipRef?.current?.toggleTooltip();
    dispatch({ type: ReminderSettingsActionType.UPDATE_ON_DAY_BEFORE, payload: value });
    setTimeout(() => {
      setUpdateOnDayBefore(value);
    }, 150);
  }, []);

  const updateSettings = useCallback(async () => {
    const newState = { ...state };
    let errorOccurred = false;

    // delete all entries of the old street
    if (state.activeTypesForOldStreet) {
      await Promise.all(
        Object.values(state.activeTypesForOldStreet || {})
          .filter((entry) => !!entry?.storeId)
          .map(({ storeId }) => deleteReminderSetting(storeId))
      );

      dispatch({ type: ReminderSettingsActionType.REMOVE_ACTIVE_TYPES_FOR_OLD_STREET });
    }

    await Promise.all(
      Object.keys(state.activeTypes)?.map(async (typeKey) => {
        const { storeId } = state.activeTypes[typeKey];
        const active = !!notificationSettings?.[typeKey];

        // delete inactive entries
        if (!active && !!storeId) {
          const success = await deleteReminderSetting(storeId);

          errorOccurred ||= !success;
        }

        if (active) {
          const id = await updateReminderSettings({
            ...locationData,
            onDayBefore,
            reminderTime,
            wasteType: typeKey
          });

          // save new id
          newState.activeTypes[typeKey].storeId = id;
          errorOccurred ||= id === undefined;
        }
      })
    );

    if (!errorOccurred) {
      // update stored state entries
      dispatch({ type: ReminderSettingsActionType.OVERWRITE, payload: newState });
    } else {
      // refetch data to avoid incorrect local state
      !!streetName && loadStoredSettings(streetName);
    }
  }, [state, locationData, onDayBefore, reminderTime, streetName, loadStoredSettings]);

  if (loading || typesLoading || streetLoading) {
    return <LoadingSpinner loading />;
  }

  const filteredStreets = filterStreets(inputValue, addressesData);

  if (inputValue && !isStreetSelected) {
    return (
      <FlatList
        data={filteredStreets}
        keyboardShouldPersistTaps="handled"
        renderItem={renderSuggestion}
        contentContainerStyle={styles.resultsList}
      />
    );
  }

  if (selectedStreetId) {
    if (errorWithStoredSettings) {
      return <LoadingSpinner loading />;
    }

    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={loadingStoredSettings}
            onRefresh={() => !!streetName && loadStoredSettings(streetName)}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      >
        {!!locationData && (
          <Wrapper>
            <RegularText>Meine Straße:</RegularText>
            <BoldText>{streetName}</BoldText>
          </Wrapper>
        )}
        {!!typeKeys?.length && usedTypes && !!typeSettings && (
          <WrapperVertical style={[styles.paddingHorizontal]}>
            <WrapperVertical style={styles.mediumPaddingVertical}>
              <RegularText big>Kategorien auswählen</RegularText>
            </WrapperVertical>
            <FlatList
              data={typeKeys}
              renderItem={({ item, index }) => {
                return (
                  <ListItem
                    bottomDivider={index < typeKeys.length - 1}
                    containerStyle={styles.listItemContainer}
                    accessibilityLabel={`(${usedTypes[item].label}) ${consts.a11yLabel.button}`}
                  >
                    <ListItem.Content>
                      <WrapperRow itemsCenter>
                        <Dot color={usedTypes[item].color} />
                        {usedTypes[item].color !== usedTypes[item].selected_color && (
                          <Dot center color={usedTypes[item].selected_color} />
                        )}
                        <BoldText small> {usedTypes[item].label}</BoldText>
                      </WrapperRow>
                    </ListItem.Content>

                    <Switch
                      switchValue={typeSettings[item]}
                      toggleSwitch={() => {
                        setTypeSettings({
                          ...typeSettings,
                          [item]: !typeSettings[item]
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
            <RegularText big>Benachrichtigungen</RegularText>
          </WrapperVertical>
          <ListItem
            containerStyle={[styles.borderRadius, styles.listItemContainer]}
            accessibilityLabel={`(Benachrichtigungen an) ${consts.a11yLabel.button}`}
          >
            <ListItem.Content>
              <BoldText small>Benachrichtigungen an</BoldText>
            </ListItem.Content>
            <Switch
              switchValue={showNotificationSettings}
              toggleSwitch={() => {
                setShowNotificationSettings(!showNotificationSettings);
                setNotificationSettings((prevSettings) => ({
                  ...prevSettings,
                  ...selectedTypeKeys.reduce((acc, typeKey) => {
                    // et all types off or on, based on the current state
                    acc[typeKey] = !showNotificationSettings;
                    return acc;
                  }, {})
                }));
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
              accessibilityLabel={`(Tage vor Abholung) ${consts.a11yLabel.button}`}
            >
              <ListItem.Content>
                <BoldText small>Tag(e) vor Abholung</BoldText>
              </ListItem.Content>
              <Tooltip
                ref={tooltipRef}
                backgroundColor={colors.surface}
                containerStyle={[styles.borderRadius, styles.tooltipContainer]}
                height={normalize(70)}
                popover={
                  <View>
                    <TouchableOpacity onPress={() => onPressUpdateOnDayBefore(false)}>
                      <RegularText primary={!updateOnDayBefore} style={styles.tooltipSelection}>
                        selber Tag
                      </RegularText>
                    </TouchableOpacity>
                    <Divider style={styles.dividerSmall} />
                    <TouchableOpacity onPress={() => onPressUpdateOnDayBefore(true)}>
                      <RegularText primary={updateOnDayBefore} style={styles.tooltipSelection}>
                        1 Tag vorher
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
                    {updateOnDayBefore ? '1 Tag vorher' : 'selber Tag'}{' '}
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
              accessibilityLabel={`(Uhrzeit) ${consts.a11yLabel.button}`}
            >
              <ListItem.Content>
                <BoldText small>Uhrzeit</BoldText>
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
                            <TouchableOpacity onPress={onAbortIOS}>
                              <BoldText primary>{texts.dateTimePicker.cancel}</BoldText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onAcceptIOS}>
                              <BoldText primary>{texts.dateTimePicker.ok}</BoldText>
                            </TouchableOpacity>
                          </WrapperRow>
                        </WrapperHorizontal>

                        <DateTimePicker
                          display="spinner"
                          mode="time"
                          onChange={onDatePickerChange}
                          value={localSelectedTime || new Date()}
                          textColor={colors.darkText}
                        />
                      </SafeAreaView>
                    </View>
                  </View>
                </Modal>
              )}
              {device.platform === 'android' && showDatePicker && (
                <DateTimePicker
                  mode="time"
                  onChange={onDatePickerChange}
                  value={localSelectedTime || new Date()}
                />
              )}
            </ListItem>
            <Divider style={styles.divider} />
          </WrapperHorizontal>
          {!!selectedTypeKeys?.length && usedTypes && !!notificationSettings && (
            <WrapperHorizontal>
              <FlatList
                data={selectedTypeKeys}
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
                            <Dot center color={usedTypes[item].selected_color} />
                          )}
                          <BoldText small> {usedTypes[item].label}</BoldText>
                        </WrapperRow>
                      </ListItem.Content>

                      <Switch
                        switchValue={notificationSettings[item]}
                        toggleSwitch={() => {
                          setNotificationSettings({
                            ...notificationSettings,
                            [item]: !notificationSettings[item]
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
      </ScrollView>
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
  dateTimePickerContainerIOS: {
    backgroundColor: colors.surface
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
    marginRight: normalize(-14)
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
