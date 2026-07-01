import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
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
import {
  buildDefaultReminderSettingsByType,
  buildReminderServerSyncRegistrations
} from '../helpers/wasteReminderRegistrationHelper';
import { formatTime, saveWasteReminderSettings, storageHelper } from '../helpers';
import { formatWasteReminderTime } from '../helpers/wasteReminderTimeHelper';
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
  getInAppPermission,
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
  storeWasteReminderSettingsWithoutScheduling,
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
import { ScreenName, WasteReminderSettingJson, WasteTypeData } from '../types';

const keyExtractor = (item: string, index: number) => `index${index}-${item}`;
const compareAlphabetically = (left: string, right: string) => left.localeCompare(right);
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

type WasteCollectionSettingsViewState = 'loading' | 'suggestions' | 'settings' | 'empty';

type WasteCollectionSettingsViewStateParams = {
  hasSelectedStreet: boolean;
  hasStreetSuggestions: boolean;
  isLoading: boolean;
  isStreetSelected: boolean;
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

export const getWasteCollectionSettingsViewState = ({
  hasSelectedStreet,
  hasStreetSuggestions,
  isLoading,
  isStreetSelected
}: WasteCollectionSettingsViewStateParams): WasteCollectionSettingsViewState => {
  if (isLoading) {
    return 'loading';
  }

  if (hasStreetSuggestions && !isStreetSelected) {
    return 'suggestions';
  }

  if (hasSelectedStreet) {
    return 'settings';
  }

  return 'empty';
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
  const [isInAppPushEnabled, setIsInAppPushEnabled] = useState(true);
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
  const effectiveStreetName =
    streetName || (selectedStreetId === waste.streetId ? waste.streetName : undefined);
  const areWasteReminderControlsDisabled = !isInAppPushEnabled;
  const { filterStreets } = useFilterStreets('', false);
  const tooltipRef = useRef<TooltipRef | null>(null);
  const openNotificationSettings = useCallback(() => {
    navigation.navigate(ScreenName.Settings);
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      getInAppPermission().then((permission) => {
        if (isActive) {
          setIsInAppPushEnabled(permission);
        }
      });

      return () => {
        isActive = false;
      };
    }, [])
  );

  const applyInitialStoredSettingsFallback = useCallback(async () => {
    dispatch({ type: WasteSettingsActions.setInitialWasteSettings, payload: usedTypeKeys });

    if (usedTypes) {
      dispatch({
        type: WasteSettingsActions.setReminderSettingsByType,
        payload: buildDefaultReminderSettingsByType(usedTypes)
      });
    }

    const permission = await getLocalNotificationPermission();

    if (permission) {
      dispatch({ type: WasteSettingsActions.setNotificationsEnabled, payload: true });
    }
  }, [usedTypeKeys, usedTypes]);

  const loadStoredSettingsFromServer = useCallback(async () => {
    if (isInitial) return;

    setLoadingStoredSettings(true);

    const localReminderState = await readWasteReminderLocalState();
    const localServerSyncPayload = localReminderState?.serverSyncPayload;
    const localLocation = localServerSyncPayload?.locationData;
    const localStreetName = localLocation ? getStreetString(localLocation) : undefined;

    if (localServerSyncPayload && localStreetName && localStreetName === effectiveStreetName) {
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
          notificationSettings: localServerSyncPayload.notificationSettings,
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

    const storedSettingsOnServer =
      (await getReminderSettings())?.map((setting: WasteReminderSettingJson) => ({
        ...setting,
        street: getStreetString(setting),
        // Replace null values with empty strings for city and zip in storedSettings to prevent
        // validation issues
        city: setting.city ?? '',
        zip: setting.zip ?? ''
      })) ?? [];

    if (!areValidReminderSettings(storedSettingsOnServer)) {
      Alert.alert(texts.errors.errorTitle, texts.errors.noData);
      await applyInitialStoredSettingsFallback();
      setLoadingStoredSettings(false);
      return;
    }

    if (waste.streetId !== selectedStreetId) {
      await applyInitialStoredSettingsFallback();
    } else {
      const streetSettings = storedSettingsOnServer.filter(
        (item) => item.street === effectiveStreetName
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

    setLoadingStoredSettings(false);
  }, [
    getStreetString,
    isInitial,
    waste.streetId,
    waste.streetName,
    waste.selectedTypeKeys,
    reminderUiMode,
    streetName,
    effectiveStreetName,
    selectedStreetId,
    usedTypeKeys,
    usedTypes,
    applyInitialStoredSettingsFallback
  ]);

  const updateSettings = useCallback(
    async (
      localCoverageUntil?: Date,
      reminderSyncRegistrations?: WasteReminderServerSyncRegistration[]
    ) => {
      if (!isInAppPushEnabled) {
        return;
      }

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
    [
      usedTypeKeys,
      activeTypes,
      notificationSettings,
      locationData,
      onDayBefore,
      reminderTime,
      isInAppPushEnabled
    ]
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

    if (!isInAppPushEnabled) {
      await storeWasteReminderSettingsWithoutScheduling({
        activeReminderRegistrations: reminderSyncRegistrations,
        activeTypes,
        locationData,
        notificationSettings,
        onDayBefore,
        reminderTime,
        usedTypeKeys
      });

      return {
        reminderSyncRegistrations,
        localCoverageUntil: undefined
      };
    }

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
    usedTypes,
    isInAppPushEnabled
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
    if (!usedTypes || loadedStoredSettingsInitially) {
      return;
    }

    dispatch({ type: WasteSettingsActions.setInitialWasteSettings, payload: usedTypeKeys });
    dispatch({
      type: WasteSettingsActions.setReminderSettingsByType,
      payload: buildDefaultReminderSettingsByType(usedTypes)
    });
  }, [loadedStoredSettingsInitially, usedTypes, usedTypeKeys]);

  // Use this ref to prevent the useEffect from running multiple times
  const hasStartedLoadingStoredSettingsFromServer = useRef(false);

  useEffect(() => {
    const asyncLoadStoredSettingsFromServer = async () => {
      if (
        !hasStartedLoadingStoredSettingsFromServer.current &&
        !loadedStoredSettingsInitially &&
        !_isEmpty(typeSettings) &&
        (!!effectiveStreetName || waste.streetId !== selectedStreetId)
      ) {
        hasStartedLoadingStoredSettingsFromServer.current = true;
        await loadStoredSettingsFromServer();
        setLoadedStoredSettingsInitially(true);
      }
    };

    asyncLoadStoredSettingsFromServer();
  }, [
    effectiveStreetName,
    loadStoredSettingsFromServer,
    loadedStoredSettingsInitially,
    selectedStreetId,
    typeSettings,
    waste.streetId
  ]);

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
          value: formatWasteReminderTime(newTime)
        }
      });
    },
    [activeFlexibleTimePicker]
  );

  const setFlexibleLeadDays = useCallback((typeKey: string, slotId: string, value: number) => {
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

  const viewState = getWasteCollectionSettingsViewState({
    hasSelectedStreet: !!selectedStreetId,
    hasStreetSuggestions: !!inputValue,
    isLoading: loading || typesLoading || streetLoading || !loadedStoredSettingsInitially,
    isStreetSelected
  });

  if (viewState === 'loading') {
    return <LoadingSpinner loading />;
  }

  if (viewState === 'suggestions') {
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

  if (viewState === 'settings') {
    return (
      <SelectedStreetSettingsContent
        activeFlexibleSlotTime={activeFlexibleSlotTime}
        activeFlexibleTimePicker={activeFlexibleTimePicker}
        areWasteReminderControlsDisabled={areWasteReminderControlsDisabled}
        isSavingSettings={isSavingSettings}
        loadingStoredSettings={loadingStoredSettings}
        locationData={locationData}
        navigationType={navigationType}
        notificationSettings={notificationSettings}
        onDatePickerChange={onDatePickerChange}
        onFlexibleDatePickerChange={onFlexibleDatePickerChange}
        onPressUpdateOnDayBefore={onPressUpdateOnDayBefore}
        onSaveSettings={saveSettings}
        onToggleNotifications={async () => {
          if (areWasteReminderControlsDisabled) {
            return;
          }

          if (!isPushPermissionGranted) {
            const hasPermission = await requestLocalNotificationPermission();

            if (!hasPermission) {
              showSystemPermissionMissingDialog();
              return;
            }

            setIsPushPermissionGranted(true);
          }

          if (!showNotificationSettings) {
            let hasPushToken = false;

            try {
              hasPushToken = await setInAppPermission(true);
            } catch (error) {
              console.warn('Failed to enable in-app waste reminder permission:', error);
            }

            if (!hasPushToken) {
              showSystemPermissionMissingDialog();
              return;
            }
          }

          dispatch({ type: WasteSettingsActions.toggleNotifications });
        }}
        openNotificationSettings={openNotificationSettings}
        reminderSettingsByType={reminderSettingsByType}
        reminderTime={reminderTime}
        reminderUiMode={reminderUiMode}
        selectedTypeKeys={selectedTypeKeys}
        setActiveFlexibleTimePicker={setActiveFlexibleTimePicker}
        setFlexibleLeadDays={setFlexibleLeadDays}
        setShowDatePicker={setShowDatePicker}
        showDatePicker={showDatePicker}
        showNotificationSettings={showNotificationSettings}
        streetName={streetName}
        tooltipRef={tooltipRef}
        typeSettings={typeSettings}
        usedTypeKeys={usedTypeKeys}
        usedTypes={usedTypes}
        wasteTexts={wasteTexts}
        onRefreshStoredSettings={loadStoredSettingsFromServer}
        onToggleNotificationSetting={(typeKey, value) => {
          dispatch({
            type: WasteSettingsActions.setNotificationSetting,
            payload: { key: typeKey, value }
          });
        }}
        onToggleTypeSetting={(typeKey, value) => {
          dispatch({
            type: WasteSettingsActions.setTypeSetting,
            payload: { key: typeKey, value }
          });
        }}
        onDayBefore={onDayBefore}
      />
    );
  }

  return null;
};
/* eslint-enable complexity */

type SelectedStreetSettingsContentProps = {
  activeFlexibleSlotTime?: string;
  activeFlexibleTimePicker?: { slotId: string; typeKey: string };
  areWasteReminderControlsDisabled: boolean;
  isSavingSettings: boolean;
  loadingStoredSettings: boolean;
  locationData?: { [key: string]: unknown };
  navigationType: string;
  notificationSettings: { [key: string]: boolean };
  onDatePickerChange: (_: unknown, newTime?: Date) => void;
  onFlexibleDatePickerChange: (_: unknown, newTime?: Date) => void;
  onPressUpdateOnDayBefore: (value: boolean) => void;
  onRefreshStoredSettings: () => Promise<void>;
  onSaveSettings: () => Promise<void>;
  onToggleNotifications: () => Promise<void>;
  onToggleNotificationSetting: (typeKey: string, value: boolean) => void;
  onToggleTypeSetting: (typeKey: string, value: boolean) => void;
  onDayBefore: boolean;
  openNotificationSettings: () => void;
  reminderSettingsByType: WasteReminderSettingsByType;
  reminderTime: Date;
  reminderUiMode: ReturnType<typeof getWasteReminderUiMode>;
  selectedTypeKeys: string[];
  setActiveFlexibleTimePicker: React.Dispatch<
    React.SetStateAction<{ slotId: string; typeKey: string } | undefined>
  >;
  setFlexibleLeadDays: (typeKey: string, slotId: string, value: number) => void;
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  showDatePicker: boolean;
  showNotificationSettings: boolean;
  streetName?: string;
  tooltipRef: React.MutableRefObject<TooltipRef | null>;
  typeSettings: { [key: string]: boolean };
  usedTypeKeys: string[];
  usedTypes?: WasteTypeData;
  wasteTexts: { [key: string]: string };
};

const SelectedStreetSettingsContent = ({
  activeFlexibleSlotTime,
  activeFlexibleTimePicker,
  areWasteReminderControlsDisabled,
  isSavingSettings,
  loadingStoredSettings,
  locationData,
  navigationType,
  notificationSettings,
  onDatePickerChange,
  onFlexibleDatePickerChange,
  onPressUpdateOnDayBefore,
  onRefreshStoredSettings,
  onSaveSettings,
  onToggleNotifications,
  onToggleNotificationSetting,
  onToggleTypeSetting,
  onDayBefore,
  openNotificationSettings,
  reminderSettingsByType,
  reminderTime,
  reminderUiMode,
  selectedTypeKeys,
  setActiveFlexibleTimePicker,
  setFlexibleLeadDays,
  setShowDatePicker,
  showDatePicker,
  showNotificationSettings,
  streetName,
  tooltipRef,
  typeSettings,
  usedTypeKeys,
  usedTypes,
  wasteTexts
}: SelectedStreetSettingsContentProps) => (
  <SafeAreaViewFlex>
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loadingStoredSettings}
          onRefresh={() => onRefreshStoredSettings()}
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
      {!!usedTypeKeys?.length && !!usedTypes && !_isEmpty(typeSettings) && (
        <WasteTypeSelectionList
          onToggleTypeSetting={onToggleTypeSetting}
          typeSettings={typeSettings}
          usedTypeKeys={usedTypeKeys}
          usedTypes={usedTypes}
          wasteTexts={wasteTexts}
        />
      )}
      <ReminderSettingsPanel
        activeFlexibleSlotTime={activeFlexibleSlotTime}
        activeFlexibleTimePicker={activeFlexibleTimePicker}
        areWasteReminderControlsDisabled={areWasteReminderControlsDisabled}
        notificationSettings={notificationSettings}
        onDatePickerChange={onDatePickerChange}
        onFlexibleDatePickerChange={onFlexibleDatePickerChange}
        onPressUpdateOnDayBefore={onPressUpdateOnDayBefore}
        onToggleNotifications={onToggleNotifications}
        onToggleNotificationSetting={onToggleNotificationSetting}
        onDayBefore={onDayBefore}
        openNotificationSettings={openNotificationSettings}
        reminderSettingsByType={reminderSettingsByType}
        reminderTime={reminderTime}
        reminderUiMode={reminderUiMode}
        selectedTypeKeys={selectedTypeKeys}
        setActiveFlexibleTimePicker={setActiveFlexibleTimePicker}
        setFlexibleLeadDays={setFlexibleLeadDays}
        setShowDatePicker={setShowDatePicker}
        showDatePicker={showDatePicker}
        showNotificationSettings={showNotificationSettings}
        tooltipRef={tooltipRef}
        usedTypes={usedTypes}
        wasteTexts={wasteTexts}
      />

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
          onPress={isSavingSettings ? undefined : onSaveSettings}
          title={wasteTexts.save}
        />
      </Wrapper>
    </View>
  </SafeAreaViewFlex>
);

type LegacyGlobalReminderSettingsProps = {
  areWasteReminderControlsDisabled: boolean;
  notificationSettings: { [key: string]: boolean };
  onDatePickerChange: (_: unknown, newTime?: Date) => void;
  onDayBefore: boolean;
  onPressUpdateOnDayBefore: (value: boolean) => void;
  onToggleNotificationSetting: (typeKey: string, value: boolean) => void;
  reminderTime: Date;
  selectedTypeKeys: string[];
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  showDatePicker: boolean;
  tooltipRef: React.MutableRefObject<TooltipRef | null>;
  usedTypes?: WasteTypeData;
  wasteTexts: { [key: string]: string };
};

const LegacyGlobalReminderSettings = ({
  areWasteReminderControlsDisabled,
  notificationSettings,
  onDatePickerChange,
  onDayBefore,
  onPressUpdateOnDayBefore,
  onToggleNotificationSetting,
  reminderTime,
  selectedTypeKeys,
  setShowDatePicker,
  showDatePicker,
  tooltipRef,
  usedTypes,
  wasteTexts
}: LegacyGlobalReminderSettingsProps) => (
  <>
    <WrapperHorizontal>
      <Divider style={styles.divider} />
      <LegacyDayBeforeSelector
        areWasteReminderControlsDisabled={areWasteReminderControlsDisabled}
        onDayBefore={onDayBefore}
        onPressUpdateOnDayBefore={onPressUpdateOnDayBefore}
        tooltipRef={tooltipRef}
        wasteTexts={wasteTexts}
      />
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
        <TouchableOpacity
          disabled={areWasteReminderControlsDisabled}
          onPress={areWasteReminderControlsDisabled ? undefined : () => setShowDatePicker(true)}
        >
          <View
            style={[
              styles.smallBorderRadius,
              styles.timeContainer,
              areWasteReminderControlsDisabled && styles.disabledControl
            ]}
          >
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
            <DateTimePicker mode="time" onChange={onDatePickerChange} value={reminderTime} />
          </View>
        )}
      </ListItem>
      <Divider style={styles.divider} />
    </WrapperHorizontal>
    {!!selectedTypeKeys?.length && !!usedTypes && !_isEmpty(notificationSettings) && (
      <LegacyNotificationTypeList
        areWasteReminderControlsDisabled={areWasteReminderControlsDisabled}
        notificationSettings={notificationSettings}
        onToggleNotificationSetting={onToggleNotificationSetting}
        selectedTypeKeys={selectedTypeKeys}
        usedTypes={usedTypes}
      />
    )}
  </>
);

