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

export const locations = async (queryVariables) => {
  const queryParams = new URLSearchParams(queryVariables);
  const { sueFetchObj = {}, sueLocationsUrl = '' } = await fetchSueEndpoints();

  const response = await (
    await fetch(`${sueLocationsUrl}?${queryParams.toString()}`, sueFetchObj)
  ).json();

  return new Promise((resolve) => {
    resolve(
      response.map((item: any) => {
        const camelCasedItem = _mapKeys(item, (value, key) => _camelCase(key));
        const status = StatusMapping[item.status_code as keyof typeof StatusMapping];

        return { ...camelCasedItem, status };
      })
    );
  });
};
