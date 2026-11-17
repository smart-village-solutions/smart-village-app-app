import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View
} from 'react-native';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { Icon } from '../../config/icons/Icon';
import { resolveEffectiveTextScale } from '../../helpers/responsiveGridLayout';
import type { SummaryState } from '../../klimaTaler/createSummary';
import type {
  KlimaTalerAction,
  KlimaTalerWidgetConfiguration
} from '../../klimaTaler/widgetConfiguration';
import { Text } from '../Text';

type Props = {
  state: SummaryState;
  opening?: boolean;
  config: KlimaTalerWidgetConfiguration;
  onAction: (action: KlimaTalerAction) => void;
};

const formatCoins = (config: KlimaTalerWidgetConfiguration, coins?: number) => {
  if (coins === undefined) return config.texts.unavailableBalance;
  try {
    return coins.toLocaleString(config.texts.locale);
  } catch {
    return coins.toLocaleString('de-DE');
  }
};

export const KlimaTalerCard = ({ state, opening = false, config, onAction }: Props) => {
  const promo = state.phase === 'noSession';
  const visible = (name: KlimaTalerAction) =>
    config.actions[name].enabled && (!promo || config.actions[name].showInPromo);
  const action = (name: KlimaTalerAction) =>
    visible(name) && (
      <CardAction
        key={name}
        name={name}
        config={config}
        promo={promo}
        opening={opening}
        onAction={onAction}
      />
    );

  return (
    <View
      style={[styles.card, { backgroundColor: config.colors.background }, config.styles.card]}
      testID="klimaTalerCard"
    >
      <View style={styles.header}>
        <CardSummary state={state} config={config} promo={promo} />
        {action('settings')}
      </View>
      <View style={[styles.actions, config.styles.actions]}>
        {(['main', 'wallet', 'map', 'badges'] as const).map(action)}
      </View>
    </View>
  );
};

const CardLogo = ({ config, promo }: { config: KlimaTalerWidgetConfiguration; promo: boolean }) => {
  const [failedUri, setFailedUri] = useState<string>();
  if (!config.show.logo) return null;
  const logoStyle = [styles.logo, promo && styles.promoLogo, config.styles.logo];
  const uri = config.logo.uri;
  return uri && uri !== failedUri && /^https:\/\//i.test(uri) ? (
    <Image
      accessible={false}
      importantForAccessibility="no"
      source={{ uri }}
      style={logoStyle}
      resizeMode="contain"
      onError={() => setFailedUri(uri)}
    />
  ) : (
    <View
      style={[logoStyle, styles.icon]}
      testID="klimaTalerDefaultIcon"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Icon.NamedIcon
        name={config.logo.icon}
        size={promo ? config.logo.promoSize : config.logo.size}
        color={config.logo.color || config.colors.text}
      />
    </View>
  );
};

const balanceSize = (config: KlimaTalerWidgetConfiguration) => config.styles.balance.fontSize ?? 46;

const CardSummary = ({
  state,
  config,
  promo
}: Pick<Props, 'state' | 'config'> & { promo: boolean }) => {
  const { textScaleMultiplier } = useContext(AccessibilityContext);
  const { fontScale } = useWindowDimensions();
  const effectiveScale = resolveEffectiveTextScale(fontScale, textScaleMultiplier);
  const largeText = effectiveScale > 1.3;
  const balanceVisible = !promo && config.show.balance;
  return (
    <View style={[styles.summary, largeText && styles.stacked, config.styles.summary]}>
      <CardLogo config={config} promo={promo} />
      <View style={[styles.copy, largeText && styles.stackedCopy]}>
        {config.show.title && (
          <Text
            italic={false}
            accessibilityRole="header"
            accessible={!balanceVisible}
            importantForAccessibility={balanceVisible ? 'no' : 'auto'}
            style={[
              styles.label,
              promo && styles.title,
              { color: config.colors.text },
              config.styles.title
            ]}
          >
            {promo ? config.texts.title : config.texts.balance}
          </Text>
        )}
        {promo && config.show.description && (
          <Text
            italic={false}
            style={[styles.description, { color: config.colors.text }, config.styles.description]}
          >
            {config.texts.description}
          </Text>
        )}
        {!promo && <CardBalanceRow state={state} config={config} scale={effectiveScale} />}
      </View>
    </View>
  );
};

const CardBalanceRow = ({
  state,
  config,
  scale
}: Pick<Props, 'state' | 'config'> & { scale: number }) => {
  const [numberWidth, setNumberWidth] = useState(0);
  return (
    <View style={styles.balanceRow}>
      <View
        style={styles.balanceValue}
        onLayout={({ nativeEvent }) => setNumberWidth(nativeEvent.layout.width)}
      >
        {config.show.balance && (
          <CardBalance
            config={config}
            value={formatCoins(config, state.coins)}
            width={numberWidth}
            scale={scale}
          />
        )}
      </View>
      {config.show.status && <CardStatus state={state} config={config} />}
    </View>
  );
};

