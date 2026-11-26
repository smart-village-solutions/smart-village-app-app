import type { WidgetProps } from '../types';

import { configurationObject } from './widgetConfiguration';

type GlobalSettings =
  | { settings?: Record<string, unknown> | null; [key: string]: unknown }
  | null
  | undefined;
export type WidgetConfig = string | ({ widgetName: string; id?: string } & WidgetProps);

export const isKlimaTalerConfigured = (globalSettings: GlobalSettings) => {
  const value = globalSettings?.settings?.['klima-taler'];
  return value === true || (typeof value === 'object' && value !== null && !Array.isArray(value));
};

export const normalizeWidgetName = (name: string) => (name === 'klima-taler' ? 'klimaTaler' : name);

// Module activation supplies a default card. Explicit widget settings always win.
export const klimaTalerWidgets = (globalSettings: GlobalSettings, widgets: WidgetConfig[] = []) => {
  const isKlimaTaler = (widget: WidgetConfig) =>
    normalizeWidgetName(typeof widget === 'string' ? widget : widget.widgetName) === 'klimaTaler';
  if (!isKlimaTalerConfigured(globalSettings))
    return widgets.filter((widget) => !isKlimaTaler(widget));
  if (widgets.some(isKlimaTaler))
    return widgets.filter(
      (widget) =>
        !isKlimaTaler(widget) ||
        typeof widget === 'string' ||
        configurationObject(widget.additionalProps).enabled !== false
    );
  return [...widgets, { widgetName: 'klimaTaler' }];
};
