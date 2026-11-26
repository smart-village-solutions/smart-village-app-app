import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { decodeHTMLStrict } from 'entities';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  DeviceEventEmitter,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { Divider, ListItem } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from 'react-query';

import { Icon, consts, normalize, texts } from '../config';
import { SETTINGS_SCREENS } from '../config/settingsScreens';
import { parseListItemsFromQuery } from '../helpers';
import {
  CategorySubscription,
  EventReminderModes,
  EventReminderSettingsState,
  defaultEventReminderRule,
  previewCategoryReminders,
  summarizeCategoryPlan
} from '../helpers/eventReminderPlan';
import {
  EVENT_REMINDER_TIME_ZONE,
  EventOccurrence,
  EventReminderCategory,
  EventReminderListDetails,
  EventReminderRule,
  RelativeEventReminderRule,
  eventLocalTimestamp,
  eventOccurrenceKey,
  getEventOccurrences,
  getEventReminderCategories,
  getEventLocalDateTime,
  getReminderTimestamp,
  isValidReminderTimestamp,
  occurrenceEndForReminders,
  shiftEventCalendarDate
} from '../helpers/eventReminderTime';
import { useTheme } from '../hooks/useTheme';
import { NetworkContext } from '../NetworkProvider';
import {
  EVENT_REMINDERS_CHANGED,
  SingleEventReminder,
  getEventReminderModes,
  getEventReminderPermission,
  pauseEventCategorySubscription,
  pauseEventReminder,
  readEventReminderSettings,
  removeEventCategorySubscription,
  removeEventReminder,
  saveEventCategorySubscription,
  saveEventReminder,
  setEventCategoryExclusion
} from '../pushNotifications/EventReminderLocalNotifications';
import {
  fetchEventCategorySnapshot,
  fetchEventReminderCategories
} from '../queries/eventReminderRecords';
import { QUERY_TYPES } from '../queries/types';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';

import { Button } from './Button';
import { Input } from './form/Input';
import { ListComponent } from './ListComponent';
import { Modal } from './Modal';
import { Radiobutton } from './Radiobutton';
import { SectionHeader } from './SectionHeader';
import { SettingsToggle } from './SettingsToggle';
import { BoldText, RegularText } from './Text';
import { TextListItem } from './TextListItem';
import { Wrapper, WrapperHorizontal, WrapperRow } from './Wrapper';

const copy = texts.eventReminders;
const timeFormat = new Intl.DateTimeFormat('de-DE', {
  timeZone: EVENT_REMINDER_TIME_ZONE,
  dateStyle: 'medium',
  timeStyle: 'short'
});
const formatTime = (timestamp: number) => timeFormat.format(timestamp);
const formatDate = (date: string) => date.split('-').reverse().join('.');

const formatOccurrence = ({ date, time }: EventOccurrence) =>
  `${formatDate(date)}, ${time ?? copy.noTime}`;

const describeReminder = ({ occurrence, rule, status }: SingleEventReminder) =>
  status === 'scheduled'
    ? copy.scheduled(formatTime(getReminderTimestamp(occurrence, rule)))
    : copy[status];

const defaultRule = defaultEventReminderRule;
const presets = [
  { leadDays: 3, label: 'threeDays' },
  { leadDays: 1, label: 'oneDay' },
  { leadDays: 0, label: 'sameDay' }
] as const;

const presetRule = (occurrence: EventOccurrence, leadDays: number): EventReminderRule => {
  if (leadDays !== 0 || !occurrence.time) return { kind: 'relative', leadDays };
  const start = eventLocalTimestamp(occurrence.date, occurrence.time);
  const midnight = eventLocalTimestamp(occurrence.date, '00:00');
  const { time } = getEventLocalDateTime(Math.max(midnight, start - 60 * 60 * 1000));
  return { kind: 'relative', leadDays, time };
};

type ListNavigation = React.ComponentProps<typeof TextListItem>['navigation'];
const emptySingles: EventReminderSettingsState['singles'] = {};

const useEventReminders = ({ singleEnabled, categoryEnabled }: EventReminderModes) => {
  const [settings, setSettings] = useState<EventReminderSettingsState>();
  const [readFailed, setReadFailed] = useState(false);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    let requestId = 0;
    const read = async () => {
      const id = ++requestId;
      try {
        const records = await readEventReminderSettings();
        if (requestId === id) {
          setSettings(records);
          setReadFailed(false);
          setNow(Date.now());
        }
      } catch {
        if (requestId === id) setReadFailed(true);
      }
    };
    const listener = DeviceEventEmitter.addListener(EVENT_REMINDERS_CHANGED, () => void read());
    void read();
    return () => {
      ++requestId;
      listener.remove();
    };
  }, []);
  return {
    settings: categoryEnabled ? settings : undefined,
    reminders: (singleEnabled ? settings?.singles : undefined) ?? emptySingles,
    readFailed,
    now
  };
};

