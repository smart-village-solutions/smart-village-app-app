import gql from 'graphql-tag';

import type { EventReminderRecord } from '../helpers/eventReminderTime';
import { ReactQueryClient } from '../ReactQueryClient';

const EVENT_REMINDER_RECORD = gql`
  query EventReminderRecord($id: ID!) {
    eventRecord(id: $id) {
      id
      title
      updatedAt
      visible
      recurring
      dates {
        id
        dateFrom: dateStart
        dateTo: dateEnd
        timeFrom: timeStart
        useOnlyTimeDescription
      }
    }
  }
`;

export const fetchEventReminderRecords = async (eventIds: string[]) => {
  if (!eventIds.length) return [];

  const client = await ReactQueryClient();
  const records: EventReminderRecord[] = [];
  const batchSize = 5;
  for (let offset = 0; offset < eventIds.length; offset += batchSize) {
    const batch = eventIds.slice(offset, offset + batchSize);
    const responses = await Promise.allSettled(
      batch.map(async (id) => {
        const result = (await client.request(EVENT_REMINDER_RECORD, { id })) as {
          eventRecord?: EventReminderRecord | null;
        };
        return result.eventRecord;
      })
    );
    for (const response of responses) {
      if (response.status === 'fulfilled' && response.value) records.push(response.value);
    }
  }
  return records;
};
