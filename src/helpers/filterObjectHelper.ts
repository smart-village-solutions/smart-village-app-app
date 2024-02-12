type TFilter = {
  condition: boolean;
  currentFilter: { [key: string]: string | undefined };
  name: string;
  value: string;
};

export const updateFilter = ({ condition, currentFilter, name, value }: TFilter) => {
  const updatedFilter = { ...currentFilter };

  if (condition) {
    delete updatedFilter[name];
  } else {
    updatedFilter[name] = value;
  }

  return updatedFilter;
};
