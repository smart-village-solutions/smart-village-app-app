import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import _isEmpty from 'lodash/isEmpty';
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider, ListItem, Tooltip } from 'react-native-elements';

import {
  BoldText,
  Button,
  Dot,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  Switch,
  Wrapper,
  WrapperHorizontal,
  WrapperRow,
  WrapperVertical
} from '../components';
import { colors, consts, device, Icon, normalize, texts } from '../config';
import { formatTime, saveWasteReminderSettings, storageHelper } from '../helpers';
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
  buildWasteReminderSchedule,
  getLocalNotificationPermission,
  getReminderSettings,
  getWasteReminderUiMode,
  markWasteReminderServerSyncSynced,
  normalizePushReminderSlots,
  readWasteReminderLocalState,
  requestLocalNotificationPermission,
  scheduleWasteReminderNotifications,
  setInAppPermission,
  showSystemPermissionMissingDialog,
  syncWasteReminderSettingsWithServer,
  WasteReminderRegistration,
  WasteReminderServerSyncPayload,
  WasteReminderServerSyncRegistration
} from '../pushNotifications';
import {
  WasteReminderSettingsByType,
  WasteSettingsActions,
  wasteSettingsReducer,
  WasteSettingsState
} from '../reducers';
import { getLocationData, getPositionStyleByNavigation } from '../screens';
import { SettingsContext } from '../SettingsProvider';
import { WasteReminderSettingJson, WasteTypeData } from '../types';

const keyExtractor = (item: string, index: number) => `index${index}-${item}`;
const getFlexibleLeadDaysTooltipKey = (typeKey: string, slotId: string) => `${typeKey}:${slotId}`;
const renderWasteTypeLabel = (wasteType: WasteTypeData[string]) => (
  <WrapperRow itemsCenter>
    <Dot color={wasteType.color} />
    {wasteType.color !== wasteType.selected_color && <Dot color={wasteType.selected_color} />}
    <BoldText small> {wasteType.label}</BoldText>
  </WrapperRow>
);
const getFlexibleLeadDaysTooltipScrollY = (
  leadDays: number,
  maxLeadDays: number,
  tooltipHeight: number
) => {
  const optionHeight = normalize(34);
  const contentPadding = normalize(10);
  const contentHeight = (maxLeadDays + 1) * optionHeight + 2 * contentPadding;
  const maxScrollY = Math.max(0, contentHeight - tooltipHeight);
  const centeredSelectionY =
    leadDays * optionHeight - (tooltipHeight - optionHeight) / 2 + contentPadding;

  return Math.min(maxScrollY, Math.max(0, centeredSelectionY));
};

type TooltipRef = {
  toggleTooltip: () => void;
};

const initialWasteSettingsState: WasteSettingsState = {
  activeTypes: {},
  typeSettings: {},
  selectedTypeKeys: [],
  notificationSettings: {},
  showNotificationSettings: false,
  onDayBefore: true,
  reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
  reminderSettingsByType: {}
};

