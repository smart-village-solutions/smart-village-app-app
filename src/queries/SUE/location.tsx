import _camelCase from 'lodash/camelCase';
import _mapKeys from 'lodash/mapKeys';

import { fetchSueEndpoints } from '../../helpers';

/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
enum StatusMapping {
  TICKET_STATUS_CLOSED = 'Geschlossen',
  TICKET_STATUS_INVALID = 'Geschlossen',
  TICKET_STATUS_IN_PROCESS = 'In Bearbeitung',
  TICKET_STATUS_WAIT_REQUESTOR = 'In Bearbeitung',
  TICKET_STATUS_WAIT_THIRDPARTY = 'In Bearbeitung',
  TICKET_STATUS_UNPROCESSED = 'Offen',
  TICKET_STATUS_OPEN = 'Offen'
}
/* eslint-enable @typescript-eslint/no-duplicate-enum-values */

const DEFAULT_PAGE_SIZE = 100;

const mapLocationItem = (item: Record<string, unknown>) => {
  const camelCasedItem = _mapKeys(item, (value, key) => _camelCase(key));
  const status = StatusMapping[item.status_code as keyof typeof StatusMapping];

  return { ...camelCasedItem, status };
};

const fetchLocationPage = async (sueLocationsUrl, sueFetchObj, queryVariables) => {
  const queryParams = new URLSearchParams(queryVariables);
  const response = await fetch(`${sueLocationsUrl}?${queryParams.toString()}`, sueFetchObj);

  return response.json();
};

export const locations = async (queryVariables) => {
  const { sueFetchObj = {}, sueLocationsUrl = '' } = await fetchSueEndpoints();
  const hasExplicitPagination =
    queryVariables?.limit !== undefined || queryVariables?.offset !== undefined;

  let response = [];

  if (hasExplicitPagination) {
    response = await fetchLocationPage(sueLocationsUrl, sueFetchObj, queryVariables);
  } else {
    let offset = 0;
    let hasMorePages = true;

    while (hasMorePages) {
      const page = await fetchLocationPage(sueLocationsUrl, sueFetchObj, {
        ...queryVariables,
        limit: DEFAULT_PAGE_SIZE,
        offset
      });

      response.push(...page);

      hasMorePages = page.length === DEFAULT_PAGE_SIZE;
      offset += DEFAULT_PAGE_SIZE;
    }
  }

  return new Promise((resolve) => {
    resolve(response.map((item: Record<string, unknown>) => mapLocationItem(item)));
  });
};