type WasteTypeSelectionListProps = {
  onToggleTypeSetting: (typeKey: string, value: boolean) => void;
  typeSettings: { [key: string]: boolean };
  usedTypeKeys: string[];
  usedTypes: WasteTypeData;
  wasteTexts: { [key: string]: string };
};

const WasteTypeSelectionList = ({
  onToggleTypeSetting,
  typeSettings,
  usedTypeKeys,
  usedTypes,
  wasteTexts
}: WasteTypeSelectionListProps) => (
  <WrapperVertical style={[styles.paddingHorizontal]}>
    <WrapperVertical style={styles.mediumPaddingVertical}>
      <RegularText big>{wasteTexts.chooseCategory}</RegularText>
    </WrapperVertical>
    <View style={styles.borderRadius}>
      {[...usedTypeKeys].sort(compareAlphabetically).map((item, index, sortedUsedTypeKeys) => (
        <ListItem
          key={keyExtractor(item, index)}
          bottomDivider={index < sortedUsedTypeKeys.length - 1}
          containerStyle={styles.listItemContainer}
          accessibilityLabel={`(${usedTypes[item].label}) ${consts.a11yLabel.button}`}
        >
          <ListItem.Content>{renderWasteTypeLabel(usedTypes[item])}</ListItem.Content>
          <Switch
            isDisabled={false}
            switchValue={typeSettings[item]}
            toggleSwitch={() => onToggleTypeSetting(item, !typeSettings[item])}
          />
        </ListItem>
      ))}
    </View>
  </WrapperVertical>
);

