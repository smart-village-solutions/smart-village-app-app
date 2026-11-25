import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, View } from 'react-native';

import { darkColors, lightColors } from '../../src/config/colors';
import { ThemeContext } from '../../src/ThemeContext';
import { AccessibilityContext } from '../../src/AccessibilityProvider';
import { KlimaTalerWidget } from '../../src/components/widgets/KlimaTalerWidget';
import { openKlimaTaler } from '../../src/klimaTaler/entry';
import type { KlimaTalerWidgetOptions } from '../../src/klimaTaler/widgetConfiguration';
import { SummaryState } from '../../src/klimaTaler/createSummary';

let mockState: SummaryState = { phase: 'loading' };
let mockOpening = false;
const mockNavigation = { navigate: jest.fn() };
jest.mock('expo-router/react-navigation', () => ({
  useNavigation: () => mockNavigation,
  useFocusEffect: () => undefined
}));
jest.mock('../../src/hooks', () => ({ useHomeRefresh: () => undefined }));
jest.mock('../../src/klimaTaler/summary', () => ({
  klimaTalerSummary: { subscribe: () => () => undefined, getSnapshot: () => mockState }
}));
const mockIdle = { phase: 'idle' };
const mockPending = { phase: 'opening' };
jest.mock('../../src/klimaTaler/entry', () => ({
  openKlimaTaler: jest.fn(),
  klimaTalerEntry: {
    subscribe: () => () => undefined,
    getSnapshot: () => (mockOpening ? mockPending : mockIdle)
  }
}));
jest.mock('../../src/config', () => ({ normalize: (value: number) => value }));

beforeEach(() => {
  mockOpening = false;
  jest.clearAllMocks();
});

test('real zero is prominent, with direct modal entry and no diagnostic labels', () => {
  mockState = { phase: 'ready', coins: 0 };
  const screen = render(<KlimaTalerWidget />);
  expect(screen.getByLabelText('Deine Klima-Taler: 0')).toBeTruthy();
  expect(screen.queryByText(/Anbieterstatistik|Abzeichen/)).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Mein Bereich' }));
  expect(openKlimaTaler).toHaveBeenCalledWith();
  expect(mockNavigation.navigate).not.toHaveBeenCalled();
});