const useCategoryPreview = (
  categoryId: string | undefined,
  rule: RelativeEventReminderRule,
  now: number,
  subscription?: CategorySubscription
) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const online = Boolean(isConnected && isMainserverUp);
  const { data, isFetching } = useQuery(
    ['event-reminder-category-preview', categoryId],
    () => fetchEventCategorySnapshot(categoryId as string),
    { enabled: !!categoryId && online, retry: false, staleTime: 15000 }
  );
  const occurrences = useMemo(() => {
    if (!data) return Object.values(subscription?.occurrences ?? {});
    const matched = data.records.filter((record) =>
      getEventReminderCategories(record).some(({ id }) => id === categoryId)
    );
    return matched.flatMap(getEventOccurrences);
  }, [categoryId, data, subscription]);

  const through = data?.coverageThrough ?? subscription?.sourceCoverageThrough;
  const preview = useMemo(
    () => previewCategoryReminders(occurrences, rule, now, through),
    [occurrences, rule, now, through]
  );
  return { data, preview, isFetching, known: !!through };
};

const notifyPermissionMissing = (permission: 'system' | 'app', navigation: ListNavigation) => {
  const openSettings =
    permission === 'app'
      ? {
          text: copy.appSettings,
          onPress: () =>
            navigation.navigate(ScreenName.Settings, {
              setting: SETTINGS_SCREENS.PERSONALIZED_PUSH,
              title: texts.settingsTitles.pushNotifications
            })
        }
      : {
          text: copy.systemSettings,
          onPress: () => void Linking.openSettings().catch(() => undefined)
        };
  Alert.alert(copy.title, permission === 'app' ? copy.appPermission : copy.systemPermission, [
    { text: copy.cancel, style: 'cancel' },
    openSettings
  ]);
};

type EditorProps = {
  modes: EventReminderModes;
  occurrence?: EventOccurrence;
  reminder?: SingleEventReminder;
  details?: EventReminderListDetails;
  categories?: EventReminderCategory[];
  category?: EventReminderCategory;
  settings?: EventReminderSettingsState;
  navigation: ListNavigation;
  close: () => void;
};

const categoryTimeReference = (now: number, time = '12:00') =>
  eventLocalTimestamp(shiftEventCalendarDate(getEventLocalDateTime(now).date, 1), time);

const getSelectedPreset = (rule: EventReminderRule, picker?: 'date' | 'time') =>
  picker === 'date' || rule.kind === 'absolute' ? 'custom' : rule.leadDays;

