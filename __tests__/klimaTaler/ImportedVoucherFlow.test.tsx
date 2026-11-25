import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { VoucherDetailScreen } from '../../src/screens/Voucher/VoucherDetailScreen';
import { redeemImportedKlimaTalerVoucher } from '../../src/klimaTaler/redeemImportedVoucher';

const mockUseVoucher = jest.fn();
let mockVoucher: Record<string, unknown>;
let mockMemberId: string | undefined;
const mockLocalRedeem = jest.fn();

jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: jest.requireActual('react').createContext({
    globalSettings: { settings: { 'klima-taler': true } }
  })
}));
jest.mock('../../src/klimaTaler/redeemImportedVoucher', () => ({
  redeemImportedKlimaTalerVoucher: jest.fn()
}));
jest.mock('../../src/ReactQueryClient', () => ({ ReactQueryClient: jest.fn() }));
jest.mock('react-query', () => ({
  useQuery: (key: unknown[]) => ({
    data:
      key[0] === 'voucher' && !(key[1] as { memberId?: string })?.memberId
        ? { genericItem: mockVoucher }
        : undefined,
    isLoading: false,
    refetch: jest.fn()
  })
}));
jest.mock('../../src/queries', () => ({
  QUERY_TYPES: { GENERIC_ITEM: 'genericItem', VOUCHERS: 'vouchers' },
  getQuery: jest.fn()
}));
jest.mock('../../src/hooks', () => ({
  useOpenWebScreen: jest.fn(),
  useVoucher: (enabled: boolean) => {
    mockUseVoucher(enabled);
    return { autoLogin: jest.fn(), isLoading: false, isLoggedIn: false, memberId: mockMemberId };
  }
}));
jest.mock('../../src/helpers', () => ({
  dateOfAvailabilityText: jest.fn(),
  parseListItemsFromQuery: () => []
}));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/ReadAloudAvailabilityProvider', () => ({
  useReadAloudScrollContentContainerStyle: () => ({})
}));
jest.mock('../../src/config', () => ({
  texts: jest.requireActual('../../src/config/texts').texts
}));
jest.mock('../../src/components', () => {
  const React = jest.requireActual('react');
  const { View, Text } = jest.requireActual('react-native');
  const empty = () => null;
  return {
    BoldText: Text,
    RegularText: Text,
    Wrapper: View,
    Button: empty,
    Discount: empty,
    HtmlView: empty,
    ImageSection: empty,
    LoadingSpinner: empty,
    OperatingCompany: empty,
    ReadAloudContent: empty,
    SectionHeader: empty,
    VoucherListItem: empty,
    VoucherRedeem: (props: unknown) => {
      mockLocalRedeem(props);
      return React.createElement(Text, null, 'Local redemption');
    }
  };
});
jest.mock('../../src/components/Text', () => ({
  RegularText: jest.requireActual('react-native').Text
}));
jest.mock('../../src/components/Button', () => ({
  Button: ({
    title,
    onPress,
    disabled
  }: {
    title: string;
    onPress: () => void;
    disabled: boolean;
  }) => {
    const React = jest.requireActual('react');
    const { Pressable, Text } = jest.requireActual('react-native');
    return React.createElement(
      Pressable,
      {
        onPress,
        disabled,
        accessibilityRole: 'button',
        accessibilityLabel: title,
        accessibilityState: { disabled }
      },
      React.createElement(Text, null, title)
    );
  }
}));

const providerPayload = {
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
const props = {
  navigation: { push: jest.fn() },
  route: { params: { query: 'voucher', queryVariables: { id: '881' } } }
} as unknown as React.ComponentProps<typeof VoucherDetailScreen>;

beforeEach(() => {
  jest.clearAllMocks();
  mockMemberId = undefined;
  mockVoucher = { id: '881', title: 'Imported coupon', payload: providerPayload };
  jest.mocked(redeemImportedKlimaTalerVoucher).mockResolvedValue(undefined);
});

test('coupon detail remains local until use is pressed, with no local SVA redemption session', async () => {
  const screen = render(<VoucherDetailScreen {...props} />);
  expect(screen.getByText('Imported coupon')).toBeTruthy();
  expect(redeemImportedKlimaTalerVoucher).not.toHaveBeenCalled();
  expect(mockUseVoucher).not.toHaveBeenCalledWith(true);
  expect(mockLocalRedeem).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'In Klima-Taler nutzen' }));
  await waitFor(() =>
    expect(redeemImportedKlimaTalerVoucher).toHaveBeenCalledWith(providerPayload)
  );
});

test('ordinary coupons retain local login and redemption', async () => {
  mockVoucher = { ...mockVoucher, payload: {}, quota: { availableQuantity: 2 } };
  render(<VoucherDetailScreen {...props} />);
  await waitFor(() => expect(mockUseVoucher).toHaveBeenCalledWith(true));
  expect(mockLocalRedeem).toHaveBeenCalled();
  expect(redeemImportedKlimaTalerVoucher).not.toHaveBeenCalled();
});

test('ordinary discount coupons retain local redemption without a quota', () => {
  mockVoucher = { ...mockVoucher, payload: {}, discountType: { discountPercentage: 10 } };
  const screen = render(<VoucherDetailScreen {...props} />);
  expect(screen.getByText('Local redemption')).toBeTruthy();
  expect(mockUseVoucher).toHaveBeenCalledWith(true);
  expect(redeemImportedKlimaTalerVoucher).not.toHaveBeenCalled();
});

test('ordinary coupons cannot redeem using a public quota while personalized quota is unavailable', () => {
  mockMemberId = 'local-member';
  mockVoucher = { ...mockVoucher, payload: {}, quota: { availableQuantity: 2 } };
  render(<VoucherDetailScreen {...props} />);
  expect(mockLocalRedeem).not.toHaveBeenCalled();
  expect(redeemImportedKlimaTalerVoucher).not.toHaveBeenCalled();
});

test('malformed provider data cannot fall back to local quota redemption', () => {
  mockVoucher = {
    ...mockVoucher,
    payload: { klimaTaler: { schemaVersion: 2 } },
    quota: { availableQuantity: 2 }
  };
  const screen = render(<VoucherDetailScreen {...props} />);
  expect(
    screen.getByRole('button', { name: 'Nicht verfügbar' }).props.accessibilityState.disabled
  ).toBe(true);
  expect(mockUseVoucher).not.toHaveBeenCalledWith(true);
  expect(mockLocalRedeem).not.toHaveBeenCalled();
});

test('repeated taps during opening do not launch another modal and failures allow retry', async () => {
  let reject!: (reason: Error) => void;
  jest.mocked(redeemImportedKlimaTalerVoucher).mockImplementationOnce(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      })
  );
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  const screen = render(<VoucherDetailScreen {...props} />);
  fireEvent.press(screen.getByRole('button', { name: 'In Klima-Taler nutzen' }));
  fireEvent.press(screen.getByRole('button', { name: 'Klima-Taler wird geöffnet …' }));
  expect(redeemImportedKlimaTalerVoucher).toHaveBeenCalledTimes(1);
  reject(new Error('Native failure'));
  await waitFor(() => expect(alert).toHaveBeenCalled());
  expect(
    screen.getByRole('button', { name: 'In Klima-Taler nutzen' }).props.accessibilityState.disabled
  ).toBe(false);
  alert.mockRestore();
});
