export const sectionEventData = (data = []) => {
  const groupedByDate = {};

  const chronologicallySortedData = [...data].sort(
    (firstItem, secondItem) =>
      `${firstItem.listDate || ''}`.localeCompare(`${secondItem.listDate || ''}`) ||
      `${firstItem.startTime || ''}`.localeCompare(`${secondItem.startTime || ''}`)
  );

  chronologicallySortedData.forEach((item) => {
    if (!item.listDate) return;

    if (!groupedByDate[item.listDate]) {
      groupedByDate[item.listDate] = [];
    }

    groupedByDate[item.listDate].push(item);
  });

  return Object.entries(groupedByDate).flatMap(([listDate, items]) => [listDate, ...items]);
};
