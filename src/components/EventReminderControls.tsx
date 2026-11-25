import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import React, { useContext, useEffect, useRef, useState } from 'react';
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

import { Icon, consts, normalize, texts } from '../config';
import {
  EVENT_REMINDER_TIME_ZONE,
  EventOccurrence,
  EventReminderRule,
  eventLocalTimestamp,
  eventOccurrenceKey,
  getEventLocalDateTime,
  getReminderTimestamp,
  isValidReminderTimestamp,
  occurrenceEndForReminders
} from '../helpers/eventReminderTime';
import { useTheme } from '../hooks/useTheme';
import {
  EVENT_REMINDERS_CHANGED,
  SingleEventReminder,
  getEventRemindersEnabled,
  readEventReminders,
  removeEventReminder,
  saveEventReminder
} from '../pushNotifications/EventReminderLocalNotifications';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';

import { Button } from './Button';
import { EmptyMessage } from './EmptyMessage';
import { Modal } from './Modal';
import { Radiobutton } from './Radiobutton';
import { SectionHeader } from './SectionHeader';
import { BoldText, RegularText } from './Text';
import { TextListItem } from './TextListItem';
import { Wrapper, WrapperHorizontal } from './Wrapper';

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

const defaultRule: EventReminderRule = { kind: 'relative', leadDays: 3 };
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

