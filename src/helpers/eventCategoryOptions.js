import _uniqBy from 'lodash/uniqBy';

export const eventCategoryOptions = (data, queryVariables = {}) => {
  const availableCategoryNames = new Set(
    data?.eventRecords?.flatMap((event) => event.categories?.map(({ name }) => name) || []) || []
  );

  return _uniqBy(
    (data?.categories || []).filter(
      (category) =>
        category.upcomingEventRecordsCount > 0 && availableCategoryNames.has(category.name)
    ),
    'name'
  ).map((category, index) => ({
    index: index + 1,
    id: category.id,
    value: category.name,
    selected:
      category.id === queryVariables.categoryId || queryVariables.categoryIds?.includes(category.id)
  }));
};
