import { resolveResponsiveGridLayout } from './responsiveGridLayout';

const COMPACT_GRID_MAX_TEXT_SCALE = 1.1;
const WIDGET_MAX_COLUMNS = 5;
const WIDGET_MIN_WIDTH = 64;

type WidgetLayoutOptions = {
  availableWidth: number;
  itemCount: number;
  textScale: number;
};

export const resolveWidgetLayout = ({
  availableWidth,
  itemCount,
  textScale
}: WidgetLayoutOptions) =>
  resolveResponsiveGridLayout({
    availableWidth,
    balanceLastRow: textScale > COMPACT_GRID_MAX_TEXT_SCALE,
    gap: 0,
    itemCount,
    maxColumns: WIDGET_MAX_COLUMNS,
    minItemWidth: WIDGET_MIN_WIDTH,
    textScale
  });