/* eslint-disable complexity */
export const WasteCollectionSettingsScreen = () => {
  const navigation = useNavigation();
  const routeParams = useRoute().params;
  const { globalSettings, setGlobalSettings } = useContext(SettingsContext);
  const { navigation: navigationType, settings = {}, waste = {} } = globalSettings;
  const { wasteAddresses = {} } = settings;
  const { texts: wasteAddressesTexts = {} } = wasteAddresses;
  const wasteTexts = { ...texts.wasteCalendar, ...wasteAddressesTexts };
  const isInitial = waste.streetId === undefined;
  const [loadedStoredSettingsInitially, setLoadedStoredSettingsInitially] = useState(false);
  const [loadingStoredSettings, setLoadingStoredSettings] = useState(!isInitial);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [selectedStreetId, setSelectedStreetId] = useState(routeParams?.currentSelectedStreetId);
  const [isStreetSelected, setIsStreetSelected] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeFlexibleTimePicker, setActiveFlexibleTimePicker] = useState<{
    slotId: string;
    typeKey: string;
  }>();
  const [isPushPermissionGranted, setIsPushPermissionGranted] = useState(false);
  const [state, dispatch] = useReducer(wasteSettingsReducer, initialWasteSettingsState);
  const {
    activeTypes,
    typeSettings,
    selectedTypeKeys,
    notificationSettings,
    showNotificationSettings,
    onDayBefore,
    reminderTime,
    reminderSettingsByType
  } = state;
  const { inputValue, renderSuggestion } = useRenderSuggestions(() => setIsStreetSelected(true));
  const { data, loading } = useWasteAddresses({ search: inputValue });
  const addressesData = data?.wasteAddresses;
  const { data: typesData, loading: typesLoading } = useWasteTypes();
  const { data: streetData, loading: streetLoading } = useWasteStreet({ selectedStreetId });
  const usedTypes = useWasteUsedTypes({ streetData, typesData });
  const usedTypeKeys: string[] = useMemo(
    () => (usedTypes ? Object.keys(usedTypes) : []),
    [usedTypes]
  );
  const reminderUiMode = useMemo(() => getWasteReminderUiMode(usedTypes), [usedTypes]);
  const locationData = getLocationData(streetData);
  const { getStreetString } = useStreetString();
  const streetName = locationData ? getStreetString(locationData) : undefined;
  const { filterStreets } = useFilterStreets('', false);
  const tooltipRef = useRef<TooltipRef | null>(null);
  const flexibleLeadDaysTooltipRefs = useRef<Record<string, TooltipRef | null>>({});

  const loadStoredSettingsFromServer = useCallback(async () => {
    if (isInitial) return;

    setLoadingStoredSettings(true);

    const localReminderState = await readWasteReminderLocalState();
    const localServerSyncPayload = localReminderState?.serverSyncPayload;
    const localLocation = localServerSyncPayload?.locationData;
    const localStreetName = localLocation ? getStreetString(localLocation) : undefined;

    if (localServerSyncPayload && localStreetName && localStreetName === streetName) {
      if (usedTypes && localServerSyncPayload.activeReminderRegistrations?.length) {
        dispatch({
          type: WasteSettingsActions.setReminderSettingsByType,
          payload: buildReminderSettingsFromRegistrations(
            usedTypes,
            localServerSyncPayload.activeReminderRegistrations
          )
        });
      }

      dispatch({
        type: WasteSettingsActions.updateWasteSettings,
        payload: {
          serverSettings: buildStoredSettingsFromLocalPayload(localServerSyncPayload).map(
            (registration) => ({
              city: localLocation?.city ?? '',
              id: Number(registration.storeId ?? 0),
              notify_at: buildReminderTimeDate(registration.time).toISOString(),
              notify_days_before: registration.leadDays,
              notify_for_waste_type: registration.typeKey,
              street: localStreetName,
              zip: localLocation?.zip ?? ''
            })
          ),
          selectedTypeKeys: waste.selectedTypeKeys
        }
      });
      setLoadingStoredSettings(false);
      return;
    }

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
      setLoadingStoredSettings(false);
      return;
    } else {
      if (waste.streetId !== selectedStreetId) {
        dispatch({ type: WasteSettingsActions.setInitialWasteSettings, payload: usedTypeKeys });
        // Activate notifications if the user has allowed system permissions
        getLocalNotificationPermission().then((permission) => {
          if (permission) dispatch({ type: WasteSettingsActions.toggleNotifications });
        });
      } else {
        const streetSettings = storedSettingsOnServer.filter(
          (item) => item.street === waste.streetName
        );

        if (usedTypes && reminderUiMode === 'flexible-per-type') {
          dispatch({
            type: WasteSettingsActions.setReminderSettingsByType,
            payload: buildReminderSettingsFromServerSettings(usedTypes, streetSettings)
          });
        }

        dispatch({
          type: WasteSettingsActions.updateWasteSettings,
          payload: {
            serverSettings: streetSettings,
            selectedTypeKeys: waste.selectedTypeKeys
          }
        });
      }
    }

    setLoadingStoredSettings(false);
  }, [
    getStreetString,
    isInitial,
    waste.streetId,
    waste.streetName,
    waste.selectedTypeKeys,
    reminderUiMode,
    streetName,
    selectedStreetId,
    usedTypeKeys,
    usedTypes
  ]);

  const updateSettings = useCallback(
    async (
      localCoverageUntil?: Date,
      reminderSyncRegistrations?: WasteReminderServerSyncRegistration[]
    ) => {
      const {
        activeTypes: resettedActiveTypes,
        serverSyncPayload,
        success
      } = await syncWasteReminderSettingsWithServer(
        {
          activeReminderRegistrations: reminderSyncRegistrations,
          activeTypes,
          locationData,
          notificationSettings,
          onDayBefore,
          reminderTime,
          usedTypeKeys
        },
        localCoverageUntil
      );

      // Keep the local truth even if server fallback sync is pending due to offline/errors.
      if (!_isEmpty(resettedActiveTypes)) {
        dispatch({
          type: WasteSettingsActions.resetActiveTypes,
          payload: resettedActiveTypes
        });
      }

      if (success) {
        await markWasteReminderServerSyncSynced(serverSyncPayload);
      }
    },
    [usedTypeKeys, activeTypes, notificationSettings, locationData, onDayBefore, reminderTime]
  );

  const scheduleLocalReminderSettings = useCallback(async () => {
    const reminderSyncRegistrations =
      reminderUiMode === 'flexible-per-type'
        ? buildReminderServerSyncRegistrations(
            reminderSettingsByType,
            usedTypes,
            selectedTypeKeys,
            notificationSettings
          )
        : undefined;
    const activeReminderTypeKeys = usedTypeKeys.filter(
      (typeKey) => !!notificationSettings[typeKey]
    );
    const activeReminderRegistrations = reminderSyncRegistrations
      ?.filter((registration) => registration.active)
      .map((registration) => ({
        leadDays: registration.leadDays,
        slotId: registration.slotId,
        storeId: registration.storeId,
        time: registration.time,
        typeKey: registration.typeKey
      }));
    const schedule = buildWasteReminderSchedule({
      activeReminderRegistrations,
      onDayBefore,
      reminderTime,
      selectedTypeKeys: activeReminderTypeKeys,
      wasteLocationTypes: streetData?.wasteAddresses?.[0]?.wasteLocationTypes
    });

    await scheduleWasteReminderNotifications({
      hasMoreReminders: schedule.hasMoreReminders,
      localCoverageUntil: schedule.localCoverageUntil,
      reminders: schedule.reminders,
      serverSyncPayload: {
        activeReminderRegistrations: reminderSyncRegistrations,
        activeTypes,
        locationData,
        notificationSettings,
        onDayBefore,
        reminderTime,
        usedTypeKeys
      },
      streetName,
      wasteTypesData: usedTypes
    });

    return {
      reminderSyncRegistrations,
      localCoverageUntil: schedule.localCoverageUntil
    };
  }, [
    activeTypes,
    locationData,
    notificationSettings,
    onDayBefore,
    reminderTime,
    reminderSettingsByType,
    reminderUiMode,
    selectedTypeKeys,
    streetData,
    streetName,
    usedTypeKeys,
    usedTypes
  ]);

  const saveSettings = useCallback(async () => {
    setIsSavingSettings(true);

    try {
      await saveWasteReminderSettings({
        dispatchActiveType: (typeKey, value) =>
          dispatch({
            type: WasteSettingsActions.setActiveType,
            payload: { key: typeKey, value }
          }),
        globalSettings,
        notificationSettings,
        persistGlobalSettings: storageHelper.setGlobalSettings,
        scheduleLocalReminderSettings,
        selectedStreetId,
        selectedTypeKeys,
        setGlobalSettings,
        streetName,
        updateSettings,
        waste
      });

      navigation.goBack();
    } catch (error) {
      console.warn('An error occurred while saving waste reminder settings:', error);

      Alert.alert(texts.errors.errorTitle, texts.errors.noData);
      setIsSavingSettings(false);
    }
  }, [
    globalSettings,
    waste,
    streetName,
    selectedStreetId,
    selectedTypeKeys,
    notificationSettings,
    scheduleLocalReminderSettings,
    setGlobalSettings,
    updateSettings,
    navigation
  ]);

  // Set initial waste types used in the selected street
  useEffect(() => {
    if (usedTypes) {
      dispatch({ type: WasteSettingsActions.setInitialWasteSettings, payload: usedTypeKeys });
      dispatch({
        type: WasteSettingsActions.setReminderSettingsByType,
        payload: buildDefaultReminderSettingsByType(usedTypes)
      });
      // Activate notifications if the user has allowed system permissions
      getLocalNotificationPermission().then((permission) => {
        if (permission) dispatch({ type: WasteSettingsActions.toggleNotifications });
      });
    }
  }, [usedTypes, usedTypeKeys]);

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
  }, [loadStoredSettingsFromServer, loadedStoredSettingsInitially, typeSettings]);

  useEffect(() => {
    if (!addressesData || !inputValue) {
      return;
    }

    const item = addressesData.find(
      (address: { city?: string; street?: string; zip?: string }) =>
        getStreetString(address).toLowerCase() === inputValue.toLowerCase()
    );

    if (!!item && selectedStreetId !== item.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedStreetId(item.id);
    }
  }, [addressesData, inputValue, getStreetString, selectedStreetId]);

  const onPressUpdateOnDayBefore = useCallback((value: boolean) => {
    tooltipRef?.current?.toggleTooltip();
    dispatch({ type: WasteSettingsActions.setOnDayBefore, payload: value });
  }, []);

  const onDatePickerChange = useCallback((_: unknown, newTime?: Date) => {
    if (!newTime) return;

    newTime.setMilliseconds(0);
    newTime.setSeconds(0);

    if (device.platform === 'android') {
      setShowDatePicker(false);
    }

    dispatch({ type: WasteSettingsActions.setReminderTime, payload: newTime });
  }, []);

  const onFlexibleDatePickerChange = useCallback(
    (_: unknown, newTime?: Date) => {
      if (!newTime || !activeFlexibleTimePicker) return;

      newTime.setMilliseconds(0);
      newTime.setSeconds(0);

      if (device.platform === 'android') {
        setActiveFlexibleTimePicker(undefined);
      }

      dispatch({
        type: WasteSettingsActions.setReminderSlotTime,
        payload: {
          slotId: activeFlexibleTimePicker.slotId,
          typeKey: activeFlexibleTimePicker.typeKey,
          value: `${newTime.getHours()}:${newTime.getMinutes()}`
        }
      });
    },
    [activeFlexibleTimePicker]
  );

  const setFlexibleLeadDays = useCallback((typeKey: string, slotId: string, value: number) => {
    flexibleLeadDaysTooltipRefs.current[
      getFlexibleLeadDaysTooltipKey(typeKey, slotId)
    ]?.toggleTooltip();

    dispatch({
      type: WasteSettingsActions.setReminderSlotLeadDays,
      payload: {
        slotId,
        typeKey,
        value
      }
    });
  }, []);

  const activeFlexibleSlotTime = activeFlexibleTimePicker
    ? reminderSettingsByType[activeFlexibleTimePicker.typeKey]?.reminders[
        activeFlexibleTimePicker.slotId
      ]?.time
    : undefined;

  useEffect(() => {
    const getPermission = async () => {
      const inAppPermission = await getLocalNotificationPermission();

      setIsPushPermissionGranted(inAppPermission);
    };

    getPermission();
  }, [isPushPermissionGranted, showNotificationSettings]);

  if (loading || typesLoading || streetLoading || !loadedStoredSettingsInitially) {
    return <LoadingSpinner loading />;
  }

  if (inputValue && !isStreetSelected) {
    const filteredStreets = filterStreets(inputValue, addressesData);

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
              <View style={styles.borderRadius}>
                {[...usedTypeKeys].sort().map((item, index, sortedUsedTypeKeys) => (
                  <ListItem
                    key={keyExtractor(item, index)}
                    bottomDivider={index < sortedUsedTypeKeys.length - 1}
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
                      isDisabled={false}
                      switchValue={typeSettings[item]}
                      toggleSwitch={() => {
                        dispatch({
                          type: WasteSettingsActions.setTypeSetting,
                          payload: { key: item, value: !typeSettings[item] }
                        });
                      }}
                    />
                  </ListItem>
                ))}
              </View>
            </WrapperVertical>
          )}
          <Wrapper style={[styles.noPaddingBottom, styles.paddingHorizontal]}>
            <WrapperVertical style={styles.mediumPaddingVertical}>
              <RegularText big>{wasteTexts.reminders}</RegularText>
            </WrapperVertical>
            <ListItem
              containerStyle={[styles.borderRadius, styles.listItemContainer]}
              accessibilityLabel={`(${wasteTexts.notificationsOn}) ${consts.a11yLabel.button}`}
            >
              <ListItem.Content>
                <BoldText small>{wasteTexts.notificationsOn}</BoldText>
              </ListItem.Content>
              <Switch
                isDisabled={false}
                switchValue={showNotificationSettings}
                toggleSwitch={async () => {
                  if (!isPushPermissionGranted) {
                    const hasPermission = await requestLocalNotificationPermission();

                    if (!hasPermission) {
                      showSystemPermissionMissingDialog();
                      return;
                    }

                    setIsPushPermissionGranted(true);
                  }

                  if (!showNotificationSettings) {
                    const hasPushToken = await setInAppPermission(true);

                    if (!hasPushToken) {
                      showSystemPermissionMissingDialog();
                      return;
                    }
                  }

                  dispatch({ type: WasteSettingsActions.toggleNotifications });
                }}
              />
            </ListItem>
          </Wrapper>
          <Collapsible collapsed={!showNotificationSettings}>
            {reminderUiMode === 'legacy-global' && (
              <>
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
                        <TouchableWithoutFeedback onPress={(event) => event.stopPropagation()}>
                          <View
                            onTouchStart={(event) => event.stopPropagation()}
                            style={[styles.tooltipTouchableArea, styles.tooltipContent]}
                          >
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
                        </TouchableWithoutFeedback>
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
                    <View style={styles.borderRadius}>
                      {selectedTypeKeys
                        .filter((key) => usedTypes[key])
                        .sort()
                        .map((item, index, filteredSelectedTypeKeys) => (
                          <ListItem
                            key={keyExtractor(item, index)}
                            bottomDivider={index < filteredSelectedTypeKeys.length - 1}
                            containerStyle={styles.listItemContainer}
                            accessibilityLabel={`(${usedTypes[item].label}) ${consts.a11yLabel.button}`}
                          >
                            <ListItem.Content>
                              {renderWasteTypeLabel(usedTypes[item])}
                            </ListItem.Content>

                            <Switch
                              isDisabled={false}
                              switchValue={notificationSettings[item]}
                              toggleSwitch={() => {
                                dispatch({
                                  type: WasteSettingsActions.setNotificationSetting,
                                  payload: { key: item, value: !notificationSettings[item] }
                                });
                              }}
                            />
                          </ListItem>
                        ))}
                    </View>
                  </WrapperHorizontal>
                )}
              </>
            )}
            {reminderUiMode === 'flexible-per-type' && !!selectedTypeKeys?.length && usedTypes && (
              <WrapperHorizontal>
                {selectedTypeKeys
                  .filter((key) => usedTypes[key])
                  .sort()
                  .map((typeKey) => {
                    const normalizedSlots = normalizePushReminderSlots(usedTypes[typeKey]);
                    const isPushReminderEnabled = normalizedSlots.slots.length > 0;
                    const isNotificationEnabled =
                      isPushReminderEnabled && !!notificationSettings[typeKey];
                    const configuredSlots = normalizedSlots.slots.filter(
                      (slot) => !!reminderSettingsByType[typeKey]?.reminders[slot.id]
                    );

                    return (
                      <View key={typeKey}>
                        <ListItem
                          containerStyle={styles.listItemContainer}
                          accessibilityLabel={`(${usedTypes[typeKey].label}) ${consts.a11yLabel.button}`}
                          topDivider
                        >
                          <ListItem.Content>
                            {renderWasteTypeLabel(usedTypes[typeKey])}
                          </ListItem.Content>
                          <Switch
                            isDisabled={!isPushReminderEnabled}
                            switchValue={isNotificationEnabled}
                            toggleSwitch={() => {
                              if (!isPushReminderEnabled) {
                                return;
                              }

                              dispatch({
                                type: WasteSettingsActions.setNotificationSetting,
                                payload: {
                                  key: typeKey,
                                  value: !isNotificationEnabled
                                }
                              });
                            }}
                          />
                        </ListItem>
                        <Collapsible collapsed={!isNotificationEnabled || !configuredSlots.length}>
                          {configuredSlots.map((slot, slotIndex) => {
                            const slotSetting = reminderSettingsByType[typeKey]?.reminders[slot.id];

                            if (!slotSetting) {
                              return null;
                            }

                            const tooltipHeight = normalize(
                              Math.min(260, 34 * (slot.maxLeadDays + 1))
                            );

                            return (
                              <View key={`${typeKey}-${slot.id}`}>
                                {configuredSlots.length > 1 && (
                                  <View
                                    style={[
                                      styles.flexibleReminderHeading,
                                      slotIndex !== 0 && { paddingTop: normalize(8) }
                                    ]}
                                  >
                                    <RegularText smallest>
                                      {`${slotIndex + 1}. ${wasteTexts.reminder}`}
                                    </RegularText>
                                  </View>
                                )}
                                <ListItem
                                  containerStyle={[
                                    styles.flexibleReminderListItem,
                                    styles.listItemContainer
                                  ]}
                                  accessibilityLabel={`(${wasteTexts.daysBefore}) ${consts.a11yLabel.button}`}
                                >
                                  <ListItem.Content>
                                    <BoldText small>{wasteTexts.daysBefore}</BoldText>
                                  </ListItem.Content>
                                  <Tooltip
                                    ref={(ref: TooltipRef | null) => {
                                      flexibleLeadDaysTooltipRefs.current[
                                        getFlexibleLeadDaysTooltipKey(typeKey, slot.id)
                                      ] = ref;
                                    }}
                                    backgroundColor={colors.surface}
                                    containerStyle={[styles.borderRadius, styles.tooltipContainer]}
                                    height={tooltipHeight}
                                    popover={
                                      <TouchableWithoutFeedback
                                        onPress={(event) => event.stopPropagation()}
                                      >
                                        <View
                                          onTouchStart={(event) => event.stopPropagation()}
                                          style={styles.tooltipTouchableArea}
                                        >
                                          <ScrollView
                                            alwaysBounceHorizontal={false}
                                            bounces
                                            contentContainerStyle={styles.tooltipContent}
                                            contentOffset={{
                                              x: 0,
                                              y: getFlexibleLeadDaysTooltipScrollY(
                                                slotSetting.leadDays,
                                                slot.maxLeadDays,
                                                tooltipHeight
                                              )
                                            }}
                                            directionalLockEnabled
                                            horizontal={false}
                                            showsVerticalScrollIndicator={false}
                                            style={styles.tooltipScrollView}
                                          >
                                            {getLeadDayOptions(slot.maxLeadDays).map((leadDays) => (
                                              <Fragment key={`${slot.id}-${leadDays}`}>
                                                <TouchableOpacity
                                                  key={`${slot.id}-${leadDays}`}
                                                  onPress={() =>
                                                    setFlexibleLeadDays(typeKey, slot.id, leadDays)
                                                  }
                                                >
                                                  <RegularText
                                                    primary={slotSetting.leadDays === leadDays}
                                                    style={styles.tooltipSelection}
                                                  >
                                                    {getLeadDaysLabel(leadDays, wasteTexts)}
                                                  </RegularText>
                                                </TouchableOpacity>
                                                {leadDays < slot.maxLeadDays && (
                                                  <Divider style={styles.dividerSmall} />
                                                )}
                                              </Fragment>
                                            ))}
                                          </ScrollView>
                                        </View>
                                      </TouchableWithoutFeedback>
                                    }
                                    width={normalize(160)}
                                    withOverlay={device.platform === 'android'}
                                    overlayColor={colors.shadowRgba}
                                    withPointer={false}
                                  >
                                    <WrapperRow itemsCenter>
                                      <RegularText small primary>
                                        {getLeadDaysLabel(slotSetting.leadDays, wasteTexts)}{' '}
                                      </RegularText>
                                      <Icon.KeyboardArrowUpDown size={normalize(14)} />
                                    </WrapperRow>
                                  </Tooltip>
                                </ListItem>
                                <ListItem
                                  containerStyle={[
                                    styles.flexibleReminderListItem,
                                    styles.listItemContainer,
                                    { paddingBottom: normalize(16), paddingTop: normalize(4) }
                                  ]}
                                  accessibilityLabel={`(${wasteTexts.timeOfDay}) ${consts.a11yLabel.button}`}
                                >
                                  <ListItem.Content>
                                    <BoldText small>{wasteTexts.timeOfDay}</BoldText>
                                  </ListItem.Content>
                                  <TouchableOpacity
                                    onPress={() =>
                                      setActiveFlexibleTimePicker({
                                        slotId: slot.id,
                                        typeKey
                                      })
                                    }
                                  >
                                    <View
                                      style={[
                                        styles.smallBorderRadius,
                                        styles.timeContainer,
                                        styles.flexibleTimeContainer
                                      ]}
                                    >
                                      <RegularText small>
                                        {formatReminderTimeString(slotSetting.time)} Uhr
                                      </RegularText>
                                    </View>
                                  </TouchableOpacity>
                                </ListItem>
                                {device.platform === 'android' &&
                                  activeFlexibleTimePicker?.typeKey === typeKey &&
                                  activeFlexibleTimePicker?.slotId === slot.id && (
                                    <View style={styles.dateTimePickerContainerAndroid}>
                                      <DateTimePicker
                                        mode="time"
                                        onChange={onFlexibleDatePickerChange}
                                        value={buildReminderTimeDate(slotSetting.time)}
                                      />
                                    </View>
                                  )}
                              </View>
                            );
                          })}
                        </Collapsible>
                      </View>
                    );
                  })}
              </WrapperHorizontal>
            )}
            {device.platform === 'ios' && activeFlexibleSlotTime && (
              <Modal
                animationType="none"
                transparent={true}
                visible={!!activeFlexibleTimePicker}
                supportedOrientations={['landscape', 'portrait']}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.dateTimePickerContainerIOS}>
                    <SafeAreaView>
                      <WrapperHorizontal style={styles.paddingTop}>
                        <WrapperRow spaceBetween>
                          <TouchableOpacity onPress={() => setActiveFlexibleTimePicker(undefined)}>
                            <BoldText primary>{texts.dateTimePicker.cancel}</BoldText>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setActiveFlexibleTimePicker(undefined)}>
                            <BoldText primary>{texts.dateTimePicker.ok}</BoldText>
                          </TouchableOpacity>
                        </WrapperRow>
                      </WrapperHorizontal>

                      <DateTimePicker
                        display="spinner"
                        mode="time"
                        onChange={onFlexibleDatePickerChange}
                        style={styles.dateTimePickerIOS}
                        textColor={colors.darkText}
                        value={buildReminderTimeDate(activeFlexibleSlotTime)}
                      />
                    </SafeAreaView>
                  </View>
                </View>
              </Modal>
            )}
          </Collapsible>

          <View style={styles.spacer} />
        </ScrollView>

        <View
          style={[
            styles.paddingTop,
            styles.saveButtonContainer,
            getPositionStyleByNavigation({ navigationType }).position
          ]}
        >
          <Wrapper noPaddingBottom>
            <Button
              disabled={isSavingSettings}
              notFullWidth
              onPress={isSavingSettings ? undefined : saveSettings}
              title={wasteTexts.save}
            />
          </Wrapper>
        </View>
      </SafeAreaViewFlex>
    );
  }
};
/* eslint-enable complexity */

