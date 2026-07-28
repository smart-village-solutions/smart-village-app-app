import type { ResolvedThemeMode } from '../types/Theme';

type ConfigurationObject = Record<string, unknown>;

const isConfigurationObject = (value: unknown): value is ConfigurationObject =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const mergeConfiguration = (
  baseConfiguration: ConfigurationObject,
  overrideConfiguration: ConfigurationObject
): ConfigurationObject =>
  Object.entries(overrideConfiguration).reduce(
    (configuration, [key, overrideValue]) => {
      const baseValue = configuration[key];

      configuration[key] =
        isConfigurationObject(baseValue) && isConfigurationObject(overrideValue)
          ? mergeConfiguration(baseValue, overrideValue)
          : overrideValue;

      return configuration;
    },
    { ...baseConfiguration }
  );

const resolveConfigurationValue = (value: unknown, mode: ResolvedThemeMode): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => resolveConfigurationValue(item, mode));
  }

  if (!isConfigurationObject(value)) return value;

  const { dark, ...baseConfiguration } = value;
  const resolvedBaseConfiguration = Object.entries(baseConfiguration).reduce(
    (configuration, [key, baseValue]) => {
      configuration[key] = resolveConfigurationValue(baseValue, mode);
      return configuration;
    },
    {} as ConfigurationObject
  );

  if (mode !== 'dark' || !isConfigurationObject(dark)) {
    return resolvedBaseConfiguration;
  }

  return mergeConfiguration(
    resolvedBaseConfiguration,
    resolveConfigurationValue(dark, mode) as ConfigurationObject
  );
};

/**
 * Recursively applies `dark` overrides to a theme-aware remote value.
 *
 * The helper preserves the input shape, including arrays, and removes all
 * consumed `dark` metadata from the resolved result.
 */
export const resolveThemeOverrides = <T>(value: T, mode: ResolvedThemeMode): T =>
  resolveConfigurationValue(value, mode) as T;

/**
 * Resolves remote app design-system styles for the active theme.
 *
 * Root values remain the shared/light configuration. A `dark` object can be
 * added at any level and is recursively merged over the root values in dark
 * mode. Theme metadata is removed from the resolved object before styles are
 * passed to React Native components.
 */
export const resolveAppDesignSystem = (
  appDesignSystem: unknown,
  mode: ResolvedThemeMode
): ConfigurationObject =>
  isConfigurationObject(appDesignSystem) ? resolveThemeOverrides(appDesignSystem, mode) : {};
