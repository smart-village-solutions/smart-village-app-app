import { FilterProps } from '../components';

type TFilter = {
  currentFilters: FilterProps;
  name: keyof FilterProps;
  removeFromFilter: boolean;
  value: string;
};

export const updateFilters = ({ currentFilters, name, removeFromFilter, value }: TFilter) => {
  const updatedFilters = { ...currentFilters };

  if (removeFromFilter) {
    delete updatedFilters[name];
  } else {
    updatedFilters[name] = value;
  }

  return updatedFilters;
};
