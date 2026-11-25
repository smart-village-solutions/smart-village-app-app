import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  DeviceEventEmitter,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { texts } from '../config';
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

import { Button } from './Button';
import { RegularText } from './Text';
import { SectionHeader } from './SectionHeader';

const copy = texts.eventReminders;
const timeFormat = new Intl.DateTimeFormat('de-DE', {
  timeZone: EVENT_REMINDER_TIME_ZONE,
  dateStyle: 'medium',
  timeStyle: 'short'
});
const formatTime = (timestamp: number) => timeFormat.format(timestamp);

const formatOccurrence = ({ date, time }: EventOccurrence) =>
  `${date.split('-').reverse().join('.')}, ${time ?? copy.noTime}`;

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

const ReminderButton = ({
  title,
  ...props
}: Pick<React.ComponentProps<typeof Button>, 'title' | 'onPress' | 'disabled' | 'invert'>) => (
  <Button
    {...props}
    title={title}
    accessibilityLabel={title}
    accessibilityHint={undefined}
    small={false}
    smallest={false}
  />
);

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
  const { colors } = useTheme();
  const [rule, setRule] = useState(reminder?.rule ?? defaultRule);
  const [picker, setPicker] = useState<'date' | 'time'>();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();
  const [now] = useState(Date.now);
  const when = getReminderTimestamp(occurrence, rule);
  const valid = isValidReminderTimestamp(occurrence, when, now);

  const showPicker = (mode: 'date' | 'time') => {
    if (Platform.OS !== 'android') {
      setPicker(mode);
      return;
    }
    DateTimePickerAndroid.open({
      mode,
      value: new Date(Math.max(now, when)),
      timeZoneName: EVENT_REMINDER_TIME_ZONE,
      onValueChange: (_, value) => changePickedValue(mode, value)
    });
  };

  const changePickedValue = (mode: 'date' | 'time', value: Date) => {
    setMessage(undefined);
    if (mode === 'time' && rule.kind === 'relative') {
      setRule({ ...rule, time: getEventLocalDateTime(value.getTime()).time });
    } else {
      setRule({ kind: 'absolute', timestamp: Math.floor(value.getTime() / 60000) * 60000 });
    }
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

  return (
    <Modal animationType="slide" onRequestClose={saving ? undefined : close}>
      <SafeAreaView style={[styles.modal, { backgroundColor: colors.surface }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <SectionHeader title={reminder ? copy.edit : copy.action} />
          <RegularText>{occurrence.title}</RegularText>
          <RegularText>{formatOccurrence(occurrence)}</RegularText>
          {presets.map(({ label, leadDays }) => (
            <ReminderButton
              key={leadDays}
              title={copy[label]}
              disabled={saving}
              invert={rule.kind !== 'relative' || rule.leadDays !== leadDays}
              onPress={() => {
                setPicker(undefined);
                setMessage(undefined);
                setRule(presetRule(occurrence, leadDays));
              }}
            />
          ))}
          <ReminderButton
            title={copy.custom}
            disabled={saving}
            invert={rule.kind !== 'absolute'}
            onPress={() => showPicker('date')}
          />
          <ReminderButton
            title={copy.changeTime}
            disabled={saving}
            invert
            onPress={() => showPicker('time')}
          />
          {picker && (
            <DateTimePicker
              key={picker}
              mode={picker}
              accessibilityLabel={picker === 'date' ? copy.changeDate : copy.changeTime}
              display="spinner"
              value={new Date(when)}
              timeZoneName={EVENT_REMINDER_TIME_ZONE}
              onValueChange={(_, value) => changePickedValue(picker, value)}
            />
          )}
          <RegularText accessibilityLiveRegion="polite">
            {copy.preview(formatTime(when))}
          </RegularText>
          {(!valid || !!message) && (
            <RegularText accessibilityLiveRegion="polite">{message ?? copy.invalid}</RegularText>
          )}
          <ReminderButton title={copy.save} disabled={saving || !valid} onPress={save} />
          {!!reminder && (
            <ReminderButton title={copy.remove} disabled={saving} invert onPress={remove} />
          )}
          <ReminderButton title={copy.cancel} disabled={saving} invert onPress={close} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export const EventReminderActions = ({
  occurrences,
  selectedOccurrenceId,
  notificationOccurrenceId
}: {
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
    <View style={styles.actions}>
      {!!notificationOccurrenceId && (
        <RegularText>
          {opened ? copy.openedOccurrence(formatOccurrence(opened)) : copy.unavailable}
        </RegularText>
      )}
      {readFailed && <RegularText>{copy.failed}</RegularText>}
      {!choosing && (
        <OccurrenceReminderSummary
          occurrences={future}
          selected={selected}
          reminders={reminders}
          onSelect={() => (selected ? setEdited(selected) : setChoosing(true))}
          onChoose={() => setChoosing(true)}
        />
      )}
      {!!choosing && (
        <>
          <SectionHeader title={copy.occurrence} />
          <RegularText>{copy.selectOccurrence}</RegularText>
          {future.map((occurrence) => (
            <ReminderButton
              key={occurrence.occurrenceId}
              title={formatOccurrence(occurrence)}
              invert
              onPress={() => {
                setChoosing(false);
                setEdited(occurrence);
              }}
            />
          ))}
          <ReminderButton title={copy.cancel} invert onPress={() => setChoosing(false)} />
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
  occurrences,
  selected,
  reminders,
  onSelect,
  onChoose
}: {
  occurrences: EventOccurrence[];
  selected?: EventOccurrence;
  reminders: Awaited<ReturnType<typeof readEventReminders>>;
  onSelect: () => void;
  onChoose: () => void;
}) => {
  if (!occurrences.length) return null;

  const matching = selected ? reminders[eventOccurrenceKey(selected)] : undefined;
  return (
    <>
      {(selected ? [selected] : occurrences).map((occurrence) => {
        const reminder = reminders[eventOccurrenceKey(occurrence)];
        if (!reminder) return null;
        const summary = describeReminder(reminder);
        return (
          <RegularText key={occurrence.occurrenceId}>
            {selected ? summary : `${formatOccurrence(occurrence)} · ${summary}`}
          </RegularText>
        );
      })}
      <ReminderButton title={matching ? copy.edit : copy.action} onPress={onSelect} />
      {selected && occurrences.length > 1 && (
        <ReminderButton title={copy.occurrence} invert onPress={onChoose} />
      )}
    </>
  );
};

export const EventReminderSettings = () => {
  const { globalSettings } = useContext(SettingsContext);
  return getEventRemindersEnabled(globalSettings) ? <EventReminderList /> : null;
};

const EventReminderList = () => {
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
    <ScrollView contentContainerStyle={styles.content}>
      <SectionHeader title={copy.singles} />
      {readFailed && <RegularText>{copy.failed}</RegularText>}
      {!entries.length && !readFailed && <RegularText>{copy.empty}</RegularText>}
      {entries.map((reminder) => (
        <View key={eventOccurrenceKey(reminder.occurrence)} style={styles.entry}>
          <RegularText>{reminder.occurrence.title}</RegularText>
          <RegularText>{formatOccurrence(reminder.occurrence)}</RegularText>
          <RegularText>{describeReminder(reminder)}</RegularText>
          <ReminderButton title={copy.edit} onPress={() => setEdited(reminder)} />
        </View>
      ))}
      {!!edited && (
        <EventReminderEditor
          occurrence={edited.occurrence}
          reminder={edited}
          close={() => setEdited(undefined)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actions: { gap: 8 },
  content: { padding: 20, gap: 12 },
  entry: { gap: 6 },
  modal: { flex: 1 }
});