const buildDefaultReminderSettingsByType = (
  usedTypes: WasteTypeData
): WasteReminderSettingsByType =>
  Object.fromEntries(
    Object.entries(usedTypes).map(([typeKey, wasteType]) => {
      const normalizedSlots = normalizePushReminderSlots(wasteType);

      return [
        typeKey,
        {
          enabled: normalizedSlots.slots.length > 0,
          reminders: Object.fromEntries(
            normalizedSlots.slots.map((slot) => [
              slot.id,
              {
                enabled: true,
                leadDays: slot.defaultLeadDays,
                time: '09:00'
              }
            ])
          )
        }
      ];
    })
  );

const buildReminderSettingsFromRegistrations = (
  usedTypes: WasteTypeData,
  registrations: Array<WasteReminderRegistration & { active?: boolean }>
): WasteReminderSettingsByType => {
  const reminderSettingsByType = buildDefaultReminderSettingsByType(usedTypes);

  Object.entries(reminderSettingsByType).forEach(([, typeSetting]) => {
    Object.keys(typeSetting.reminders).forEach((slotId) => {
      typeSetting.reminders[slotId].enabled = false;
    });
    typeSetting.enabled = false;
  });

  registrations.forEach((registration) => {
    const typeSetting = reminderSettingsByType[registration.typeKey];
    const slotSetting = typeSetting?.reminders[registration.slotId];

    if (!typeSetting || !slotSetting || registration.active === false) {
      return;
    }

    typeSetting.enabled = true;
    typeSetting.reminders[registration.slotId] = {
      enabled: true,
      leadDays: registration.leadDays,
      storeId: registration.storeId,
      time: registration.time
    };
  });

  return reminderSettingsByType;
};

