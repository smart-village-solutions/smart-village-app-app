import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import changers from '../../modules/expo-changers';
import { SettingsContext } from '../../src/SettingsProvider';
import { VoucherListItem } from '../../src/components/vouchers/VoucherListItem';
import { isKlimaTalerEnabled, openKlimaTaler } from '../../src/klimaTaler/entry';
import type { TVoucherItem } from '../../src/types';

jest.mock('../../modules/expo-changers', () => ({
  __esModule: true,
  default: { getStatus: jest.fn() }
}));
jest.mock('../../src/klimaTaler/entry', () => ({
  isKlimaTalerEnabled: jest.fn(),
  openKlimaTaler: jest.fn()
}));
jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: jest.requireActual('react').createContext({
    globalSettings: { settings: { 'klima-taler': true } }
  })
}));
jest.mock('../../src/config', () => ({
  Icon: { ArrowRight: () => null },
  normalize: (value: number) => value,
  texts: jest.requireActual('../../src/config/texts').texts
}));
jest.mock('../../src/helpers', () => ({ imageWidth: () => 360, imageHeight: () => 150 }));
jest.mock('../../src/queries', () => ({ QUERY_TYPES: { VOUCHERS: 'vouchers' } }));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/hooks/useThemeStyles', () => ({
  useThemeStyles: (createStyles: (colors: object) => object) =>
    createStyles({ transparent: 'transparent' })
}));
jest.mock('react-native-elements', () => ({
  Card: jest.requireActual('react-native').View,
  Divider: jest.requireActual('react-native').View
}));
jest.mock('../../src/components/Image', () => ({ Image: () => null }));
jest.mock('../../src/components/Text', () => ({
  RegularText: jest.requireActual('react-native').Text,
  BoldText: jest.requireActual('react-native').Text
}));
jest.mock('../../src/components/Wrapper', () => ({
  WrapperHorizontal: jest.requireActual('react-native').View,
  WrapperRow: jest.requireActual('react-native').View,
  WrapperVertical: jest.requireActual('react-native').View
}));
jest.mock('../../src/components/vouchers/Discount', () => ({ Discount: () => null }));

const payload = {
  klimaTaler: {
    schemaVersion: 1,
    environment: 'stage',
    redemptionMode: 'provider',
    locationId: 266,
    offerId: 761,
    remaining: 50,
    cost: 2,
    deeplink: 'https://open.klima-taler.com/offers/761'
  }
};
const item = {
  id: '881',
  title: 'Imported coupon',
  routeName: 'VoucherDetail',
  params: { query: 'voucher', queryVariables: { id: '881' } },
  payload
} as unknown as TVoucherItem;
const navigation = { push: jest.fn() };

const card = (voucher = item, direct = true) => (
  <VoucherListItem
    item={voucher}
    navigation={navigation as never}
    horizontal={false}
    openKlimaTalerOffer={direct}
  />
);

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(changers.getStatus).mockResolvedValue({ environment: 'stage' } as never);
  jest.mocked(isKlimaTalerEnabled).mockReturnValue(true);
  jest.mocked(openKlimaTaler).mockResolvedValue(undefined);
});

test('a POI coupon opens the provider offer ID directly, without pushing a voucher detail', async () => {
  const screen = render(card());
  expect(openKlimaTaler).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText(item.title));
  await waitFor(() => expect(openKlimaTaler).toHaveBeenCalledWith(761));
  expect(navigation.push).not.toHaveBeenCalled();
});

test('other voucher lists preserve the existing local detail route for imported coupons', () => {
  const screen = render(card(item, false));
  fireEvent.press(screen.getByLabelText(item.title));
  expect(navigation.push).toHaveBeenCalledWith(item.routeName, item.params);
  expect(changers.getStatus).not.toHaveBeenCalled();
  expect(openKlimaTaler).not.toHaveBeenCalled();
});

test('ordinary POI coupons retain their detail navigation when KT is disabled', () => {
  jest.mocked(isKlimaTalerEnabled).mockReturnValue(false);
  const ordinary = { ...item, payload: { id: 'normal-voucher' } };
  const screen = render(
    <SettingsContext.Provider
      value={{ globalSettings: { settings: { 'klima-taler': false } } } as never}
    >
      {card(ordinary)}
    </SettingsContext.Provider>
  );
  fireEvent.press(screen.getByLabelText(item.title));
  expect(navigation.push).toHaveBeenCalledWith(ordinary.routeName, ordinary.params);
  expect(changers.getStatus).not.toHaveBeenCalled();
  expect(openKlimaTaler).not.toHaveBeenCalled();
});

