import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert, DeviceEventEmitter } from 'react-native';

const mockMutate = jest.fn();
const mockMember = { member: { id: 'synthetic', email: 'synthetic@example.test' } };
let mockSubmission;
jest.mock('react-apollo', () => ({
  useMutation: () => [mockMutate, { loading: false }],
  useQuery: () => ({ data: {}, refetch: jest.fn() })
}));
jest.mock('react-query', () => ({ useQuery: () => ({ data: mockMember }) }));
jest.mock('react-hook-form', () => ({
  Controller: () => null,
  useForm: () => ({
    control: {},
    formState: { errors: {} },
    handleSubmit: (submit) => () => submit(mockSubmission),
    setValue: jest.fn(),
    watch: () => '',
    getValues: (key) => mockSubmission[key]
  })
}));
jest.mock('../../src/components', () => {
  const ReactLocal = jest.requireActual('react');
  const Pass = ({ children }) => children;
  const Null = () => null;
  return {
    Button: (props) => ReactLocal.createElement('mock-button', props),
    Checkbox: Null,
    DateTimeInput: Null,
    DocumentSelector: Null,
    HtmlView: Null,
    Input: Null,
    Label: Null,
    LoadingSpinner: Null,
    MultiImageSelector: Null,
    RegularText: Pass,
    Touchable: Pass,
    Wrapper: Pass,
    WrapperHorizontal: Pass,
    WrapperRow: Pass
  };
});
jest.mock('../../src/components/selectors', () => ({
  DocumentSelector: () => null,
  MultiImageSelector: () => null
}));
jest.mock('../../src/NetworkProvider', () => ({
  NetworkContext: jest
    .requireActual('react')
    .createContext({ isConnected: true, isMainserverUp: true })
}));
jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: jest.requireActual('react').createContext({ globalSettings: { settings: {} } })
}));
jest.mock('../../src/helpers', () => ({
  formatSizeStandard: String,
  graphqlFetchPolicy: () => 'network-only',
  momentFormat: () => '2026-11-16',
  parseListItemsFromQuery: () => [],
  storeTokens: jest.fn()
}));
jest.mock('../../src/hooks', () => ({ useStaticContent: () => ({}) }));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/hooks/useThemeStyles', () => ({ useThemeStyles: () => ({}) }));
jest.mock('../../src/queries', () => ({
  ...jest.requireActual('../../src/queries/types'),
  getQuery: () => ({})
}));
jest.mock('../../src/queries/profile', () => ({ member: jest.fn() }));
jest.mock('../../src/queries/mediaContent', () => ({ uploadMediaContent: jest.fn() }));
jest.mock('../../src/screens/profile/ProfileScreen', () => ({ showLoginAgainAlert: jest.fn() }));

import { texts } from '../../src/config';
import { DETAIL_REFRESH_EVENT } from '../../src/hooks/DetailRefresh';
import { NoticeboardCreateForm } from '../../src/components/noticeboard/NoticeboardCreateForm';
import { ProfileNoticeboardCreateForm } from '../../src/components/profile/noticeboard/ProfileNoticeboardCreateForm';

beforeEach(() => {
  mockMutate.mockReset().mockResolvedValue({ data: { createGenericItem: { id: 'saved' } } });
  mockSubmission = {
    id: '',
    body: 'Synthetic body',
    title: 'Synthetic title',
    name: 'Synthetic',
    email: 'synthetic@example.test',
    noticeboardType: 'offer',
    image: '[]',
    documents: '[]',
    dateStart: '2026-11-16',
    dateEnd: '2026-11-17',
    price: '',
    priceType: '€',
    termsOfService: true
  };
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

it.each([
  ['public create', NoticeboardCreateForm, false, false],
  ['public edit', NoticeboardCreateForm, true, false],
  ['profile create', ProfileNoticeboardCreateForm, false, false],
  ['profile edit', ProfileNoticeboardCreateForm, true, false],
  ['public failure', NoticeboardCreateForm, true, true],
  ['profile failure', ProfileNoticeboardCreateForm, true, true]
])(
  '%s emits invalidation before returning only after an acknowledged save',
  async (_name, Form, editing, fails) => {
    const emit = jest.spyOn(DeviceEventEmitter, 'emit');
    const goBack = jest.fn(() => expect(emit).toHaveBeenCalledWith(DETAIL_REFRESH_EVENT));
    if (fails) mockMutate.mockRejectedValueOnce(new Error('temporary failure'));
    mockSubmission.id = editing ? 'existing' : '';
    let tree;
    try {
      await act(async () => {
        tree = renderer.create(
          <Form
            {...({
              data: editing ? { id: 'existing' } : {},
              queryVariables: {},
              route: { params: { genericType: 'Noticeboard' } },
              navigation: { goBack }
            } as never)}
          />
        );
      });
      expect(emit).not.toHaveBeenCalledWith(DETAIL_REFRESH_EVENT);
      const button = tree.root
        .findAllByType('mock-button')
        .find(
          ({ props }) =>
            props.title === (editing ? texts.noticeboard.editButton : texts.noticeboard.sendButton)
        );
      await act(async () => {
        button.props.onPress();
      });
      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(goBack).toHaveBeenCalledTimes(fails ? 0 : 1);
      expect(emit.mock.calls.filter(([event]) => event === DETAIL_REFRESH_EVENT)).toHaveLength(
        fails ? 0 : 1
      );
    } finally {
      await act(async () => tree?.unmount());
    }
  }
);
