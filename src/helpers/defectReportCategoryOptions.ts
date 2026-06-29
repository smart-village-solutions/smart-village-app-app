type DefectReportCategory = {
  id: number;
  name: string;
  position?: number | null;
};

export const buildDefectReportCategoryOptions = (categories: DefectReportCategory[] = []) => {
  return [...categories]
    .sort((left, right) => {
      const leftPosition = left.position ?? 0;
      const rightPosition = right.position ?? 0;

      if (leftPosition !== rightPosition) {
        return leftPosition - rightPosition;
      }

      return left.name.localeCompare(right.name);
    })
    .map((category) => ({
      id: category.id,
      name: category.name,
      value: category.name
    }));
};
