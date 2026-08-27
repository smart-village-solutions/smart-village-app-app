import { resolveResponsiveGridLayout } from './responsiveGridLayout';

const COMPACT_GRID_MAX_TEXT_SCALE = 1.1;
const LARGE_TEXT_MAX_COLUMNS = 2;
const WIDGET_MAX_COLUMNS = 5;
const WIDGET_MIN_WIDTH = 64;

type WidgetLayoutOptions = {
  availableWidth: number;
  itemCount: number;
  minItemWidth?: number;
  textScale: number;
};

export const resolveWidgetLayout = ({
  availableWidth,
  itemCount,
  minItemWidth = WIDGET_MIN_WIDTH,
  textScale
}: WidgetLayoutOptions) =>
  resolveResponsiveGridLayout({
    availableWidth,
    balanceLastRow: false,
    gap: 0,
    itemCount,
    maxColumns:
      textScale > COMPACT_GRID_MAX_TEXT_SCALE ? LARGE_TEXT_MAX_COLUMNS : WIDGET_MAX_COLUMNS,
    minItemWidth,
    textScale
  });
