import { useContext } from 'react';
import { dropdownEntries } from '../components';
import { usePermanentFilter } from '../hooks';
import { PermanentFilterContext } from '../PermanentFilterProvider';
import { QUERY_TYPES } from '../queries';
import { FilterProps, FilterTypesProps, ResourceFilters } from '../types';

export const FILTER_KEYS = {
  CATEGORY: 'category',
  DATA_PROVIDER: 'dataProvider',
  DATE_END: 'dateEnd',
  DATE_START: 'dateStart',
  LOCATION: 'location',
  RADIUS_SEARCH: 'radiusSearch',
  SAVEABLE: 'saveable',
  ACTIVE: 'active'
};

enum QUERY_VARIABLES_ATTRIBUTES {
  CATEGORY_ID = 'categoryId',
  DATA_PROVIDER = 'dataProvider',
  DATA_PROVIDER_ID = 'dataProviderId',
  DATE_END = 'dateEnd',
  DATE_START = 'dateStart',
  LOCATION = 'location'
}

const getLabel = (key: string) =>
  ({
    [FILTER_KEYS.CATEGORY]: 'Kategorien',
    [FILTER_KEYS.DATA_PROVIDER]: 'Datenquellenauswahl',
    [FILTER_KEYS.DATE_END]: 'Bis',
    [FILTER_KEYS.DATE_START]: 'Von',
    [FILTER_KEYS.LOCATION]: 'Orte',
    [FILTER_KEYS.RADIUS_SEARCH]: 'Entfernung (km)',
    [FILTER_KEYS.SAVEABLE]: 'Filtereinstellungen'
  }[key] || key);

const getPlaceholder = (key: string, query: string) =>
  ({
    [FILTER_KEYS.CATEGORY]: 'Kategorien wählen',
    [FILTER_KEYS.DATA_PROVIDER]: 'Datenquellen wählen',
    [FILTER_KEYS.DATE_END]: {
      [QUERY_TYPES.EVENT_RECORDS]: 'Bis',
      [QUERY_TYPES.NEWS_ITEMS]: 'Bis'
    }[query],
    [FILTER_KEYS.DATE_START]: {
      [QUERY_TYPES.EVENT_RECORDS]: 'Von',
      [QUERY_TYPES.NEWS_ITEMS]: 'Von'
    }[query],
    [FILTER_KEYS.LOCATION]: 'Orte wählen',
    [FILTER_KEYS.RADIUS_SEARCH]: 'Entfernung wählen',
    [FILTER_KEYS.SAVEABLE]: 'Filtereinstellungen dauerhaft speichern'
  }[key] || key);

export const filterTypesHelper = ({
  categories,
  data,
  query,
  resourceFilters,
  locations,
  queryVariables
}: {
  categories: any;
  data: any;
  query: string;
  resourceFilters: ResourceFilters[];
  locations: any;
  queryVariables: any;
}) => {
  const filtersByQuery = resourceFilters?.find((entry) => entry.dataResourceType === query);
  const { excludeDataProviderIds } = usePermanentFilter();

  if (!filtersByQuery || filtersByQuery.config.active?.default === false) {
    return [];
  }

  if (filtersByQuery.config.dateStart && filtersByQuery.config.dateEnd) {
    delete filtersByQuery.config.dateEnd;
  }

  const filterTypes = Object.entries(filtersByQuery?.config ?? {}).map(([key, value]) => {
    const filterType: FilterTypesProps = {
      data: [],
      label: getLabel('- Alle -'),
      name: key as keyof FilterProps,
      placeholder: getPlaceholder('- Alle -', query),
      type: value.type
    };

    switch (key) {
      case FILTER_KEYS.DATE_END:
      case FILTER_KEYS.DATE_START:
        filterType.label = getLabel(key);
        filterType.data = [
          {
            name: QUERY_VARIABLES_ATTRIBUTES.DATE_START,
            placeholder: getPlaceholder(FILTER_KEYS.DATE_START, query)
          },
          {
            name: QUERY_VARIABLES_ATTRIBUTES.DATE_END,
            placeholder: getPlaceholder(FILTER_KEYS.DATE_END, query)
          }
        ];
        break;
      case FILTER_KEYS.DATA_PROVIDER:
        filterType.data = dropdownEntries(
          query,
          queryVariables,
          data,
          excludeDataProviderIds,
          false
        )?.map((entry: any) => ({
          ...entry,
          filterValue: entry.value
        }));
        filterType.label = getLabel(key);
        filterType.name = QUERY_VARIABLES_ATTRIBUTES.DATA_PROVIDER;
        filterType.placeholder = getPlaceholder(key, query);
        break;
      case FILTER_KEYS.CATEGORY:
        filterType.data = dropdownEntries(
          query,
          queryVariables,
          categories,
          excludeDataProviderIds,
          false
        )?.map((entry: any) => ({
          ...entry,
          filterValue: entry.id
        }));
        filterType.label = getLabel(key);
        filterType.name = QUERY_VARIABLES_ATTRIBUTES.CATEGORY_ID;
        filterType.placeholder = getPlaceholder(key, query);
        break;
      case FILTER_KEYS.SAVEABLE:
        filterType.label = getLabel(key);
        filterType.placeholder = getPlaceholder(key, query);
        filterType.checked = false;
        break;
      case FILTER_KEYS.RADIUS_SEARCH:
        filterType.label = getLabel(key);
        filterType.placeholder = getPlaceholder(key, query);
        break;
      case FILTER_KEYS.LOCATION:
        filterType.data = dropdownEntries(
          query,
          queryVariables,
          locations,
          excludeDataProviderIds,
          true
        )?.map((entry: any) => ({
          ...entry,
          filterValue: entry.value
        }));
        filterType.label = getLabel(key);
        filterType.name = QUERY_VARIABLES_ATTRIBUTES.LOCATION;
        filterType.placeholder = getPlaceholder(key, query);
        break;
      default:
        break;
    }

    return filterType;
  });

  return filterTypes;
};
