export type ResourceFilters = {
  config: {
    [key in keyof FilterProps]: {
      dateEnd?: DatesTypes;
      dateStart?: DatesTypes;
      default: boolean;
      isMultiselect?: boolean;
      options?: string[];
      searchable?: boolean;
      type?: string;
    };
  };
  dataResourceType: string;
};

export type FilterTypesProps = {
  checked?: boolean;
  currentPosition?: {
    label?: string;
    placeholder?: string;
  };
  data: DropdownProps[] | DatesTypes[] | StatusProps[] | number[];
  isMultiselect?: boolean;
  label?: string;
  name: keyof FilterProps;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  type?: string;
  value?: string;
};

export type FilterProps = {
  active?: string;
  category?: string;
  categoryId?: string;
  categoryIds?: string;
  dataProvider?: string;
  dataProviderId?: string;
  date?: string;
  dateEnd?: string;
  dateRange?: string[];
  dateStart?: string;
  end_date?: string;
  ids?: string;
  initial_start_date?: string;
  location?: string;
  radiusSearch?: {
    currentPosition?: boolean;
    distance?: number;
    index?: number;
  };
  saveable?: string;
  service_code?: string;
  sort?: string;
  sortBy?: string;
  start_date?: string;
  status?: string;
};

export type DropdownProps = {
  filterValue?: string;
  id: number;
  index: number;
  selected: boolean;
  value: string;
};

export type StatusProps = {
  codesForFilter: string;
  iconName: string;
  matchingStatuses: string[];
  status: string;
};

export type DatesTypes = {
  hasFutureDates?: boolean;
  hasPastDates?: boolean;
  name: keyof FilterProps;
  placeholder: string;
};
