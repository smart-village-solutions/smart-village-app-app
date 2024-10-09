import { consts } from '../consts';

const { FILTER_TYPES } = consts;

export const defaultFilterConfig = [
  {
    dataResourceType: 'dataResourceType',
    config: {
      active: {
        default: false
      },
      category: {
        isMultiSelect: null,
        isSearchable: null,
        default: null,
        type: FILTER_TYPES.DROPDOWN
      },
      dateStart: {
        hasPastDates: null,
        hasFutureDates: null,
        default: null,
        type: FILTER_TYPES.DATE
      },
      dateEnd: {
        hasPastDates: null,
        hasFutureDates: null,
        default: null,
        type: FILTER_TYPES.DATE
      },
      location: {
        isMultiSelect: null,
        isSearchable: null,
        default: null,
        type: FILTER_TYPES.DROPDOWN
      },
      radiusSearch: {
        options: [5, 10, 15, 20, 25, 50, 100],
        default: null,
        type: FILTER_TYPES.SLIDER
      },
      saveable: { default: null, type: FILTER_TYPES.CHECKBOX }
    }
  }
];