/* The same editor keeps the preview and picker in one place for both reminder scopes. */
/* eslint-disable complexity */
const EventReminderEditor = ({
  occurrence,
  reminder,
  details,
  categories = [],
  category,
  settings,
  modes,
  navigation,
  close
}: EditorProps) => {
  const { colors, isDark } = useTheme();
  const { height } = useWindowDimensions();
  const { bottom, top } = useSafeAreaInsets();
  const scrollView = useRef<ScrollView>(null);
  const [rule, setRule] = useState(reminder?.rule ?? defaultRule);
  const [selectedCategoryMode, setCategoryMode] = useState(false);
  const categoryMode =
    !!category ||
    (modes.categoryEnabled &&
      !!categories.length &&
      (!modes.singleEnabled || selectedCategoryMode));
  const initialCategory = category ?? (categories.length === 1 ? categories[0] : undefined);
  const initialRule =
    (initialCategory && settings?.subscriptions[initialCategory.id]?.rule) ?? defaultRule;
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [categoryTime, setCategoryTime] = useState(initialRule.time);
  const [leadDays, setLeadDays] = useState(String(initialRule.leadDays));
  const [customLead, setCustomLead] = useState(
    () => !presets.some(({ leadDays }) => leadDays === initialRule.leadDays)
  );
  const [picker, setPicker] = useState<'date' | 'time'>();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();
  const [now] = useState(Date.now);
  const subscription = selectedCategory && settings?.subscriptions[selectedCategory.id];
  const currentReminder = reminder?.status === 'elapsed' ? undefined : reminder;
  const leadValid = /^\d{1,3}$/.test(leadDays) && Number(leadDays) <= 365;
  const categoryRule = useMemo<RelativeEventReminderRule>(
    () => ({
      kind: 'relative',
      leadDays: leadValid ? Number(leadDays) : 0,
      time: categoryTime
    }),
    [categoryTime, leadDays, leadValid]
  );
  const preview = useCategoryPreview(
    categoryMode ? selectedCategory?.id : undefined,
    categoryRule,
    now,
    subscription
  );
  const when =
    occurrence && !categoryMode
      ? getReminderTimestamp(occurrence, rule)
      : categoryTimeReference(now, categoryTime);
  const valid = categoryMode
    ? !!selectedCategory && leadValid
    : !!occurrence && isValidReminderTimestamp(occurrence, when, now);
  const saveLabel = !categoryMode && reminder?.status === 'paused' ? copy.resume : copy.save;
  const maxHeight = height - top - bottom - normalize(32);
  const isAndroidPickerOpen = Platform.OS === 'android' && picker !== undefined;
  const selectedPreset = categoryMode
    ? customLead
      ? 'custom'
      : Number(leadDays)
    : getSelectedPreset(rule, picker);
  const local = getEventLocalDateTime(when);
  const fields = [
    { mode: 'date', title: copy.date, label: copy.changeDate, value: formatDate(local.date) },
    { mode: 'time', title: copy.time, label: copy.changeTime, value: local.time }
  ] as const;
  const visibleFields = categoryMode
    ? fields.filter(({ mode }) => mode === 'time' && !!categoryTime)
    : fields;
  const feedback =
    message ??
    (categoryMode
      ? leadValid
        ? undefined
        : copy.categoryLeadInvalid
      : valid
      ? undefined
      : copy.invalid);
  const occurrenceKey = occurrence && eventOccurrenceKey(occurrence);
  const excluded = !!occurrenceKey && !!settings?.exclusions[occurrenceKey];
  const canExclude =
    modes.categoryEnabled &&
    !!occurrence &&
    (excluded || categories.some(({ id }) => !!settings?.subscriptions[id]));

  const togglePicker = (mode: 'date' | 'time') =>
    setPicker((current) => (current === mode ? undefined : mode));

  const chooseCategory = (category: EventReminderCategory) => {
    const next = settings?.subscriptions[category.id]?.rule ?? defaultRule;
    setSelectedCategory(category);
    setCategoryTime(next.time);
    setLeadDays(String(next.leadDays));
    setCustomLead(!presets.some(({ leadDays }) => leadDays === next.leadDays));
    setMessage(undefined);
  };

  const changeScope = (category: boolean) => {
    setCategoryMode(category);
    setPicker(undefined);
    setMessage(undefined);
  };

  const changePickedValue = (mode: 'date' | 'time', value: Date) => {
    setMessage(undefined);
    if (categoryMode) {
      setCategoryTime(getEventLocalDateTime(value.getTime()).time);
    } else if (mode === 'time' && rule.kind === 'relative') {
      setRule({ ...rule, time: getEventLocalDateTime(value.getTime()).time });
    } else {
      setRule({ kind: 'absolute', timestamp: Math.floor(value.getTime() / 60000) * 60000 });
    }
  };

  const openAndroidPicker = () => {
    if (!picker) return;
    DateTimePickerAndroid.open({
      mode: picker,
      value: new Date(Math.max(now, when)),
      timeZoneName: EVENT_REMINDER_TIME_ZONE,
      onDismiss: () => setPicker(undefined),
      onValueChange: (_, value) => {
        changePickedValue(picker, value);
        setPicker(undefined);
      }
    });
  };

  const selectPreset = (days: number) => {
    setPicker(undefined);
    setMessage(undefined);
    if (categoryMode) {
      setCustomLead(false);
      setLeadDays(String(days));
    } else if (occurrence) setRule(presetRule(occurrence, days));
  };

  const selectCustom = () => {
    if (categoryMode) setCustomLead(true);
    else togglePicker('date');
  };

  const save = async () => {
    setSaving(true);
    setMessage(undefined);
    try {
      const status =
        categoryMode && selectedCategory
          ? await saveEventCategorySubscription(selectedCategory, categoryRule, preview.data, modes)
          : occurrence
          ? await saveEventReminder(occurrence, rule, modes, details)
          : 'invalid';
      if (status === 'permission') {
        const permission = await getEventReminderPermission();
        notifyPermissionMissing(permission === 'app' ? 'app' : 'system', navigation);
      } else if (status === 'scheduled' || status === 'capacity' || status === 'saved') close();
      else setMessage(copy[status]);
    } catch {
      setMessage(copy.failed);
    } finally {
      setSaving(false);
    }
  };

  const removeLabel = categoryMode ? copy.categoryRemove : copy.remove;
  const deleteLabel = categoryMode ? copy.categoryDelete : copy.delete;
  const confirmChange = (label: string, description: string, change: () => Promise<unknown>) => {
    Alert.alert(label, description, [
      { text: copy.cancel, style: 'cancel' },
      {
        text: label,
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await change();
            close();
          } catch {
            setMessage(copy.failed);
          } finally {
            setSaving(false);
          }
        }
      }
    ]);
  };

  const remove = () => {
    if (categoryMode && selectedCategory) {
      confirmChange(removeLabel, copy.categoryConfirmRemove, () =>
        pauseEventCategorySubscription(selectedCategory.id, modes)
      );
    } else if (occurrence) {
      confirmChange(removeLabel, copy.confirmRemove, () => pauseEventReminder(occurrence, modes));
    }
  };

  const deleteReminder = () => {
    if (categoryMode && selectedCategory) {
      confirmChange(deleteLabel, copy.categoryConfirmDelete, () =>
        removeEventCategorySubscription(selectedCategory.id, modes)
      );
    } else if (occurrence) {
      confirmChange(deleteLabel, copy.confirmDelete, () => removeEventReminder(occurrence, modes));
    }
  };

  const toggleExclusion = async () => {
    if (!occurrence) return;
    setSaving(true);
    try {
      await setEventCategoryExclusion(occurrence, !excluded, modes);
      close();
    } catch {
      setMessage(copy.failed);
    } finally {
      setSaving(false);
    }
  };

  const previewCaption = () => {
    if (!categoryMode) return copy.preview(formatTime(when));
    if (!selectedCategory) return copy.selectCategory;
    if (preview.known) return copy.categoryPreviewCount(preview.preview.count);
    return preview.isFetching ? copy.categoryPreviewLoading : copy.categoryPreviewUnavailable;
  };

  const renderFooter = () => (
    <WrapperHorizontal style={styles.footer}>
      <BoldText small accessibilityLiveRegion="polite">
        {previewCaption()}
      </BoldText>
      {categoryMode && preview.known && (
        <RegularText small lighter accessibilityLiveRegion="polite">
          {preview.preview.next
            ? copy.categoryNext(formatTime(preview.preview.next))
            : copy.categoryNoNext}
        </RegularText>
      )}
      {!!feedback && (
        <RegularText small error accessibilityLiveRegion="assertive" accessibilityRole="alert">
          {feedback}
        </RegularText>
      )}
      <Button
        accessibilityHint={undefined}
        accessibilityLabel={saveLabel}
        disabled={saving || !valid}
        onPress={save}
        small={false}
        smallest={false}
        title={saveLabel}
      />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={copy.cancel}
        accessibilityState={{ disabled: saving }}
        disabled={saving}
        onPress={close}
        style={styles.footerLink}
      >
        <BoldText small primary underline>
          {copy.cancel}
        </BoldText>
      </TouchableOpacity>
    </WrapperHorizontal>
  );

  const renderInlinePicker = () =>
    picker &&
    !isAndroidPickerOpen && (
      <DateTimePicker
        key={picker}
        mode={picker}
        accessibilityLabel={picker === 'date' ? copy.changeDate : copy.changeTime}
        display="spinner"
        textColor={colors.text}
        themeVariant={isDark ? 'dark' : 'light'}
        value={new Date(when)}
        timeZoneName={EVENT_REMINDER_TIME_ZONE}
        onValueChange={(_, value) => changePickedValue(picker, value)}
      />
    );

  const renderScopeOptions = () => (
    <WrapperHorizontal style={styles.presets}>
      {!category && modes.singleEnabled && modes.categoryEnabled && !!categories.length && (
        <>
          <BoldText small>{copy.reminderScope}</BoldText>
          <View accessibilityLabel={copy.reminderScope} accessibilityRole="radiogroup">
            <Radiobutton
              containerStyle={styles.radio}
              disabled={saving}
              onPress={() => changeScope(false)}
              selected={!categoryMode}
              title={copy.singleScope}
            />
            <Radiobutton
              containerStyle={styles.radio}
              disabled={saving}
              onPress={() => changeScope(true)}
              selected={categoryMode}
              title={copy.categoryScope}
            />
          </View>
        </>
      )}
      {categoryMode && (
        <>
          {!!selectedCategory && (
            <BoldText small>{copy.categoryName(decodeHTMLStrict(selectedCategory.name))}</BoldText>
          )}
          {categories.length > 1 && (
            <View accessibilityLabel={copy.selectCategory} accessibilityRole="radiogroup">
              {categories.map((category) => (
                <Radiobutton
                  key={category.id}
                  containerStyle={styles.radio}
                  disabled={saving}
                  onPress={() => chooseCategory(category)}
                  selected={category.id === selectedCategory?.id}
                  title={decodeHTMLStrict(category.name)}
                />
              ))}
            </View>
          )}
          <RegularText small lighter>
            {copy.categoryUpdateHint}
          </RegularText>
        </>
      )}
    </WrapperHorizontal>
  );

  const renderCategoryTimeOptions = () => (
    <WrapperHorizontal style={styles.presets}>
      <BoldText small>{copy.categoryTimeMode}</BoldText>
      <View accessibilityLabel={copy.categoryTimeMode} accessibilityRole="radiogroup">
        <Radiobutton
          containerStyle={styles.radio}
          disabled={saving}
          onPress={() => {
            setCategoryTime(undefined);
            setPicker(undefined);
          }}
          selected={!categoryTime}
          title={copy.categoryStartTime}
        />
        <Radiobutton
          containerStyle={styles.radio}
          disabled={saving}
          onPress={() => setCategoryTime(categoryTime ?? '12:00')}
          selected={!!categoryTime}
          title={copy.categoryFixedTime}
        />
      </View>
    </WrapperHorizontal>
  );

  const renderRemoveAction = (label: string, onPress: () => void) => (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: saving }}
      disabled={saving}
      onPress={onPress}
      style={styles.removeLink}
    >
      <BoldText small error>
        {label}
      </BoldText>
    </TouchableOpacity>
  );

  const renderOccurrenceActions = () => (
    <>
      {(categoryMode
        ? !!subscription && !subscription.paused
        : !!currentReminder && currentReminder.status !== 'paused') &&
        renderRemoveAction(removeLabel, remove)}
      {(categoryMode ? !!subscription : !!currentReminder) &&
        renderRemoveAction(deleteLabel, deleteReminder)}
      {(!categoryMode || !modes.singleEnabled) && canExclude && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={excluded ? copy.categoryIncludeAgain : copy.categoryExclude}
          accessibilityState={{ disabled: saving }}
          disabled={saving}
          onPress={toggleExclusion}
          style={styles.removeLink}
        >
          <BoldText small primary>
            {excluded ? copy.categoryIncludeAgain : copy.categoryExclude}
          </BoldText>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <Modal
      contentStyle={[styles.dialog, { maxHeight }]}
      isBackdropPress={!saving}
      isListView={false}
      isVisible={!isAndroidPickerOpen}
      onModalHide={isAndroidPickerOpen ? openAndroidPicker : undefined}
      onModalVisible={close}
      overlayStyle={styles.overlay}
      closeButton={renderFooter()}
    >
      <SectionHeader
        title={
          categoryMode
            ? subscription
              ? copy.categoryEdit
              : copy.categoryCreate
            : reminder
            ? copy.edit
            : copy.action
        }
      />
      <ScrollView
        ref={scrollView}
        style={styles.editorScroll}
        contentContainerStyle={styles.editorContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          if (picker) scrollView.current?.scrollToEnd({ animated: false });
        }}
      >
        {!!occurrence && (
          <WrapperHorizontal style={styles.eventContext}>
            <BoldText>{occurrence.title}</BoldText>
            <RegularText small lighter>
              {formatOccurrence(occurrence)}
            </RegularText>
          </WrapperHorizontal>
        )}
        {(categoryMode || !!categories.length) && renderScopeOptions()}
        {categoryMode && !!subscription && settings && (
          <WrapperHorizontal style={styles.eventContext}>
            <RegularText small lighter accessibilityLiveRegion="polite">
              {describeCategorySubscription(subscription, settings.categoryPlan, now)}
            </RegularText>
          </WrapperHorizontal>
        )}
        {!categoryMode && !!reminder && (
          <WrapperHorizontal style={styles.eventContext}>
            <RegularText small lighter accessibilityLiveRegion="polite">
              {describeReminder(reminder)}
            </RegularText>
          </WrapperHorizontal>
        )}
        <Divider />
        <WrapperHorizontal style={styles.presets}>
          <BoldText small>{copy.leadTime}</BoldText>
          <View accessibilityLabel={copy.leadTime} accessibilityRole="radiogroup">
            {presets.map(({ label, leadDays }) => (
              <Radiobutton
                key={leadDays}
                containerStyle={styles.radio}
                disabled={saving}
                onPress={() => selectPreset(leadDays)}
                selected={selectedPreset === leadDays}
                title={copy[label]}
              />
            ))}
            <Radiobutton
              containerStyle={styles.radio}
              disabled={saving}
              onPress={selectCustom}
              selected={selectedPreset === 'custom'}
              title={copy.custom}
            />
          </View>
          {categoryMode && customLead && (
            <Input
              accessibilityLabel={copy.categoryLeadDays}
              disabled={saving}
              keyboardType="number-pad"
              label={copy.categoryLeadDays}
              name="categoryLeadDays"
              value={leadDays}
              onChangeText={(value) => {
                setMessage(undefined);
                setLeadDays(value);
              }}
            />
          )}
        </WrapperHorizontal>
        {categoryMode && renderCategoryTimeOptions()}
        <WrapperHorizontal>
          <Divider />
          {visibleFields.map(({ mode, title, label, value }) => (
            <ListItem
              key={mode}
              accessibilityLabel={`${label}, ${value}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: saving, expanded: picker === mode }}
              bottomDivider
              containerStyle={[styles.field, { backgroundColor: colors.transparent }]}
              disabled={saving}
              onPress={() => togglePicker(mode)}
              underlayColor={colors.background}
            >
              <WrapperRow itemsCenter style={styles.fieldContents}>
                <ListItem.Content>
                  <BoldText small>{title}</BoldText>
                </ListItem.Content>
                <RegularText small primary>
                  {value}
                </RegularText>
                <Icon.ArrowRight color={colors.text} size={normalize(18)} />
              </WrapperRow>
            </ListItem>
          ))}
          {renderInlinePicker()}
          {renderOccurrenceActions()}
        </WrapperHorizontal>
      </ScrollView>
      <Divider />
    </Modal>
  );
};
/* eslint-enable complexity */

export const EventReminderActions = ({
  categories,
  details,
  modes,
  listsWithoutArrows,
  navigation,
  occurrences,
  selectedOccurrenceId,
  notificationOccurrenceId
}: {
  categories: EventReminderCategory[];
  details?: EventReminderListDetails;
  modes: EventReminderModes;
  listsWithoutArrows?: boolean;
  navigation: ListNavigation;
  occurrences: EventOccurrence[];
  selectedOccurrenceId?: string | number | null;
  notificationOccurrenceId?: string;
}) => {
  const { settings, reminders, readFailed, now } = useEventReminders(modes);
  const [edited, setEdited] = useState<EventOccurrence>();
  const [choosing, setChoosing] = useState(false);
  const future = occurrences.filter(
    (occurrence) =>
      (modes.singleEnabled || !!categories.length) && occurrenceEndForReminders(occurrence) > now
  );
  const opened = occurrences.find(({ occurrenceId }) => occurrenceId === notificationOccurrenceId);
  const selected = selectOccurrence(future, notificationOccurrenceId ?? selectedOccurrenceId);
  const openWithPermission = async (open: () => void) => {
    try {
      const permission = await getEventReminderPermission();
      if (permission === 'allowed') open();
      else notifyPermissionMissing(permission, navigation);
    } catch {
      Alert.alert(copy.title, copy.failed);
    }
  };

  if (!future.length && !notificationOccurrenceId) return null;

  return (
    <View>
      {!!notificationOccurrenceId && (
        <RegularText small lighter style={styles.detailNote}>
          {opened ? copy.openedOccurrence(formatOccurrence(opened)) : copy.unavailable}
        </RegularText>
      )}
      {readFailed && (
        <RegularText small error style={styles.detailNote}>
          {copy.failed}
        </RegularText>
      )}
      {!choosing && (
        <OccurrenceReminderSummary
          listsWithoutArrows={listsWithoutArrows}
          navigation={navigation}
          occurrences={future}
          selected={selected}
          reminders={reminders}
          settings={settings}
          onSelect={() =>
            void openWithPermission(() => (selected ? setEdited(selected) : setChoosing(true)))
          }
          onChoose={() => void openWithPermission(() => setChoosing(true))}
        />
      )}
      {!!choosing && (
        <>
          <BoldText accessibilityRole="header" small style={styles.detailNote}>
            {copy.occurrence}
          </BoldText>
          <RegularText small lighter>
            {copy.selectOccurrence}
          </RegularText>
          {future.map((occurrence) => (
            <TextListItem
              key={occurrence.occurrenceId}
              item={{
                id: occurrence.occurrenceId,
                routeName: ScreenName.Detail,
                params: {},
                isHeadlineTitle: false,
                title: formatOccurrence(occurrence),
                onPress: () =>
                  void openWithPermission(() => {
                    setChoosing(false);
                    setEdited(occurrence);
                  })
              }}
              listsWithoutArrows={listsWithoutArrows}
              navigation={navigation}
            />
          ))}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={copy.cancel}
            onPress={() => setChoosing(false)}
            style={styles.detailLink}
          >
            <BoldText small primary underline>
              {copy.cancel}
            </BoldText>
          </TouchableOpacity>
        </>
      )}
      {!!edited && (
        <EventReminderEditor
          occurrence={edited}
          reminder={reminders[eventOccurrenceKey(edited)]}
          details={details}
          categories={categories}
          modes={modes}
          settings={settings}
          navigation={navigation}
          close={() => setEdited(undefined)}
        />
      )}
    </View>
  );
};

const selectOccurrence = (occurrences: EventOccurrence[], preferredId?: string | number | null) =>
  occurrences.find(({ occurrenceId }) => occurrenceId === String(preferredId)) ??
  (occurrences.length === 1 ? occurrences[0] : undefined);

const describeOccurrenceReminder = (
  key: string,
  reminder?: SingleEventReminder,
  settings?: EventReminderSettingsState
) => {
  if (reminder) return describeReminder(reminder);
  if (settings?.exclusions[key]) return copy.categoryExcluded;
  const categoryPlan = settings?.categoryPlan[key];
  if (!categoryPlan) return;
  const name = settings?.subscriptions[categoryPlan.categoryId]?.category.name;
  const when =
    categoryPlan.status === 'scheduled'
      ? copy.scheduled(formatTime(categoryPlan.when))
      : copy[categoryPlan.status];
  if (name) return copy.categoryEffective(decodeHTMLStrict(name), when);
};

const OccurrenceReminderSummary = ({
  listsWithoutArrows,
  navigation,
  occurrences,
  selected,
  reminders,
  settings,
  onSelect,
  onChoose
}: {
  listsWithoutArrows?: boolean;
  navigation: ListNavigation;
  occurrences: EventOccurrence[];
  selected?: EventOccurrence;
  reminders: EventReminderSettingsState['singles'];
  settings?: EventReminderSettingsState;
  onSelect: () => void;
  onChoose: () => void;
}) => {
  const { colors } = useTheme();
  if (!occurrences.length) return null;

  const key = selected ? eventOccurrenceKey(selected) : '';
  const title = reminders[key] ? copy.edit : copy.action;
  const status = describeOccurrenceReminder(key, reminders[key], settings);
  const actionLabel = status ? `${title}. ${status}` : title;
  return (
    <>
      {!selected &&
        occurrences.map((occurrence) => {
          const occurrenceKey = eventOccurrenceKey(occurrence);
          const description = describeOccurrenceReminder(
            occurrenceKey,
            reminders[occurrenceKey],
            settings
          );
          if (!description) return null;
          return (
            <RegularText key={occurrence.occurrenceId} small lighter style={styles.detailNote}>
              {`${formatOccurrence(occurrence)} · ${description}`}
            </RegularText>
          );
        })}
      <TextListItem
        accessibilityLabel={`${actionLabel} ${consts.a11yLabel.button}`}
        item={{
          id: 'event-reminder',
          routeName: ScreenName.Detail,
          params: {},
          isHeadlineTitle: false,
          leftIcon: <Icon.Clock color={colors.primary} size={normalize(20)} />,
          subtitle: status,
          title,
          topDivider: true,
          bottomDivider: false,
          onPress: onSelect
        }}
        listsWithoutArrows={listsWithoutArrows}
        navigation={navigation}
      />
      {selected && occurrences.length > 1 && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={copy.occurrence}
          onPress={onChoose}
          style={styles.detailLink}
        >
          <BoldText small primary underline>
            {copy.occurrence}
          </BoldText>
        </TouchableOpacity>
      )}
    </>
  );
};

type SettingsProps = {
  embeddedCategories?: boolean;
  notificationsAllowed?: boolean;
  navigation: ListNavigation;
};

const describeCategorySubscription = (
  subscription: CategorySubscription,
  plan: EventReminderSettingsState['categoryPlan'],
  now: number
) => {
  if (subscription.paused) return copy.categoryPaused;

  const summary = summarizeCategoryPlan(plan, subscription.category.id, now);
  const lines = [
    copy.categoryPlanned(summary.scheduled),
    summary.next ? copy.categoryNext(formatTime(summary.next)) : copy.categoryNoNext,
    summary.coverage ? copy.categoryCoverage(formatTime(summary.coverage)) : copy.categoryNoCoverage
  ];
  if (summary.pending) lines.push(copy.categoryNotPlanned(summary.pending));
  if (
    Object.values(plan).some(
      ({ categoryId, status, when }) =>
        categoryId === subscription.category.id && status === 'permission' && when > now
    )
  ) {
    lines.push(copy.permission);
  }
  if (subscription.syncedAt) lines.push(copy.categorySyncedAt(formatTime(subscription.syncedAt)));
  if (subscription.syncStatus === 'failed') lines.push(copy.categorySyncFailed);
  if (subscription.syncStatus === 'pending') lines.push(copy.categorySyncPending);
  return lines.join('\n');
};

export const EventReminderSettings = (props: SettingsProps) => {
  const { globalSettings } = useContext(SettingsContext);
  const modes = getEventReminderModes(globalSettings);
  if (props.embeddedCategories) {
    const settings = globalSettings.settings as
      | { personalizedPush?: { categories?: { eventSectionTitle?: string } } }
      | undefined;
    const title = settings?.personalizedPush?.categories?.eventSectionTitle;
    return modes.categoryEnabled ? (
      <EventCategoryReminderList
        modes={modes}
        navigation={props.navigation}
        notificationsAllowed={!!props.notificationsAllowed}
        title={title || texts.settingsContents.personalizedPush.eventSectionTitle}
      />
    ) : null;
  }
  return modes.singleEnabled ? (
    <EventReminderList modes={modes} navigation={props.navigation} />
  ) : null;
};

const useSettingsEventCategories = (
  enabled: boolean,
  subscriptions: EventReminderSettingsState['subscriptions'] | undefined
) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const online = Boolean(isConnected && isMainserverUp);
  const { data, isFetching } = useQuery(
    ['event-reminder-categories'],
    fetchEventReminderCategories,
    { enabled: enabled && online, retry: false }
  );
  const categories = new Map<string, EventReminderCategory>();
  for (const { category } of Object.values(subscriptions ?? {}))
    categories.set(category.id, category);
  for (const category of data ?? []) categories.set(category.id, category);
  const hint = !data
    ? isFetching
      ? copy.categoriesLoading
      : copy.categoriesUnavailable
    : !categories.size
    ? copy.categoryEmpty
    : undefined;
  return {
    categories: [...categories.values()]
      .map((category) => ({ category, title: decodeHTMLStrict(category.name) }))
      .sort((left, right) => left.title.localeCompare(right.title)),
    hint
  };
};

const EventCategoryReminderList = ({
  modes,
  navigation,
  notificationsAllowed,
  title
}: {
  modes: EventReminderModes;
  navigation: ListNavigation;
  notificationsAllowed: boolean;
  title: string;
}) => {
  const { settings, readFailed } = useEventReminders(modes);
  const [editedCategory, setEditedCategory] = useState<EventReminderCategory>();
  const [changingCategory, setChangingCategory] = useState(false);
  const { categories, hint } = useSettingsEventCategories(
    modes.categoryEnabled,
    settings?.subscriptions
  );
  const enableCategory = async (category: EventReminderCategory, revert: () => void) => {
    if (!notificationsAllowed) {
      revert();
      return;
    }
    setChangingCategory(true);
    try {
      const rule = settings?.subscriptions[category.id]?.rule ?? defaultRule;
      const status = await saveEventCategorySubscription(category, rule, undefined, modes);
      if (status !== 'saved') revert();
      if (status === 'permission') {
        const permission = await getEventReminderPermission();
        notifyPermissionMissing(permission === 'app' ? 'app' : 'system', navigation);
      }
    } catch {
      revert();
      Alert.alert(copy.title, copy.failed);
    } finally {
      setChangingCategory(false);
    }
  };

  const confirmCategoryRemoval = (id: string) => {
    Alert.alert(copy.categoryRemove, copy.categoryConfirmRemove, [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.categoryRemove,
        style: 'destructive',
        onPress: async () => {
          setChangingCategory(true);
          try {
            await pauseEventCategorySubscription(id, modes);
          } catch {
            Alert.alert(copy.title, copy.failed);
          } finally {
            setChangingCategory(false);
          }
        }
      }
    ]);
  };

  const renderCategory = ({ category, title }: (typeof categories)[number]) => {
    const { id } = category;
    const subscription = settings?.subscriptions[id];
    const activeSubscription = subscription?.paused ? undefined : subscription;
    return (
      <SettingsToggle
        key={id}
        needsConnection={false}
        item={{
          bottomDivider: true,
          isDisabled: !notificationsAllowed || !settings || changingCategory || !!editedCategory,
          title,
          value: notificationsAllowed && !!activeSubscription,
          onOpen: () => setEditedCategory(category),
          openLabel: copy.categorySettings(title),
          onActivate: (revert: () => void) => enableCategory(category, revert),
          onDeactivate: (revert: () => void) => {
            revert();
            confirmCategoryRemoval(id);
          }
        }}
      />
    );
  };

  return (
    <>
      <Wrapper noPaddingBottom>
        <RegularText small placeholder>
          {title}
        </RegularText>
      </Wrapper>
      <WrapperHorizontal style={styles.settingsList}>
        {readFailed && (
          <RegularText small error accessibilityRole="alert">
            {copy.failed}
          </RegularText>
        )}
        {hint && <RegularText small>{hint}</RegularText>}
        {categories.map(renderCategory)}
      </WrapperHorizontal>
      {editedCategory && (
        <EventReminderEditor
          modes={modes}
          category={editedCategory}
          settings={settings}
          navigation={navigation}
          close={() => setEditedCategory(undefined)}
        />
      )}
    </>
  );
};

const EventReminderList = ({
  modes,
  navigation
}: {
  modes: EventReminderModes;
  navigation: ListNavigation;
}) => {
  const { reminders, readFailed, now } = useEventReminders(modes);
  const [editedKey, setEditedKey] = useState<string>();
  const entries = Object.values(reminders).filter(
    ({ occurrence, rule, status }) =>
      status !== 'elapsed' &&
      occurrenceEndForReminders(occurrence) > now &&
      (status === 'scheduled' ||
        status === 'review' ||
        status === 'paused' ||
        getReminderTimestamp(occurrence, rule) > now)
  );
  const events = entries.map(({ occurrence, details }) => ({
    ...details,
    id: occurrence.eventId,
    title: occurrence.title,
    listDate: occurrence.date,
    date: { timeFrom: occurrence.time }
  }));
  const parsed = parseListItemsFromQuery(
    QUERY_TYPES.EVENT_RECORDS,
    { [QUERY_TYPES.EVENT_RECORDS]: events },
    undefined,
    { withDate: false, withTime: true }
  );
  const listItems = entries.map(({ occurrence }, index) => {
    const id = eventOccurrenceKey(occurrence);
    return { ...parsed[index], id, onPress: () => setEditedKey(id) };
  });
  const edited = entries.find(({ occurrence }) => eventOccurrenceKey(occurrence) === editedKey);

  return (
    <>
      <SectionHeader title={copy.singles} />
      <ReminderListView
        query={QUERY_TYPES.EVENT_RECORDS}
        data={listItems}
        horizontal={false}
        navigation={navigation}
        sectionByDate
        ListEmptyComponent={
          <Wrapper>
            <RegularText small error={readFailed} lighter={!readFailed}>
              {readFailed ? copy.failed : copy.empty}
            </RegularText>
          </Wrapper>
        }
      />
      {edited && (
        <EventReminderEditor
          modes={modes}
          occurrence={edited.occurrence}
          reminder={edited}
          navigation={navigation}
          close={() => setEditedKey(undefined)}
        />
      )}
    </>
  );
};

// The JavaScript list treats its presentation and pagination props as optional.
const ReminderListView = ListComponent as React.ComponentType<
  Pick<
    React.ComponentProps<typeof ListComponent>,
    'query' | 'data' | 'horizontal' | 'navigation' | 'sectionByDate' | 'ListEmptyComponent'
  >
>;

const styles = StyleSheet.create({
  dialog: { borderRadius: normalize(8), overflow: 'hidden' },
  detailLink: { alignSelf: 'flex-start', justifyContent: 'center', minHeight: normalize(44) },
  detailNote: { paddingBottom: normalize(8), paddingTop: normalize(8) },
  editorContent: { paddingBottom: normalize(8) },
  editorScroll: { flexShrink: 1 },
  eventContext: { gap: normalize(4), paddingBottom: normalize(12), paddingTop: normalize(8) },
  field: { minHeight: normalize(48), paddingHorizontal: 0, paddingVertical: normalize(10) },
  fieldContents: { flex: 1, gap: normalize(12) },
  footer: { gap: normalize(8), paddingBottom: normalize(8), paddingTop: normalize(12) },
  footerLink: {
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: normalize(-16),
    minHeight: normalize(44)
  },
  overlay: { maxWidth: normalize(520), padding: 0, width: '92%' },
  presets: { gap: normalize(6), paddingBottom: normalize(8), paddingTop: normalize(12) },
  radio: { minHeight: normalize(44) },
  removeLink: { justifyContent: 'center', minHeight: normalize(44) },
  settingsList: { paddingBottom: normalize(16) }
});