type ReminderSettingsPanelProps = {
  activeFlexibleSlotTime?: string;
  activeFlexibleTimePicker?: { slotId: string; typeKey: string };
  areWasteReminderControlsDisabled: boolean;
  notificationSettings: { [key: string]: boolean };
  onDatePickerChange: (_: unknown, newTime?: Date) => void;
  onFlexibleDatePickerChange: (_: unknown, newTime?: Date) => void;
  onPressUpdateOnDayBefore: (value: boolean) => void;
  onToggleNotifications: () => Promise<void>;
  onToggleNotificationSetting: (typeKey: string, value: boolean) => void;
  onDayBefore: boolean;
  openNotificationSettings: () => void;
  reminderSettingsByType: WasteReminderSettingsByType;
  reminderTime: Date;
  reminderUiMode: ReturnType<typeof getWasteReminderUiMode>;
  selectedTypeKeys: string[];
  setActiveFlexibleTimePicker: React.Dispatch<
    React.SetStateAction<{ slotId: string; typeKey: string } | undefined>
  >;
  setFlexibleLeadDays: (typeKey: string, slotId: string, value: number) => void;
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  showDatePicker: boolean;
  showNotificationSettings: boolean;
  tooltipRef: React.MutableRefObject<TooltipRef | null>;
  usedTypes?: WasteTypeData;
  wasteTexts: { [key: string]: string };
};

