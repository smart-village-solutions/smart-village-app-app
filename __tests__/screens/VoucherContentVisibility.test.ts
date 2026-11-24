import { VoucherDetailScreen } from '../../src/screens/Voucher/VoucherDetailScreen';

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '4.3.0',
  nativeBuildVersion: '1500'
}));

let mockVoucher: Record<string, unknown>;
const mockAutoLogin = jest.fn();

// Exercise the route without native rendering; legacy renderer versions differ from React.
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: (value: unknown) => [value, jest.fn()],
  useCallback: (callback: unknown) => callback,
  useMemo: (callback: () => unknown) => callback()
}));
jest.mock('react-native', () => ({
  ScrollView: 'ScrollView',
  RefreshControl: 'RefreshControl',
  FlatList: 'FlatList'
}));
jest.mock('react-query', () => ({
  useQuery: ([query]: string[]) => ({
    data: query === 'voucher' ? { genericItem: mockVoucher } : { genericItems: [] },
    isLoading: false,
    refetch: jest.fn()
  })
}));
jest.mock('../../src/ReactQueryClient', () => ({ ReactQueryClient: jest.fn() }));
jest.mock('../../src/components', () => ({
  BoldText: 'BoldText',
  Button: 'Button',
  Discount: 'Discount',
  EmptyMessage: 'EmptyMessage',
  HtmlView: 'HtmlView',
  ImageSection: 'ImageSection',
  LoadingSpinner: 'LoadingSpinner',
  OperatingCompany: 'OperatingCompany',
  RegularText: 'RegularText',
  SectionHeader: 'SectionHeader',
  VoucherListItem: 'VoucherListItem',
  VoucherRedeem: 'VoucherRedeem',
  Wrapper: 'Wrapper',
  INITIAL_VOUCHER_COUNT: 3,
  INCREMENT_VOUCHER_COUNT: 3
}));
jest.mock('../../src/config', () => ({
  colors: {},
  texts: {
    empty: { content: 'Unavailable' },
    voucher: { detailScreen: { frequency: () => '', limit: () => '' } }
  }
}));
jest.mock('../../src/helpers', () => ({
  dateOfAvailabilityText: () => '',
  parseListItemsFromQuery: () => []
}));
jest.mock('../../src/hooks', () => ({
  useOpenWebScreen: () => jest.fn(),
  useVoucher: () => ({
    autoLogin: mockAutoLogin,
    isLoggedIn: true,
    memberId: '1',
    isLoading: false
  })
}));
jest.mock('../../src/queries', () => ({
  getQuery: jest.fn(),
  QUERY_TYPES: { GENERIC_ITEM: 'genericItem', VOUCHERS: 'vouchers' }
}));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/ReadAloudAvailabilityProvider', () => ({
  useReadAloudScrollContentContainerStyle: () => ({})
}));
jest.mock('../../src/types', () => ({ ScreenName: {} }));

const props = {
  route: { params: { query: 'voucher', queryVariables: { id: '7079' } } },
  navigation: {}
};

it.each([
  { id: '7079', payload: { minVersion: '5.0.0', minBuild: 1573 } },
  { id: '7079', payload: { minVersion: '5.0.0' } },
  { id: '7079', payload: { minBuild: 1573 } }
])('blocks restricted voucher routes before rendering redemption controls: %p', (voucher) => {
  mockVoucher = voucher;
  const element = VoucherDetailScreen(props as never);
  expect(element.type).toBe('EmptyMessage');
  expect(element.props.title).toBe('Unavailable');
  expect(mockAutoLogin).not.toHaveBeenCalled();
});

it('keeps ordinary voucher details available', () => {
  mockVoucher = {
    id: '10',
    title: 'Normal',
    dates: [],
    mediaContents: [],
    contentBlocks: [],
    payload: {},
    quota: { availableQuantity: 5 }
  };
  const element = VoucherDetailScreen(props as never);
  expect(element.type).toBe('ScrollView');
});
