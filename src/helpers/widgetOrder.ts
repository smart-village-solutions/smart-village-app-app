import { normalizeWidgetName, type WidgetConfig } from '../klimaTaler/settings';

import { balancedWidgetRowSizes } from './widgetLayout';

export const identifyWidgets = (configs: WidgetConfig[]) => {
  const occurrences = new Map<string, number>();
  return configs.map((config) => {
    const name = normalizeWidgetName(typeof config === 'string' ? config : config.widgetName);
    const base = typeof config !== 'string' && config.id ? `id:${config.id}` : `widget:${name}`;
    const occurrence = occurrences.get(base) ?? 0;
    occurrences.set(base, occurrence + 1);
    return { config, id: `${base}:${occurrence}` };
  });
};

export const applyWidgetOrder = <T extends { id: string }>(items: T[], order: unknown): T[] => {
  if (!Array.isArray(order)) return items;
  const remaining = new Map(items.map((item) => [item.id, item]));
  const result: T[] = [];
  order.forEach((id) => {
    const item = remaining.get(id);
    if (item) {
      result.push(item);
      remaining.delete(id);
    }
  });
  return [...result, ...remaining.values()];
};

// Explicit rows avoid percentage-width rounding causing premature Yoga wrapping.
// A full-width card splits compact runs without changing the configured order.
export const widgetRows = <T extends { fullWidth: boolean }>(
  items: T[],
  columns: number,
  balanceRows = false
): T[][] => {
  const rows: T[][] = [];
  const columnCount = Math.max(1, columns);
  let compactRun: T[] = [];

  const flush = () => {
    if (balanceRows) {
      let offset = 0;
      for (const size of balancedWidgetRowSizes(compactRun.length, columnCount)) {
        rows.push(compactRun.slice(offset, offset + size));
        offset += size;
      }
    } else {
      for (let offset = 0; offset < compactRun.length; offset += columnCount) {
        rows.push(compactRun.slice(offset, offset + columnCount));
      }
    }

    compactRun = [];
  };

  for (const item of items) {
    if (item.fullWidth) {
      flush();
      rows.push([item]);
    } else {
      compactRun.push(item);
    }
  }

  flush();
  return rows;
};

export type WidgetBounds = { id: string; x: number; y: number; width: number; height: number };

export const widgetDropTarget = (bounds: WidgetBounds[], x: number, y: number) => {
  const candidates = bounds.filter((item) => item.width > 0 && item.height > 0);
  if (!candidates.length) return undefined;
  const distance = (item: WidgetBounds) =>
    Math.max(item.x - x, 0, x - item.x - item.width) ** 2 +
    Math.max(item.y - y, 0, y - item.y - item.height) ** 2;
  const nearest = candidates.reduce((a, b) => (distance(a) <= distance(b) ? a : b), candidates[0]);
  // Ignore drops outside the widget area; allow the gaps between adjacent cards.
  return distance(nearest) <= 32 ** 2 ? nearest.id : undefined;
};

export const moveWidget = (order: string[], source: string, target?: string) => {
  const from = order.indexOf(source);
  const to = target === undefined ? -1 : order.indexOf(target);
  if (from < 0 || to < 0 || from === to) return order;
  const next = [...order];
  next.splice(from, 1);
  next.splice(to, 0, source);
  return next;
};