const buildReminderSettingsFromServerSettings = (
  usedTypes: WasteTypeData,
  serverSettings: WasteReminderSettingJson[]
): WasteReminderSettingsByType =>
  buildReminderSettingsFromRegistrations(
    usedTypes,
    serverSettings.map((setting) => ({
      active: true,
      leadDays: setting.notify_days_before,
      slotId: setting.reminder_slot_id ?? 'default',
      storeId: setting.id,
      time: formatDateAsReminderTime(new Date(setting.notify_at)),
      typeKey: setting.notify_for_waste_type
    }))
  );

const buildReminderServerSyncRegistrations = (
  reminderSettingsByType: WasteReminderSettingsByType,
  usedTypes: WasteTypeData,
  selectedTypeKeys: string[],
  notificationSettings: { [key: string]: boolean }
): WasteReminderServerSyncRegistration[] => {
  const selectedTypes = new Set(selectedTypeKeys);
  const completeReminderSettingsByType = mergeReminderSettingsWithDefaults(
    buildDefaultReminderSettingsByType(usedTypes),
    reminderSettingsByType
  );

  return Object.entries(completeReminderSettingsByType).flatMap(([typeKey, typeSetting]) => {
    if (!selectedTypes.has(typeKey)) {
      return [];
    }

    const isTypeActive = !!notificationSettings[typeKey] && typeSetting.enabled;

    return Object.entries(typeSetting.reminders).map(([slotId, slotSetting]) => ({
      active: isTypeActive && slotSetting.enabled,
      leadDays: slotSetting.leadDays,
      slotId,
      storeId: slotSetting.storeId,
      time: slotSetting.time,
      typeKey
    }));
  });
};

