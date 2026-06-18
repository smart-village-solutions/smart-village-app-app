export const WASTE_REMINDER_MAX_LOCAL_NOTIFICATIONS = 50;

const compareAlphabetically = (left: string, right: string) => left.localeCompare(right);

type WastePickUpTime = {
  pickupDate?: string;
};

export type WasteLocationTypeReminderData = {
  pickUpTimes?: WastePickUpTime[];
  wasteType?: string;
};

export type WasteReminderOccurrence = {
  id: string;
  pickupDates: string[];
  reminderAt: Date;
  wasteTypes: string[];
};

export type WasteReminderRegistration = {
  leadDays: number;
  slotId: string;
  storeId?: number | string;
  time: string;
  typeKey: string;
};

type BuildWasteReminderScheduleParams = {
  activeReminderRegistrations?: WasteReminderRegistration[];
  maxNotifications?: number;
  now?: Date;
  onDayBefore?: boolean;
  reminderTime?: Date;
  selectedTypeKeys?: string[];
  wasteLocationTypes?: WasteLocationTypeReminderData[];
};

export const buildWasteReminderSchedule = ({
  activeReminderRegistrations,
  maxNotifications = WASTE_REMINDER_MAX_LOCAL_NOTIFICATIONS,
  now = new Date(),
  onDayBefore = true,
  reminderTime,
  selectedTypeKeys = [],
  wasteLocationTypes = []
}: BuildWasteReminderScheduleParams) => {
  const registrationsByType = buildRegistrationsByType(
    activeReminderRegistrations ??
      selectedTypeKeys.map((typeKey) => ({
        leadDays: onDayBefore ? 1 : 0,
        slotId: 'default',
        time: formatReminderTime(reminderTime ?? new Date()),
        typeKey
      }))
  );
  const groupedReminders: Record<string, WasteReminderOccurrence> = {};

  wasteLocationTypes.forEach(({ pickUpTimes = [], wasteType }) => {
    if (!wasteType || !registrationsByType[wasteType]?.length) {
      return;
    }

    pickUpTimes.forEach(({ pickupDate }) => {
      if (!pickupDate) {
        return;
      }

      registrationsByType[wasteType].forEach((registration) => {
        const reminderAt = buildReminderDate({
          leadDays: registration.leadDays,
          pickupDate,
          time: registration.time
        });

        if (reminderAt <= now) {
          return;
        }

        const groupKey = reminderAt.toISOString();
        const existing = groupedReminders[groupKey] ?? {
          id: '',
          pickupDates: [],
          reminderAt,
          wasteTypes: []
        };

        groupedReminders[groupKey] = {
          ...existing,
          pickupDates: Array.from(new Set([...existing.pickupDates, pickupDate])).sort(
            compareAlphabetically
          ),
          wasteTypes: Array.from(new Set([...existing.wasteTypes, wasteType])).sort(
            compareAlphabetically
          )
        };
      });
    });
  });

  const allReminders = Object.values(groupedReminders).sort(
    (left, right) => left.reminderAt.getTime() - right.reminderAt.getTime()
  );
  const reminders = allReminders.slice(0, maxNotifications).map((reminder) => ({
    ...reminder,
    id: buildWasteReminderId(reminder)
  }));

  return {
    hasMoreReminders: allReminders.length > reminders.length,
    localCoverageUntil: reminders[reminders.length - 1]?.reminderAt,
    reminders
  };
};

const buildReminderDate = ({
  leadDays,
  pickupDate,
  time
}: {
  leadDays: number;
  pickupDate: string;
  time: string;
}) => {
  const reminderAt = new Date(pickupDate);
  const { hours, minutes } = parseReminderTime(time);

  reminderAt.setHours(hours, minutes, 0, 0);
  reminderAt.setDate(reminderAt.getDate() - Math.max(0, leadDays));

  return reminderAt;
};

const buildWasteReminderId = ({
  pickupDates,
  reminderAt,
  wasteTypes
}: Omit<WasteReminderOccurrence, 'id'>) =>
  `waste:${reminderAt.toISOString()}:${wasteTypes.join(',')}:${pickupDates.join(',')}`;

const buildRegistrationsByType = (registrations: WasteReminderRegistration[]) =>
  registrations.reduce((acc: Record<string, WasteReminderRegistration[]>, registration) => {
    acc[registration.typeKey] = [...(acc[registration.typeKey] ?? []), registration];

    return acc;
  }, {});

const formatReminderTime = (reminderTime: Date) =>
  `${reminderTime.getHours()}:${reminderTime.getMinutes()}`;

const parseReminderTime = (time: string) => {
  const [hours = '0', minutes = '0'] = time.split(':');

  return {
    hours: Number(hours) || 0,
    minutes: Number(minutes) || 0
  };
};