const useEventReminders = () => {
  const [reminders, setReminders] = useState<Awaited<ReturnType<typeof readEventReminders>>>({});
  const [readFailed, setReadFailed] = useState(false);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    let requestId = 0;
    const read = async () => {
      const id = ++requestId;
      try {
        const records = await readEventReminders();
        if (requestId === id) {
          setReminders(records);
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
  return { reminders, readFailed, now };
};

const notifyPermissionMissing = () =>
  Alert.alert(copy.title, copy.permission, [
    { text: copy.cancel, style: 'cancel' },
    { text: copy.systemSettings, onPress: () => void Linking.openSettings().catch(() => undefined) }
  ]);

type EditorProps = {
  occurrence: EventOccurrence;
  reminder?: SingleEventReminder;
  close: () => void;
};

const EventReminderEditor = ({ occurrence, reminder, close }: EditorProps) => {
  const { colors, isDark } = useTheme();
  const { height } = useWindowDimensions();
  const { bottom, top } = useSafeAreaInsets();
  const scrollView = useRef<ScrollView>(null);
  const [rule, setRule] = useState(reminder?.rule ?? defaultRule);
  const [picker, setPicker] = useState<'date' | 'time'>();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();
  const [now] = useState(Date.now);
  const when = getReminderTimestamp(occurrence, rule);
  const valid = isValidReminderTimestamp(occurrence, when, now);
  const maxHeight = height - top - bottom - normalize(32);
  const isAndroidPickerOpen = Platform.OS === 'android' && picker !== undefined;
  const selectedPreset = picker === 'date' || rule.kind === 'absolute' ? 'custom' : rule.leadDays;
  const local = getEventLocalDateTime(when);
  const fields = [
    { mode: 'date', title: copy.date, label: copy.changeDate, value: formatDate(local.date) },
    { mode: 'time', title: copy.time, label: copy.changeTime, value: local.time }
  ] as const;
  const feedback = message ?? (valid ? undefined : copy.invalid);

  const togglePicker = (mode: 'date' | 'time') =>
    setPicker((current) => (current === mode ? undefined : mode));

  const changePickedValue = (mode: 'date' | 'time', value: Date) => {
    setMessage(undefined);
    if (mode === 'time' && rule.kind === 'relative') {
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

  const selectPreset = (leadDays: number) => {
    setPicker(undefined);
    setMessage(undefined);
    setRule(presetRule(occurrence, leadDays));
  };

  const save = async () => {
    setSaving(true);
    setMessage(undefined);
    try {
      const status = await saveEventReminder(occurrence, rule);
      if (status === 'permission') notifyPermissionMissing();
      else if (status === 'scheduled' || status === 'capacity') close();
      else setMessage(copy[status]);
    } catch {
      setMessage(copy.failed);
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    Alert.alert(copy.remove, copy.confirmRemove, [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.remove,
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await removeEventReminder(occurrence);
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

  const renderFooter = () => (
    <WrapperHorizontal style={styles.footer}>
      <BoldText small accessibilityLiveRegion="polite">
        {copy.preview(formatTime(when))}
      </BoldText>
      {!!feedback && (
        <RegularText small error accessibilityLiveRegion="assertive" accessibilityRole="alert">
          {feedback}
        </RegularText>
      )}
      <Button
        accessibilityHint={undefined}
        accessibilityLabel={copy.save}
        disabled={saving || !valid}
        onPress={save}
        small={false}
        smallest={false}
        title={copy.save}
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
      <SectionHeader title={reminder ? copy.edit : copy.action} />
      <ScrollView
        ref={scrollView}
        style={styles.editorScroll}
        contentContainerStyle={styles.editorContent}
        onContentSizeChange={() => {
          if (picker) scrollView.current?.scrollToEnd({ animated: false });
        }}
      >
        <WrapperHorizontal style={styles.eventContext}>
          <BoldText>{occurrence.title}</BoldText>
          <RegularText small lighter>
            {formatOccurrence(occurrence)}
          </RegularText>
        </WrapperHorizontal>
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
              onPress={() => togglePicker('date')}
              selected={selectedPreset === 'custom'}
              title={copy.custom}
            />
          </View>
        </WrapperHorizontal>
        <WrapperHorizontal>
          <Divider />
          {fields.map(({ mode, title, label, value }) => (
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
              <ListItem.Content>
                <BoldText small>{title}</BoldText>
              </ListItem.Content>
              <RegularText small primary>
                {value}
              </RegularText>
              <Icon.ArrowRight color={colors.text} size={normalize(18)} />
            </ListItem>
          ))}
          {renderInlinePicker()}
          {!!reminder && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={copy.remove}
              accessibilityState={{ disabled: saving }}
              disabled={saving}
              onPress={remove}
              style={styles.removeLink}
            >
              <BoldText small error>
                {copy.remove}
              </BoldText>
            </TouchableOpacity>
          )}
        </WrapperHorizontal>
      </ScrollView>
      <Divider />
    </Modal>
  );
};

export const EventReminderActions = ({
  listsWithoutArrows,
  navigation,
  occurrences,
  selectedOccurrenceId,
  notificationOccurrenceId
}: {
  listsWithoutArrows?: boolean;
  navigation: ListNavigation;
  occurrences: EventOccurrence[];
  selectedOccurrenceId?: string | number | null;
  notificationOccurrenceId?: string;
}) => {
  const { reminders, readFailed, now } = useEventReminders();
  const [edited, setEdited] = useState<EventOccurrence>();
  const [choosing, setChoosing] = useState(false);
  const future = occurrences.filter((occurrence) => occurrenceEndForReminders(occurrence) > now);
  const opened = occurrences.find(({ occurrenceId }) => occurrenceId === notificationOccurrenceId);
  const selected = selectOccurrence(future, notificationOccurrenceId ?? selectedOccurrenceId);

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
          onSelect={() => (selected ? setEdited(selected) : setChoosing(true))}
          onChoose={() => setChoosing(true)}
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
                onPress: () => {
                  setChoosing(false);
                  setEdited(occurrence);
                }
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
          close={() => setEdited(undefined)}
        />
      )}
    </View>
  );
};

const selectOccurrence = (occurrences: EventOccurrence[], preferredId?: string | number | null) =>
  occurrences.find(({ occurrenceId }) => occurrenceId === String(preferredId)) ??
  (occurrences.length === 1 ? occurrences[0] : undefined);

const OccurrenceReminderSummary = ({
  listsWithoutArrows,
  navigation,
  occurrences,
  selected,
  reminders,
  onSelect,
  onChoose
}: {
  listsWithoutArrows?: boolean;
  navigation: ListNavigation;
  occurrences: EventOccurrence[];
  selected?: EventOccurrence;
  reminders: Awaited<ReturnType<typeof readEventReminders>>;
  onSelect: () => void;
  onChoose: () => void;
}) => {
  const { colors } = useTheme();
  if (!occurrences.length) return null;

  const matching = selected ? reminders[eventOccurrenceKey(selected)] : undefined;
  const title = matching ? copy.edit : copy.action;
  const status = matching ? describeReminder(matching) : undefined;
  const actionLabel = status ? `${title}. ${status}` : title;
  return (
    <>
      {!selected &&
        occurrences.map((occurrence) => {
          const reminder = reminders[eventOccurrenceKey(occurrence)];
          if (!reminder) return null;
          return (
            <RegularText key={occurrence.occurrenceId} small lighter style={styles.detailNote}>
              {`${formatOccurrence(occurrence)} · ${describeReminder(reminder)}`}
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

type SettingsProps = { listsWithoutArrows?: boolean; navigation: ListNavigation };

export const EventReminderSettings = (props: SettingsProps) => {
  const { globalSettings } = useContext(SettingsContext);
  return getEventRemindersEnabled(globalSettings) ? <EventReminderList {...props} /> : null;
};

const EventReminderList = ({ listsWithoutArrows, navigation }: SettingsProps) => {
  const { reminders, readFailed, now } = useEventReminders();
  const [edited, setEdited] = useState<SingleEventReminder>();
  const entries = Object.values(reminders)
    .filter(({ occurrence }) => occurrenceEndForReminders(occurrence) > now)
    .sort(
      (left, right) =>
        getReminderTimestamp(left.occurrence, left.rule) -
        getReminderTimestamp(right.occurrence, right.rule)
    );
  return (
    <>
      <SectionHeader title={copy.singles} />
      {readFailed && (
        <Wrapper>
          <RegularText small error accessibilityRole="alert">
            {copy.failed}
          </RegularText>
        </Wrapper>
      )}
      {!entries.length && !readFailed && <EmptyMessage title={copy.empty} />}
      {!!entries.length && (
        <ScrollView contentContainerStyle={styles.settingsList}>
          {entries.map((reminder) => {
            const id = eventOccurrenceKey(reminder.occurrence);
            const { title } = reminder.occurrence;
            const date = formatOccurrence(reminder.occurrence);
            const status = describeReminder(reminder);
            return (
              <TextListItem
                key={id}
                accessibilityLabel={`${copy.edit}. ${title}. ${date}. ${status} ${consts.a11yLabel.button}`}
                item={{
                  id,
                  routeName: ScreenName.Settings,
                  params: {},
                  isHeadlineTitle: false,
                  title,
                  teaserTitle: date,
                  subtitle: status,
                  onPress: () => setEdited(reminder)
                }}
                listsWithoutArrows={listsWithoutArrows}
                navigation={navigation}
              />
            );
          })}
        </ScrollView>
      )}
      {!!edited && (
        <EventReminderEditor
          occurrence={edited.occurrence}
          reminder={edited}
          close={() => setEdited(undefined)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  dialog: { borderRadius: normalize(8), overflow: 'hidden' },
  detailLink: { alignSelf: 'flex-start', justifyContent: 'center', minHeight: normalize(44) },
  detailNote: { paddingBottom: normalize(8), paddingTop: normalize(8) },
  editorContent: { paddingBottom: normalize(8) },
  editorScroll: { flexShrink: 1 },
  eventContext: { gap: normalize(4), paddingBottom: normalize(12), paddingTop: normalize(8) },
  field: { minHeight: normalize(48), paddingHorizontal: 0, paddingVertical: normalize(10) },
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
  settingsList: { paddingBottom: normalize(16), paddingHorizontal: normalize(16) }
});
