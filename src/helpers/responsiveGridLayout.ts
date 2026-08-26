export type ResponsiveGridLayout = {
  columns: number;
  itemWidth: number;
};

type ResponsiveGridLayoutOptions = {
  availableWidth: number;
  balanceLastRow?: boolean;
  gap: number;
  itemCount: number;
  maxColumns: number;
  minItemWidth: number;
  textScale?: number;
};

const positiveNumberOr = (value: number, fallback: number) =>
  Number.isFinite(value) && value > 0 ? value : fallback;

export const resolveEffectiveTextScale = (systemFontScale = 1, appTextScaleMultiplier = 1) =>
  positiveNumberOr(systemFontScale, 1) * positiveNumberOr(appTextScaleMultiplier, 1);

export const resolveResponsiveGridLayout = ({
  availableWidth,
  balanceLastRow = true,
  gap,
  itemCount,
  maxColumns,
  minItemWidth,
  textScale = 1
}: ResponsiveGridLayoutOptions): ResponsiveGridLayout => {
  const safeAvailableWidth = Math.max(0, availableWidth);
  const safeGap = Math.max(0, gap);
  const safeItemCount = Math.max(0, Math.floor(itemCount));
  const safeMaxColumns = Math.max(1, Math.floor(maxColumns));
  const safeTextScale = positiveNumberOr(textScale, 1);
  const scaledMinItemWidth = Math.max(48, minItemWidth * safeTextScale);

  if (!safeItemCount) {
    return { columns: 1, itemWidth: safeAvailableWidth };
  }

  const columnsByWidth = Math.max(
    1,
    Math.floor((safeAvailableWidth + safeGap) / (scaledMinItemWidth + safeGap))
  );
  let columns = Math.max(1, Math.min(safeItemCount, safeMaxColumns, columnsByWidth));

  if (balanceLastRow && columns > 1 && safeItemCount > columns && safeItemCount % columns === 1) {
    columns -= 1;
  }

  const itemWidth = Math.max(
    0,
    (safeAvailableWidth - safeGap * Math.max(0, columns - 1)) / columns
  );

  return { columns, itemWidth };
};
