import gql from 'graphql-tag';

import type { CategorySourceSnapshot } from '../helpers/eventReminderPlan';
import {
  EventReminderCategory,
  EventReminderRecord,
  getEventLocalDateTime,
  shiftEventCalendarDate
} from '../helpers/eventReminderTime';
import { ReactQueryClient } from '../ReactQueryClient';

const EVENT_REMINDER_CATEGORIES = gql`
  query EventReminderCategories {
    categories {
      id
      name
      tagList
      eventRecordsCount
    }
  }
`;

export const fetchEventReminderCategories = async (): Promise<EventReminderCategory[]> => {
  const client = await ReactQueryClient();
  const { categories } = await client.request<{
    categories?: ({
      id: string | number | null;
      name: string | null;
      tagList: string | null;
      eventRecordsCount: number | null;
    } | null)[];
  }>(EVENT_REMINDER_CATEGORIES);
  if (!Array.isArray(categories)) throw new Error('Event categories are unavailable');
  return categories.flatMap((category) => {
    if (!category?.name || category.id == null) return [];
    const tags = category.tagList?.split(',').map((tag) => tag.trim()) ?? [];
    if (!tags.includes('event_record') && !category.eventRecordsCount) return [];
    return [{ id: String(category.id), name: category.name }];
  });
};

const eventReminderFields = gql`
  fragment EventReminderFields on EventRecord {
    id
    title
    updatedAt
    visible
    recurring
    category {
      id
      name
    }
    categories {
      id
      name
    }
    dates {
      id
      dateFrom: dateStart
      dateTo: dateEnd
      timeFrom: timeStart
      useOnlyTimeDescription
    }
  }
`;

const EVENT_REMINDER_RECORD = gql`
  query EventReminderRecord($id: ID!) {
    eventRecord(id: $id) {
      ...EventReminderFields
    }
  }
  ${eventReminderFields}
`;

const CATEGORY_REMINDER_RECORDS = gql`
  query CategoryReminderRecords($categoryId: ID!, $limit: Int!, $skip: Int!) {
    eventRecords(
      categoryId: $categoryId
      limit: $limit
      skip: $skip
      order: "id_ASC"
      onlyUniqEvents: true
    ) {
      ...EventReminderFields
    }
  }
  ${eventReminderFields}
`;

const isCategoryReminderRecord = (record: unknown): record is EventReminderRecord => {
  if (!record || typeof record !== 'object') return false;
  const entry = record as Partial<EventReminderRecord>;
  return entry.id != null && typeof entry.title === 'string' && Array.isArray(entry.dates);
};

export const fetchEventCategorySnapshot = async (
  categoryId: string
): Promise<CategorySourceSnapshot> => {
  const client = await ReactQueryClient();
  const records = new Map<string, EventReminderRecord>();
  const limit = 50;
  let skip = 0;
  // Fetch without dateRange because some event resolvers apply its final filter after pagination.
  // An intermediate page with a synthetic or multi-day record could otherwise appear empty.
  for (let page = 0; page < 100; page++) {
    const result = (await client.request(CATEGORY_REMINDER_RECORDS, {
      categoryId,
      limit,
      skip
    })) as {
      eventRecords?: unknown[];
    };
    const next = result.eventRecords;
    if (!Array.isArray(next) || !next.every(isCategoryReminderRecord)) {
      throw new Error('Incomplete category reminder response');
    }
    if (!next.length) {
      const syncedAt = Date.now();
      const { date } = getEventLocalDateTime(syncedAt);
      return {
        records: [...records.values()],
        syncedAt,
        coverageThrough: shiftEventCalendarDate(date, 90)
      };
    }
    const knownSize = records.size;
    for (const record of next) records.set(String(record.id), record);
    if (knownSize === records.size) throw new Error('Category reminder pagination repeated a page');
    skip += next.length;
  }
  throw new Error('Category reminder pagination did not finish');
};

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