const CardStatus = ({ state, config }: Pick<Props, 'state' | 'config'>) => {
  const { isReduceMotionEnabled } = useContext(AccessibilityContext);
  const status = state.stale ? config.statusTexts.stale : config.statusTexts[state.phase];
  const color =
    typeof config.styles.status.color === 'string'
      ? config.styles.status.color
      : config.colors.text;
  // Reserve horizontal space only, keeping the balance width stable during refresh.
  if (!status) return <View style={styles.statusIndicator} />;
  if (state.phase === 'loading') {
    return (
      <View
        style={styles.statusIndicator}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={status}
        accessibilityState={{ busy: true }}
        accessibilityLiveRegion="polite"
      >
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {isReduceMotionEnabled ? (
            <Icon.NamedIcon name="refresh" size={22} color={color} />
          ) : (
            <ActivityIndicator color={color} size="small" />
          )}
        </View>
      </View>
    );
  }
  return (
    <Pressable
      style={styles.statusIndicator}
      accessibilityRole="button"
      accessibilityLabel={status}
      accessibilityLiveRegion="polite"
      onPress={() => Alert.alert(config.texts.balance, status)}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Icon.Info size={22} color={color} />
      </View>
    </Pressable>
  );
};

const CardBalance = ({
  config,
  value,
  width,
  scale
}: {
  config: KlimaTalerWidgetConfiguration;
  value: string;
  width: number;
  scale: number;
}) => {
  const largeText = scale > 1.3;
  const baseSize = balanceSize(config);
  const numberSize =
    width && !largeText
      ? Math.min(baseSize, width / (Math.max(1, value.length) * 0.65 * scale))
      : baseSize;
  return (
    <Text
      italic={false}
      style={[
        styles.coins,
        { color: config.colors.text },
        config.styles.balance,
        { fontSize: numberSize, lineHeight: (numberSize * 54) / 46 }
      ]}
      numberOfLines={largeText ? undefined : 1}
      adjustsFontSizeToFit={!largeText}
      minimumFontScale={largeText ? 1 : 0.3}
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${config.texts.balance}: ${value}`}
    >
      {value}
    </Text>
  );
};

const CardAction = ({
  name,
  config,
  promo,
  opening,
  onAction
}: Omit<Props, 'state'> & { name: KlimaTalerAction; promo: boolean }) => {
  const { isReduceMotionEnabled, isReduceTransparencyEnabled, isHighContrastEnabled } =
    useContext(AccessibilityContext);
  const main = name === 'main';
  const action = config.actions[name];
  const label = promo ? action.promoLabel : action.label;
  const busy = !!opening && action.target === 'provider';
  const color = main ? config.colors.buttonText : config.colors.shortcutIcon;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={busy ? config.texts.opening : label}
      accessibilityHint={
        action.target === 'provider'
          ? undefined
          : action.alertMessage || config.texts.comingSoonMessage
      }
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={() => onAction(name)}
      style={({ pressed }) => [
        styles.button,
        main ? styles.mainButton : styles.shortcut,
        name === 'settings' && styles.settings,
        { backgroundColor: main ? config.colors.button : config.colors.shortcut },
        main ? config.styles.button : config.styles.shortcut,
        styles.touchTarget,
        pressed && !(isReduceTransparencyEnabled || isHighContrastEnabled) && styles.pressed
      ]}
    >
      {main && (
        <Text italic={false} style={[styles.buttonText, { color }, config.styles.buttonText]}>
          {label}
        </Text>
      )}
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {busy && !isReduceMotionEnabled ? (
          <ActivityIndicator color={color} size="small" />
        ) : (
          <Icon.NamedIcon name={action.icon} size={main ? 20 : 22} color={color} />
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 20, gap: 14, minHeight: 180 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  summary: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 80 },
  stacked: { flexDirection: 'column', alignItems: 'flex-start' },
  stackedCopy: { flex: 0, width: '100%' },
  logo: { width: 72, height: 80 },
  promoLogo: { width: 60, height: 60 },
  icon: { alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  label: { fontFamily: 'regular', fontSize: 14, lineHeight: 18 },
  title: { fontFamily: 'condbold', fontSize: 21, lineHeight: 25 },
  description: { fontFamily: 'regular', fontSize: 14, lineHeight: 18 },
  coins: { fontFamily: 'bold', fontSize: 46, lineHeight: 54, fontVariant: ['tabular-nums'] },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceValue: { flex: 1, minWidth: 0 },
  statusIndicator: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'stretch' },
  button: {
    borderRadius: 10,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  mainButton: { flexGrow: 1, flexBasis: 130, paddingHorizontal: 12, paddingVertical: 10 },
  shortcut: { width: 48, minHeight: 48 },
  touchTarget: { minWidth: 48, minHeight: 48 },
  settings: { borderRadius: 22 },
  buttonText: { fontFamily: 'condbold', fontSize: 15, lineHeight: 20, flexShrink: 1 },
  pressed: { opacity: 0.8 }
});
