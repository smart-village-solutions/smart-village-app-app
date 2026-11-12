import { renderHook, waitFor } from '@testing-library/react-native';

import { useVoucher } from '../../src/hooks/voucherHooks';

const mockLogin = jest.fn();
const mockStoreToken = jest.fn();
jest.mock('../../src/NetworkProvider', () => ({
  NetworkContext: jest.requireActual('react').createContext({ isConnected: true })
}));
jest.mock('react-query', () => ({
  useMutation: () => ({ mutateAsync: mockLogin })
}));
jest.mock('react-apollo', () => ({ useMutation: () => [jest.fn()] }));
jest.mock('../../src/queries/profile', () => ({ profileLogIn: jest.fn() }));
jest.mock('../../src/queries/vouchers', () => ({ REDEEM_QUOTA_OF_VOUCHER: {} }));
jest.mock('../../src/helpers', () => ({ addToStore: jest.fn(), readFromStore: jest.fn() }));
jest.mock('../../src/helpers/voucherHelper', () => ({
  voucherAuthKey: async () => 'local-test-key',
  voucherAuthToken: async () => 'existing-local-test-token',
  voucherMemberId: async () => 'local-member',
  storeVoucherAuthToken: (token: string) => mockStoreToken(token),
  storeVoucherMemberId: jest.fn(),
  storeVoucherMemberLoginInfo: jest.fn()
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockLogin.mockResolvedValue({
    member: { id: 'local-member', authentication_token: 'local-test-token' }
  });
});

test('disabled sessions perform no local login or credential write, then activate on demand', async () => {
  const screen = renderHook(({ enabled }) => useVoucher(enabled), {
    initialProps: { enabled: false }
  });
  expect(mockLogin).not.toHaveBeenCalled();
  expect(mockStoreToken).not.toHaveBeenCalled();
  screen.rerender({ enabled: true });
  await waitFor(() => expect(screen.result.current.isLoggedIn).toBe(true));
  expect(mockLogin).toHaveBeenCalledTimes(1);
  expect(mockStoreToken).toHaveBeenCalledWith('local-test-token');
  screen.rerender({ enabled: false });
  expect(mockStoreToken).toHaveBeenCalledTimes(1);
});

test('ordinary callers retain the default local session behavior', async () => {
  const screen = renderHook(() => useVoucher());
  await waitFor(() => expect(screen.result.current.isLoggedIn).toBe(true));
  expect(mockLogin).toHaveBeenCalledTimes(1);
});
