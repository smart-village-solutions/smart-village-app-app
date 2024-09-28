export type ResourceFilters = {
  config: {
    [key in keyof FilterProps]: {
      default: boolean;
      hasFutureDates?: boolean;
      hasPastDates?: boolean;
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
  data:
    | DropdownProps[]
    | { name: keyof FilterProps; placeholder: string }[]
    | StatusProps[]
    | number[];
  label?: string;
  name: keyof FilterProps;
  placeholder?: string;
  type?: string;
  value?: string;
  isMultiselect?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
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
  radiusSearch?: string;
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