test('a missing session shows the promotional card', () => {
  mockState = { phase: 'noSession' };
  const screen = render(<KlimaTalerWidget />);
  expect(screen.getByText(/Dein Klima-/)).toBeTruthy();
  expect(screen.getByText('Taler sammeln. Vorteile vor Ort entdecken.')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Klima-Taler entdecken' }));
  expect(openKlimaTaler).toHaveBeenCalledWith();
  expect(screen.queryByText('0')).toBeNull();
});

test.each(['loading', 'empty', 'error', 'unsupported'] as const)(
  '%s is not displayed as zero and remains actionable',
  (phase) => {
    mockState = { phase };
    const screen = render(<KlimaTalerWidget />);
    expect(screen.queryByText('0')).toBeNull();
    expect(screen.getByLabelText('Deine Klima-Taler: –')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mein Bereich' })).toBeTruthy();
  }
);

test('opening keeps the card in place and disables repeated taps', () => {
  mockState = { phase: 'loading' };
  mockOpening = true;
  const screen = render(<KlimaTalerWidget />);
  expect(screen.getByTestId('klimaTalerCard')).toBeTruthy();
  const button = screen.getByRole('button', { name: 'Klima-Taler wird geöffnet …' });
  expect(button.props.accessibilityState).toMatchObject({ busy: true, disabled: true });
  fireEvent.press(button);
  expect(openKlimaTaler).not.toHaveBeenCalled();
});

test('refresh status keeps a scaled line without an empty accessibility announcement', () => {
  const widget = (showStatus = true) => (
    <AccessibilityContext.Provider value={{ textScaleMultiplier: 2 } as never}>
      <KlimaTalerWidget additionalProps={{ show: { status: showStatus } }} />
    </AccessibilityContext.Provider>
  );
  mockState = { phase: 'loading' };
  const screen = render(widget());
  const loading = screen.getByTestId('klimaTalerStatus');
  expect(loading.props.children).toBe('Wird geladen …');
  expect(loading).toHaveStyle({ lineHeight: 36 });

  mockState = { phase: 'ready', coins: 0 };
  screen.rerender(widget());
  const reserved = screen.getByTestId('klimaTalerStatus', { includeHiddenElements: true });
  expect(reserved.props.children).toBe('\u00a0');
  expect(reserved.props.accessible).toBe(false);
  expect(reserved.props.accessibilityLiveRegion).toBe('none');
  expect(reserved).toHaveStyle({ lineHeight: 36 });
  expect(screen.queryByTestId('klimaTalerStatus')).toBeNull();

  mockState = { phase: 'error', coins: 0, stale: true };
  screen.rerender(widget());
  expect(screen.getByText('Zuletzt bestätigte Punkte')).toBeTruthy();
  expect(screen.getByTestId('klimaTalerStatus').props.numberOfLines).toBeUndefined();
  screen.rerender(widget(false));
  expect(screen.queryByTestId('klimaTalerStatus', { includeHiddenElements: true })).toBeNull();
});

test('large text keeps the complete balance accessible in a separate vertical layout', () => {
  mockState = { phase: 'ready', coins: 12345 };
  const screen = render(
    <AccessibilityContext.Provider value={{ textScaleMultiplier: 2 } as never}>
      <KlimaTalerWidget />
    </AccessibilityContext.Provider>
  );
  expect(screen.getByLabelText('Deine Klima-Taler: 12.345')).toBeTruthy();
  const copy = screen.UNSAFE_getAllByType(View).find((view) => view.props.onLayout);
  fireEvent(copy!, 'layout', { nativeEvent: { layout: { width: 248 } } });
  const balance = screen.getByLabelText('Deine Klima-Taler: 12.345');
  expect(balance.props.numberOfLines).toBeUndefined();
  expect(balance.props.adjustsFontSizeToFit).toBe(false);
  expect(StyleSheet.flatten(balance.props.style).fontSize).toBe(92);
});

const configured = (additionalProps: KlimaTalerWidgetOptions) => (
  <KlimaTalerWidget additionalProps={additionalProps} />
);

test('explicit shortcuts show honest placeholders and remote settings can hide or redirect each action', () => {
  mockState = { phase: 'ready', coins: 0 };
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  const screen = render(
    configured({ actions: { wallet: true, map: true, badges: true, settings: true } })
  );
  ['Wallet', 'Karte', 'Abzeichen', 'Einstellungen'].forEach((name) => {
    fireEvent.press(screen.getByRole('button', { name }));
  });
  expect(alert).toHaveBeenCalledTimes(4);
  expect(alert).toHaveBeenLastCalledWith('Bald verfügbar', 'Diese Funktion wird bald ergänzt.');
  expect(openKlimaTaler).not.toHaveBeenCalled();
  screen.rerender(
    configured({
      actions: {
        wallet: false,
        map: { enabled: false },
        badges: false,
        settings: false,
        main: { label: 'Öffnen' }
      }
    })
  );
  expect(screen.queryByRole('button', { name: 'Wallet' })).toBeNull();
  expect(screen.getAllByRole('button')).toHaveLength(1);
  fireEvent.press(screen.getByRole('button', { name: 'Öffnen' }));
  expect(openKlimaTaler).toHaveBeenCalledTimes(1);
  alert.mockRestore();
});

test('uses a standard icon, customer logo, and the standard fallback on image failure', () => {
  mockState = { phase: 'ready', coins: 0 };
  const screen = render(configured({}));
  expect(screen.getByTestId('klimaTalerDefaultIcon', { includeHiddenElements: true })).toBeTruthy();
  screen.rerender(configured({ logo: { uri: 'https://example.org/logo.png' } }));
  expect(screen.queryByTestId('klimaTalerDefaultIcon', { includeHiddenElements: true })).toBeNull();
  fireEvent(screen.UNSAFE_getByType(Image), 'error');
  expect(screen.getByTestId('klimaTalerDefaultIcon', { includeHiddenElements: true })).toBeTruthy();
  screen.rerender(configured({ logo: { uri: 'https://example.org/new.png' } }));
  expect(screen.queryByTestId('klimaTalerDefaultIcon', { includeHiddenElements: true })).toBeNull();
});

test('remote text, visibility, status and styles override defaults without remounting', () => {
  mockState = { phase: 'ready', coins: 0, stale: true };
  const screen = render(
    configured({
      texts: { balance: 'Mein Guthaben' },
      statusTexts: { stale: 'Offline' },
      colors: { background: '#123456' },
      styles: { card: { borderRadius: 24 } },
      show: { logo: false },
      actions: { main: false }
    })
  );
  expect(screen.getByLabelText('Mein Guthaben: 0')).toBeTruthy();
  expect(screen.getByText('Offline')).toBeTruthy();
  expect(screen.queryByTestId('klimaTalerDefaultIcon', { includeHiddenElements: true })).toBeNull();
  expect(StyleSheet.flatten(screen.getByTestId('klimaTalerCard').props.style)).toMatchObject({
    backgroundColor: '#123456',
    borderRadius: 24
  });
  expect(screen.queryByRole('button', { name: 'Mein Bereich' })).toBeNull();
  screen.rerender(configured({ show: { balance: false, status: false } }));
  expect(screen.queryByText('0')).toBeNull();
  expect(screen.queryByText('Offline')).toBeNull();
});

test('theme switching updates the mounted card and its buttons', () => {
  mockState = { phase: 'ready', coins: 25 };
  const themed = (dark: boolean) => (
    <ThemeContext.Provider
      value={{
        colors: dark ? darkColors : lightColors,
        isDark: dark,
        mode: dark ? 'dark' : 'light'
      }}
    >
      <KlimaTalerWidget />
    </ThemeContext.Provider>
  );
  const screen = render(themed(false));
  expect(screen.getByTestId('klimaTalerCard')).toHaveStyle({
    backgroundColor: lightColors.primary
  });
  screen.rerender(themed(true));
  expect(screen.getByTestId('klimaTalerCard')).toHaveStyle({ backgroundColor: darkColors.primary });
  expect(screen.getByLabelText('Deine Klima-Taler: 25')).toHaveStyle({
    color: darkColors.onPrimary
  });
  expect(screen.getByRole('button', { name: 'Mein Bereich' })).toHaveStyle({
    backgroundColor: darkColors.onPrimary
  });
});

test('high contrast overrides branding colors and keeps all actions separately accessible', () => {
  mockState = { phase: 'ready', coins: 25 };
  const screen = render(
    <AccessibilityContext.Provider value={{ isHighContrastEnabled: true } as never}>
      {configured({
        actions: { wallet: true, map: true, badges: true, settings: true },
        styles: {
          card: { backgroundColor: '#ffff00', opacity: 0.2 },
          balance: { color: '#eeeeee' }
        }
      })}
    </AccessibilityContext.Provider>
  );
  expect(screen.getByTestId('klimaTalerCard')).toHaveStyle({
    backgroundColor: lightColors.surface,
    opacity: 1,
    borderColor: lightColors.text
  });
  expect(screen.getByLabelText('Deine Klima-Taler: 25')).toHaveStyle({ color: lightColors.text });
  expect(screen.getAllByRole('button')).toHaveLength(5);
  const shortcut = screen.getByRole('button', { name: 'Wallet' });
  expect(shortcut.props.accessibilityHint).toBe('Diese Funktion wird bald ergänzt.');
  expect(shortcut).toHaveStyle({ minWidth: 48, minHeight: 48 });
});

test('bold text and reduced motion use shared preferences without hiding the busy state', () => {
  mockState = { phase: 'ready', coins: 25 };
  mockOpening = true;
  const screen = render(
    <AccessibilityContext.Provider
      value={{ isBoldTextEnabled: true, isReduceMotionEnabled: true } as never}
    >
      <KlimaTalerWidget />
    </AccessibilityContext.Provider>
  );
  expect(screen.getByLabelText('Deine Klima-Taler: 25')).toHaveStyle({ fontFamily: 'bold' });
  expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  expect(
    screen.getByRole('button', { name: 'Klima-Taler wird geöffnet …' }).props.accessibilityState
  ).toEqual({ busy: true, disabled: true });
});

test('configured dark colors follow live theme changes without affecting the light variant', () => {
  mockState = { phase: 'ready', coins: 25 };
  const themed = (dark: boolean) => (
    <ThemeContext.Provider
      value={{
        colors: dark ? darkColors : lightColors,
        isDark: dark,
        mode: dark ? 'dark' : 'light'
      }}
    >
      {configured({
        colors: {
          background: '#123456',
          text: '#ffffff',
          dark: { background: '#222222', text: '#eeeeee', button: '#444444' }
        }
      })}
    </ThemeContext.Provider>
  );
  const screen = render(themed(false));
  expect(screen.getByTestId('klimaTalerCard')).toHaveStyle({ backgroundColor: '#123456' });
  screen.rerender(themed(true));
  expect(screen.getByTestId('klimaTalerCard')).toHaveStyle({ backgroundColor: '#222222' });
  expect(screen.getByLabelText('Deine Klima-Taler: 25')).toHaveStyle({ color: '#eeeeee' });
  expect(screen.getByRole('button', { name: 'Mein Bereich' })).toHaveStyle({
    backgroundColor: '#444444'
  });
  screen.rerender(themed(false));
  expect(screen.getByTestId('klimaTalerCard')).toHaveStyle({ backgroundColor: '#123456' });
});

test('unconfigured shortcuts stay hidden without inventing badges or redirecting destinations', () => {
  mockState = { phase: 'ready', coins: 42 };
  const screen = render(<KlimaTalerWidget />);
  expect(screen.getAllByRole('button')).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'Mein Bereich' })).toBeTruthy();
  for (const name of ['Wallet', 'Karte', 'Abzeichen', 'Einstellungen']) {
    expect(screen.queryByRole('button', { name })).toBeNull();
  }
});