const mergeReminderSettingsWithDefaults = (
  defaultSettings: WasteReminderSettingsByType,
  reminderSettingsByType: WasteReminderSettingsByType
): WasteReminderSettingsByType =>
  Object.fromEntries(
    Object.entries(defaultSettings).map(([typeKey, defaultTypeSetting]) => {
      const typeSetting = reminderSettingsByType[typeKey];

      return [
        typeKey,
        {
          ...defaultTypeSetting,
          ...typeSetting,
          reminders: Object.fromEntries(
            Object.entries(defaultTypeSetting.reminders).map(([slotId, defaultSlotSetting]) => [
              slotId,
              {
                ...defaultSlotSetting,
                ...typeSetting?.reminders[slotId]
              }
            ])
          )
        }
      ];
    })
  );

const buildStoredSettingsFromLocalPayload = (
  payload: WasteReminderServerSyncPayload
): WasteReminderRegistration[] => {
  if (payload.activeReminderRegistrations?.length) {
    return payload.activeReminderRegistrations
      .filter((registration) => registration.active)
      .map((registration) => ({
        leadDays: registration.leadDays,
        slotId: registration.slotId,
        storeId: registration.storeId,
        time: registration.time,
        typeKey: registration.typeKey
      }));
  }

  return payload.usedTypeKeys
    .filter((typeKey) => !!payload.notificationSettings[typeKey])
    .map((typeKey) => ({
      leadDays: payload.onDayBefore ? 1 : 0,
      slotId: 'default',
      storeId: payload.activeTypes[typeKey]?.storeId,
      time: formatDateAsReminderTime(
        payload.reminderTime instanceof Date ? payload.reminderTime : new Date(payload.reminderTime)
      ),
      typeKey
    }));
};

