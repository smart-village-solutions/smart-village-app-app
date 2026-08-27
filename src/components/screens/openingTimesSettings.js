export const isOpeningTimesGroupingEnabled = (settings = {}) =>
  settings?.openingTimes?.groupByWeekday === true;