const ReminderSettingsPanel = ({
  activeFlexibleSlotTime,
  activeFlexibleTimePicker,
  areWasteReminderControlsDisabled,
  notificationSettings,
  onDatePickerChange,
  onFlexibleDatePickerChange,
  onPressUpdateOnDayBefore,
  onToggleNotifications,
  onToggleNotificationSetting,
  onDayBefore,
  openNotificationSettings,
  reminderSettingsByType,
  reminderTime,
  reminderUiMode,
  selectedTypeKeys,
  setActiveFlexibleTimePicker,
  setFlexibleLeadDays,
  setShowDatePicker,
  showDatePicker,
  showNotificationSettings,
  tooltipRef,
  usedTypes,
  wasteTexts
}: ReminderSettingsPanelProps) => (
  <>
    <Wrapper style={[styles.noPaddingBottom, styles.paddingHorizontal]}>
      <WrapperVertical style={styles.mediumPaddingVertical}>
        <RegularText big>{wasteTexts.reminders}</RegularText>
      </WrapperVertical>
      {areWasteReminderControlsDisabled && (
        <WrapperVertical style={styles.pushDisabledHint}>
          <RegularText small placeholder>
            {wasteTexts.notificationsDisabledHint}
          </RegularText>
          <TouchableOpacity onPress={openNotificationSettings}>
            <RegularText small primary underline>
              {wasteTexts.notificationSettingsLink}
            </RegularText>
          </TouchableOpacity>
        </WrapperVertical>
      )}
      <ListItem
        containerStyle={[styles.borderRadius, styles.listItemContainer]}
        accessibilityLabel={`(${wasteTexts.notificationsOn}) ${consts.a11yLabel.button}`}
      >
        <ListItem.Content>
          <BoldText small>{wasteTexts.notificationsOn}</BoldText>
        </ListItem.Content>
        <Switch
          isDisabled={areWasteReminderControlsDisabled}
          switchValue={showNotificationSettings}
          toggleSwitch={onToggleNotifications}
        />
      </ListItem>
    </Wrapper>
    <Collapsible collapsed={!showNotificationSettings}>
      {reminderUiMode === 'legacy-global' && (
        <LegacyGlobalReminderSettings
          areWasteReminderControlsDisabled={areWasteReminderControlsDisabled}
          notificationSettings={notificationSettings}
          onDatePickerChange={onDatePickerChange}
          onDayBefore={onDayBefore}
          onPressUpdateOnDayBefore={onPressUpdateOnDayBefore}
          onToggleNotificationSetting={onToggleNotificationSetting}
          reminderTime={reminderTime}
          selectedTypeKeys={selectedTypeKeys}
          setShowDatePicker={setShowDatePicker}
          showDatePicker={showDatePicker}
          tooltipRef={tooltipRef}
          usedTypes={usedTypes}
          wasteTexts={wasteTexts}
        />
      )}
      {reminderUiMode === 'flexible-per-type' && !!usedTypes && !!selectedTypeKeys?.length && (
        <FlexiblePerTypeReminderSettings
          activeFlexibleTimePicker={activeFlexibleTimePicker}
          areWasteReminderControlsDisabled={areWasteReminderControlsDisabled}
          notificationSettings={notificationSettings}
          onFlexibleDatePickerChange={onFlexibleDatePickerChange}
          onToggleNotificationSetting={onToggleNotificationSetting}
          reminderSettingsByType={reminderSettingsByType}
          selectedTypeKeys={selectedTypeKeys}
          setActiveFlexibleTimePicker={setActiveFlexibleTimePicker}
          setFlexibleLeadDays={setFlexibleLeadDays}
          usedTypes={usedTypes}
          wasteTexts={wasteTexts}
        />
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
  </>
);

type LegacyDayBeforeSelectorProps = {
  areWasteReminderControlsDisabled: boolean;
  onDayBefore: boolean;
  onPressUpdateOnDayBefore: (value: boolean) => void;
  tooltipRef: React.MutableRefObject<TooltipRef | null>;
  wasteTexts: { [key: string]: string };
};

const LegacyDayBeforeSelector = ({
  areWasteReminderControlsDisabled,
  onDayBefore,
  onPressUpdateOnDayBefore,
  tooltipRef,
  wasteTexts
}: LegacyDayBeforeSelectorProps) => (
  <ListItem
    bottomDivider
    containerStyle={[styles.borderRadiusTop, styles.listItemContainer]}
    accessibilityLabel={`(${wasteTexts.daysBefore}) ${consts.a11yLabel.button}`}
  >
    <ListItem.Content>
      <BoldText small>{wasteTexts.daysBefore}</BoldText>
    </ListItem.Content>
    {areWasteReminderControlsDisabled ? (
      <WrapperRow itemsCenter>
        <RegularText small placeholder style={{ paddingVertical: normalize(4.85) }}>
          {onDayBefore ? wasteTexts.oneDayBefore : wasteTexts.sameDay}{' '}
        </RegularText>
        <Icon.KeyboardArrowUpDown size={normalize(14)} />
      </WrapperRow>
    ) : (
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
    )}
  </ListItem>
);

type LegacyNotificationTypeListProps = {
  areWasteReminderControlsDisabled: boolean;
  notificationSettings: { [key: string]: boolean };
  onToggleNotificationSetting: (typeKey: string, value: boolean) => void;
  selectedTypeKeys: string[];
  usedTypes: WasteTypeData;
};

const LegacyNotificationTypeList = ({
  areWasteReminderControlsDisabled,
  notificationSettings,
  onToggleNotificationSetting,
  selectedTypeKeys,
  usedTypes
}: LegacyNotificationTypeListProps) => (
  <WrapperHorizontal>
    <View style={styles.borderRadius}>
      {selectedTypeKeys
        .filter((key) => usedTypes[key])
        .sort(compareAlphabetically)
        .map((item, index, filteredSelectedTypeKeys) => (
          <ListItem
            key={keyExtractor(item, index)}
            bottomDivider={index < filteredSelectedTypeKeys.length - 1}
            containerStyle={styles.listItemContainer}
            accessibilityLabel={`(${usedTypes[item].label}) ${consts.a11yLabel.button}`}
          >
            <ListItem.Content>{renderWasteTypeLabel(usedTypes[item])}</ListItem.Content>
            <Switch
              isDisabled={areWasteReminderControlsDisabled}
              switchValue={notificationSettings[item]}
              toggleSwitch={() =>
                areWasteReminderControlsDisabled
                  ? undefined
                  : onToggleNotificationSetting(item, !notificationSettings[item])
              }
            />
          </ListItem>
        ))}
    </View>
  </WrapperHorizontal>
);

type FlexiblePerTypeReminderSettingsProps = {
  activeFlexibleTimePicker?: { slotId: string; typeKey: string };
  areWasteReminderControlsDisabled: boolean;
  notificationSettings: { [key: string]: boolean };
  onFlexibleDatePickerChange: (_: unknown, newTime?: Date) => void;
  onToggleNotificationSetting: (typeKey: string, value: boolean) => void;
  reminderSettingsByType: WasteReminderSettingsByType;
  selectedTypeKeys: string[];
  setActiveFlexibleTimePicker: React.Dispatch<
    React.SetStateAction<{ slotId: string; typeKey: string } | undefined>
  >;
  setFlexibleLeadDays: (typeKey: string, slotId: string, value: number) => void;
  usedTypes: WasteTypeData;
  wasteTexts: { [key: string]: string };
};

const FlexiblePerTypeReminderSettings = ({
  activeFlexibleTimePicker,
  areWasteReminderControlsDisabled,
  notificationSettings,
  onFlexibleDatePickerChange,
  onToggleNotificationSetting,
  reminderSettingsByType,
  selectedTypeKeys,
  setActiveFlexibleTimePicker,
  setFlexibleLeadDays,
  usedTypes,
  wasteTexts
}: FlexiblePerTypeReminderSettingsProps) => (
  <WrapperHorizontal>
    {selectedTypeKeys
      .filter((key) => usedTypes[key])
      .sort(compareAlphabetically)
      .map((typeKey) => {
        const normalizedSlots = normalizePushReminderSlots(usedTypes[typeKey]);
        const isPushReminderEnabled = normalizedSlots.slots.length > 0;
        const isNotificationEnabled = isPushReminderEnabled && !!notificationSettings[typeKey];
        const isTypeReminderDisabled = !isPushReminderEnabled || areWasteReminderControlsDisabled;
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
              <ListItem.Content>{renderWasteTypeLabel(usedTypes[typeKey])}</ListItem.Content>
              <Switch
                isDisabled={isTypeReminderDisabled}
                switchValue={isNotificationEnabled}
                toggleSwitch={() =>
                  isTypeReminderDisabled
                    ? undefined
                    : onToggleNotificationSetting(typeKey, !isNotificationEnabled)
                }
              />
            </ListItem>
            <Collapsible collapsed={!isNotificationEnabled || !configuredSlots.length}>
              {configuredSlots.map((slot, slotIndex) => {
                const slotSetting = reminderSettingsByType[typeKey]?.reminders[slot.id];

                if (!slotSetting) {
                  return null;
                }

                const tooltipHeight = normalize(Math.min(260, 34 * (slot.maxLeadDays + 1)));

                return (
                  <View key={`${typeKey}-${slot.id}`}>
                    {configuredSlots.length > 1 && (
                      <View
                        style={[
                          styles.flexibleReminderHeading,
                          slotIndex !== 0 && { paddingTop: normalize(8) }
                        ]}
                      >
                        <RegularText smallest>{`${slotIndex + 1}. ${
                          wasteTexts.reminder
                        }`}</RegularText>
                      </View>
                    )}
                    <ListItem
                      containerStyle={[styles.flexibleReminderListItem, styles.listItemContainer]}
                      accessibilityLabel={`(${wasteTexts.daysBefore}) ${consts.a11yLabel.button}`}
                    >
                      <ListItem.Content>
                        <BoldText small>{wasteTexts.daysBefore}</BoldText>
                      </ListItem.Content>
                      <FlexibleLeadDaysTooltip
                        isDisabled={areWasteReminderControlsDisabled}
                        maxLeadDays={slot.maxLeadDays}
                        onSelectLeadDays={setFlexibleLeadDays}
                        selectedLeadDays={slotSetting.leadDays}
                        slotId={slot.id}
                        tooltipHeight={tooltipHeight}
                        typeKey={typeKey}
                        wasteTexts={wasteTexts}
                      />
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
                        disabled={areWasteReminderControlsDisabled}
                        onPress={
                          areWasteReminderControlsDisabled
                            ? undefined
                            : () => setActiveFlexibleTimePicker({ slotId: slot.id, typeKey })
                        }
                      >
                        <View
                          style={[
                            styles.smallBorderRadius,
                            styles.timeContainer,
                            styles.flexibleTimeContainer,
                            areWasteReminderControlsDisabled && styles.disabledControl
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

const formatDateAsReminderTime = (date: Date) => formatWasteReminderTime(date);

const formatReminderTimeString = (time: string) => formatTime(buildReminderTimeDate(time));

const getLeadDayOptions = (maxLeadDays: number) =>
  Array.from({ length: maxLeadDays + 1 }, (_, index) => index);

type FlexibleLeadDaysTooltipProps = {
  isDisabled?: boolean;
  maxLeadDays: number;
  onSelectLeadDays: (typeKey: string, slotId: string, value: number) => void;
  selectedLeadDays: number;
  slotId: string;
  tooltipHeight: number;
  typeKey: string;
  wasteTexts: { [key: string]: string };
};

const FlexibleLeadDaysTooltip = ({
  isDisabled = false,
  maxLeadDays,
  onSelectLeadDays,
  selectedLeadDays,
  slotId,
  tooltipHeight,
  typeKey,
  wasteTexts
}: FlexibleLeadDaysTooltipProps) => {
  const tooltipRef = useRef<TooltipRef | null>(null);
  const selectLeadDays = useCallback(
    (leadDays: number) => {
      tooltipRef.current?.toggleTooltip();
      onSelectLeadDays(typeKey, slotId, leadDays);
    },
    [onSelectLeadDays, slotId, typeKey]
  );

  if (isDisabled) {
    return (
      <WrapperRow itemsCenter>
        <RegularText small placeholder>
          {getLeadDaysLabel(selectedLeadDays, wasteTexts)}{' '}
        </RegularText>
        <Icon.KeyboardArrowUpDown size={normalize(14)} />
      </WrapperRow>
    );
  }

  return (
    <Tooltip
      ref={tooltipRef}
      backgroundColor={colors.surface}
      containerStyle={[styles.borderRadius, styles.tooltipContainer]}
      height={tooltipHeight}
      popover={
        <TouchableWithoutFeedback onPress={(event) => event.stopPropagation()}>
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
                y: getFlexibleLeadDaysTooltipScrollY(selectedLeadDays, maxLeadDays, tooltipHeight)
              }}
              directionalLockEnabled
              horizontal={false}
              showsVerticalScrollIndicator={false}
              style={styles.tooltipScrollView}
            >
              {getLeadDayOptions(maxLeadDays).map((leadDays) => (
                <Fragment key={`${slotId}-${leadDays}`}>
                  <TouchableOpacity onPress={() => selectLeadDays(leadDays)}>
                    <RegularText
                      primary={selectedLeadDays === leadDays}
                      style={styles.tooltipSelection}
                    >
                      {getLeadDaysLabel(leadDays, wasteTexts)}
                    </RegularText>
                  </TouchableOpacity>
                  {leadDays < maxLeadDays && <Divider style={styles.dividerSmall} />}
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
          {getLeadDaysLabel(selectedLeadDays, wasteTexts)}{' '}
        </RegularText>
        <Icon.KeyboardArrowUpDown size={normalize(14)} />
      </WrapperRow>
    </Tooltip>
  );
};

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
  disabledControl: {
    opacity: 0.45
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
  pushDisabledHint: {
    paddingBottom: normalize(10)
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