test.each([
  { klimaTaler: { ...payload.klimaTaler, remaining: 0 } },
  { klimaTaler: { ...payload.klimaTaler, schemaVersion: 2 } },
  { klimaTaler: { ...payload.klimaTaler, offerId: '761' } }
])('unavailable provider data cannot open the SDK or fall back to a local voucher: %p', (data) => {
  const screen = render(card({ ...item, payload: data } as unknown as TVoucherItem));
  const coupon = screen.getByLabelText(item.title);
  expect(coupon.props.accessibilityState.disabled).toBe(true);
  fireEvent.press(coupon);
  expect(changers.getStatus).not.toHaveBeenCalled();
  expect(openKlimaTaler).not.toHaveBeenCalled();
  expect(navigation.push).not.toHaveBeenCalled();
});

test('a disabled module cannot open an imported POI coupon', () => {
  const screen = render(
    <SettingsContext.Provider
      value={{ globalSettings: { settings: { 'klima-taler': false } } } as never}
    >
      {card()}
    </SettingsContext.Provider>
  );
  fireEvent.press(screen.getByLabelText(item.title));
  expect(changers.getStatus).not.toHaveBeenCalled();
  expect(navigation.push).not.toHaveBeenCalled();
});

test('environment mismatch reports unavailability without opening a dashboard or local detail', async () => {
  jest.mocked(changers.getStatus).mockResolvedValue({ environment: 'production' } as never);
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  try {
    const screen = render(card());
    fireEvent.press(screen.getByLabelText(item.title));
    await waitFor(() => expect(alert).toHaveBeenCalled());
    expect(openKlimaTaler).not.toHaveBeenCalled();
    expect(navigation.push).not.toHaveBeenCalled();
  } finally {
    alert.mockRestore();
  }
});

test('duplicate taps share one opening, and the same and another offer can be reopened', async () => {
  let finish!: () => void;
  jest
    .mocked(openKlimaTaler)
    .mockImplementationOnce(() => new Promise<void>((resolve) => (finish = resolve)));
  const screen = render(card());
  fireEvent.press(screen.getByLabelText(item.title));
  fireEvent.press(screen.getByLabelText(item.title));
  await waitFor(() => expect(openKlimaTaler).toHaveBeenCalledTimes(1));
  expect(screen.queryByText('Klima-Taler wird geöffnet …')).toBeNull();
  expect(screen.getByLabelText(item.title).props.accessibilityState).toEqual({
    busy: true,
    disabled: true
  });
  await act(async () => finish());
  fireEvent.press(screen.getByLabelText(item.title));
  await waitFor(() => expect(openKlimaTaler).toHaveBeenCalledTimes(2));
  const second = {
    ...item,
    id: '882',
    payload: {
      klimaTaler: {
        ...payload.klimaTaler,
        offerId: 762,
        deeplink: 'https://open.klima-taler.com/offers/762'
      }
    }
  } as unknown as TVoucherItem;
  screen.rerender(card(second));
  fireEvent.press(screen.getByLabelText(item.title));
  await waitFor(() => expect(openKlimaTaler).toHaveBeenLastCalledWith(762));
  expect(navigation.push).not.toHaveBeenCalled();
});

test('temporary native failure restores the card so the user can retry', async () => {
  jest.mocked(changers.getStatus).mockRejectedValueOnce(new Error('Temporary native failure'));
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  try {
    const screen = render(card());
    fireEvent.press(screen.getByLabelText(item.title));
    await waitFor(() => expect(alert).toHaveBeenCalled());
    expect(screen.getByLabelText(item.title).props.accessibilityState.disabled).toBe(false);
    fireEvent.press(screen.getByLabelText(item.title));
    await waitFor(() => expect(openKlimaTaler).toHaveBeenCalledWith(761));
    expect(navigation.push).not.toHaveBeenCalled();
  } finally {
    alert.mockRestore();
  }
});
