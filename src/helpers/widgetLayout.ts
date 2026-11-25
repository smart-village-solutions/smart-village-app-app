import { resolveResponsiveGridLayout } from './responsiveGridLayout';

const COMPACT_GRID_MAX_TEXT_SCALE = 1.1;
const LARGE_TEXT_MAX_COLUMNS = 2;
const WIDGET_MAX_COLUMNS = 5;
const WIDGET_MIN_WIDTH = 64;

type WidgetLayoutOptions = {
  availableWidth: number;
  balanceWidgetRows?: boolean;
  itemCount: number;
  minItemWidth?: number;
  textScale: number;
};

export const resolveWidgetLayout = ({
  availableWidth,
  balanceWidgetRows = false,
  itemCount,
  minItemWidth = WIDGET_MIN_WIDTH,
  textScale
}: WidgetLayoutOptions) => {
  const layout = resolveResponsiveGridLayout({
    availableWidth,
    balanceLastRow: false,
    gap: 0,
    itemCount,
    maxColumns:
      textScale > COMPACT_GRID_MAX_TEXT_SCALE ? LARGE_TEXT_MAX_COLUMNS : WIDGET_MAX_COLUMNS,
    minItemWidth,
    textScale
  });

  if (balanceWidgetRows !== true || itemCount <= 0) return { ...layout, rowSizes: undefined };

  // Keep the minimum row count allowed by width/text size, distributing items evenly.
  // Unlike reducing columns for a singleton, this never adds rows or forces a list.
  const rowCount = Math.ceil(itemCount / layout.columns);
  const smallerRowSize = Math.floor(itemCount / rowCount);
  const largerRowCount = itemCount % rowCount;
  const rowSizes = Array.from(
    { length: rowCount },
    (_, index) => smallerRowSize + (index < largerRowCount ? 1 : 0)
  );
  const columns = rowSizes[0];

  return { columns, itemWidth: availableWidth / columns, rowSizes };
};
