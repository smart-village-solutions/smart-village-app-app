import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

import { texts } from '../config/texts';
import type { ResolvedThemeMode, ThemeColorPalette } from '../types/Theme';

export const configurationObject = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

// Remote JSON only overrides known scalar fields with values of the expected type.
const mergeFields = <T extends Record<string, string | boolean | number>>(
  defaults: T,
  value: unknown
): { [K in keyof T]: T[K] extends boolean ? boolean : T[K] } => {
  const source = configurationObject(value);
  return Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => [
      key,
      typeof source[key] === typeof fallback ? source[key] : fallback
    ])
  ) as { [K in keyof T]: T[K] extends boolean ? boolean : T[K] };
};

export const KLIMA_TALER_ACTIONS = ['main', 'wallet', 'map', 'badges', 'settings'] as const;
export type KlimaTalerAction = (typeof KLIMA_TALER_ACTIONS)[number];
export type CardStyles = {
  card: ViewStyle;
  summary: ViewStyle;
  logo: ImageStyle;
  title: TextStyle;
  description: TextStyle;
  balance: TextStyle;
  status: TextStyle;
  actions: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  shortcut: ViewStyle;
};

export const resolveKlimaTalerWidget = (
  additionalProps: unknown,
  colors: ThemeColorPalette,
  title?: string,
  mode: ResolvedThemeMode = 'light'
) => {
  const widget = configurationObject(additionalProps);
  const copy = texts.klimaTaler.card;
  const actions = configurationObject(widget.actions);
  return {
    enabled: widget.enabled !== false,
    texts: mergeFields(
      {
        title: title ?? copy.title,
        description: copy.description,
        balance: title ?? copy.balance,
        opening: texts.klimaTaler.opening,
        unavailableBalance: '–',
        locale: 'de-DE',
        comingSoonTitle: copy.comingSoonTitle,
        comingSoonMessage: copy.comingSoonMessage
      },
      widget.texts
    ),
    statusTexts: mergeFields(texts.klimaTaler.widget, widget.statusTexts),
    show: mergeFields(
      { logo: true, title: true, description: true, balance: true, status: true },
      widget.show
    ),
    logo: mergeFields({ uri: '', icon: 'leaf', color: '', size: 64, promoSize: 52 }, widget.logo),
    colors: mergeFields(
      mergeFields(
        {
          background: colors.primary,
          text: colors.onPrimary,
          button: colors.onPrimary,
          buttonText: colors.primary,
          shortcut: colors.lighterPrimaryRgba,
          shortcutIcon: colors.onPrimary
        },
        widget.colors
      ),
      mode === 'dark' ? configurationObject(widget.colors).dark : undefined
    ),
    styles: Object.fromEntries(
      [
        'card',
        'summary',
        'logo',
        'title',
        'description',
        'balance',
        'status',
        'actions',
        'button',
        'buttonText',
        'shortcut'
      ].map((slot) => [slot, configurationObject(configurationObject(widget.styles)[slot])])
    ) as unknown as CardStyles,
    actions: Object.fromEntries(
      KLIMA_TALER_ACTIONS.map((name) => {
        const defaults = {
          main: { label: copy.open, promoLabel: copy.discover, icon: 'arrow-right' },
          wallet: { label: copy.wallet, promoLabel: copy.wallet, icon: 'wallet' },
          map: { label: copy.map, promoLabel: copy.map, icon: 'map-pin' },
          badges: { label: copy.badges, promoLabel: copy.badges, icon: 'medal' },
          settings: { label: copy.settings, promoLabel: copy.settings, icon: 'settings' }
        };
        const action = mergeFields(
          {
            ...defaults[name],
            // Preserve explicitly configured shortcuts; unfinished defaults stay hidden.
            enabled:
              name === 'main' ||
              actions[name] === true ||
              Object.keys(configurationObject(actions[name])).length > 0,
            showInPromo: name === 'main' || name === 'map',
            target:
              name === 'main'
                ? 'provider'
                : name === 'map'
                ? 'map'
                : name === 'badges'
                ? 'badges'
                : 'comingSoon',
            alertTitle: '',
            alertMessage: ''
          },
          actions[name]
        );
        if (actions[name] === false) action.enabled = false;
        return [name, action];
      })
    ) as Record<
      KlimaTalerAction,
      {
        label: string;
        promoLabel: string;
        icon: string;
        enabled: boolean;
        showInPromo: boolean;
        target: string;
        alertTitle: string;
        alertMessage: string;
      }
    >
  };
};
export type KlimaTalerWidgetConfiguration = ReturnType<typeof resolveKlimaTalerWidget>;

export type KlimaTalerWidgetOptions = {
  enabled?: boolean;
  texts?: Partial<KlimaTalerWidgetConfiguration['texts']>;
  statusTexts?: Partial<KlimaTalerWidgetConfiguration['statusTexts']>;
  show?: Partial<KlimaTalerWidgetConfiguration['show']>;
  logo?: Partial<KlimaTalerWidgetConfiguration['logo']>;
  colors?: Partial<KlimaTalerWidgetConfiguration['colors']> & {
    dark?: Partial<KlimaTalerWidgetConfiguration['colors']>;
  };
  styles?: Partial<CardStyles>;
  actions?: Partial<
    Record<
      KlimaTalerAction,
      boolean | Partial<KlimaTalerWidgetConfiguration['actions'][KlimaTalerAction]>
    >
  >;
};