const buildReminderTimeDate = (time: string) => {
  const [hours = '0', minutes = '0'] = time.split(':');
  const reminderTime = new Date('2000-01-01T00:00:00.000+01:00');

  reminderTime.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);

  return reminderTime;
};

const formatDateAsReminderTime = (date: Date) => `${date.getHours()}:${date.getMinutes()}`;

const formatReminderTimeString = (time: string) => formatTime(buildReminderTimeDate(time));

const getLeadDayOptions = (maxLeadDays: number) =>
  Array.from({ length: maxLeadDays + 1 }, (_, index) => index);

const getLeadDaysLabel = (leadDays: number, wasteTexts: { [key: string]: string }) => {
  if (leadDays === 0) {
    return wasteTexts.sameDay;
  }

  if (leadDays === 1) {
    return wasteTexts.oneDayBefore;
  }

  return `${leadDays} ${wasteTexts.xDaysBefore}`;
};

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
    width: normalize(136)
  },
  flexibleReminderListItem: {
    paddingLeft: normalize(28)
  },
  flexibleReminderHeading: {
    paddingBottom: normalize(4),
    paddingLeft: normalize(28),
    paddingTop: normalize(10)
  },
  flexibleTimeContainer: {
    marginRight: 0
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
  saveButtonContainer: {
    alignSelf: 'center',
    position: 'absolute',
    width: '100%'
  },
  spacer: {
    height: normalize(70)
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
  tooltipContent: {
    padding: normalize(10)
  },
  tooltipScrollView: {
    maxHeight: normalize(260)
  },
  tooltipSelection: {
    paddingVertical: normalize(2)
  },
  tooltipTouchableArea: {
    alignSelf: 'stretch'
  }
});
