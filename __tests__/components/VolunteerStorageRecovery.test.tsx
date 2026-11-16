import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

const mockToken = jest.fn();
const mockUser = jest.fn();
const mockUpdate = jest.fn();
const mockStorePush = jest.fn();
const mockRevert = jest.fn();
const mockRefetch = jest.fn();
const mockResults = { results: [] };
const mockNotifications = {
  status: 200,
  data: {
    categories: [],
    settings: [
      { key: 'messages', category: 1, isEditable: true, target: 'mobile', isEnabled: true }
    ]
  }
};
jest.mock('react-query', () => ({
  useQuery: (key) => ({
    data: key === 'notifications' ? mockNotifications : mockResults,
    isLoading: false,
    isSuccess: true,
    refetch: mockRefetch
  }),
  useMutation: (query) => ({
    mutateAsync: query?.name === 'storePushToken' ? mockStorePush : mockUpdate
  })
}));
jest.mock('expo-router/react-navigation', () => ({ useIsFocused: () => true }));
jest.mock('react-native-elements', () => ({ Badge: () => null }));
jest.mock('../../src/config', () => ({
  consts: {
    ROOT_ROUTE_NAMES: {},
    GUID_REGEX: /guid/,
    IMAGE_TYPE_REGEX: /image/,
    PDF_TYPE_REGEX: /pdf/,
    VIDEO_TYPE_REGEX: /video/
  },
  normalize: (x) => x,
  texts: {
    volunteer: {
      retry: 'Retry',
      errorLoadingStoredData: 'Stored data unavailable',
      noUsers: 'No users'
    },
    accessibilityLabels: { actions: {} }
  }
}));
jest.mock('../../src/helpers', () => ({
  volunteerAuthToken: () => mockToken(),
  volunteerUserData: () => mockUser(),
  isAccount: () => false,
  isApplicant: () => false,
  isMember: () => false
}));
jest.mock('../../src/hooks', () => ({ useVolunteerRefresh: () => {} }));
jest.mock('../../src/hooks/useThemeStyles', () => ({ useThemeStyles: () => ({}) }));
jest.mock('../../src/queries', () => ({
  QUERY_TYPES: { VOLUNTEER: { USER_NOTIFICATION_SETTINGS: 'notifications' } }
}));
jest.mock('../../src/queries/volunteer', () => ({ storePushToken: function storePushToken() {} }));
jest.mock('../../src/types', () => ({
  ScreenName: {},
  MEMBER_STATUS_TYPES: { APPLICANT: 1, MEMBER: 2 }
}));
jest.mock('../../src/components/Button', () => ({
  Button: ({ title, onPress }: { title: string; onPress: () => void }) => {
    const { Pressable, Text } = jest.requireActual('react-native');
    return (
      <Pressable onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    );
  }
}));
jest.mock('../../src/components/Text', () => ({
  RegularText: jest.requireActual('react-native').Text,
  BoldText: jest.requireActual('react-native').Text
}));
jest.mock('../../src/components/Wrapper', () => {
  const { View } = jest.requireActual('react-native');
  return { Wrapper: View, WrapperRow: View, WrapperHorizontal: View };
});
jest.mock('../../src/components/SectionHeader', () => ({ SectionHeader: () => null }));
jest.mock('../../src/components/LoadingSpinner', () => ({
  LoadingSpinner: () => {
    const { Text } = jest.requireActual('react-native');
    return <Text>Loading</Text>;
  }
}));
jest.mock('../../src/components/Chat', () => ({ Chat: () => null }));
jest.mock('../../src/components/SettingsToggle', () => ({
  SettingsToggle: ({ item }: { item: { onActivate: (revert: () => void) => void } }) => {
    const { Pressable, Text } = jest.requireActual('react-native');
    return (
      <Pressable onPress={() => item.onActivate(mockRevert)}>
        <Text>Toggle</Text>
      </Pressable>
    );
  }
}));
jest.mock('../../src/components/volunteer/VolunteerCommentModal', () => ({
  VolunteerCommentModal: () => null
}));
jest.mock('../../src/components/volunteer/VolunteerPostListItem', () => ({
  VolunteerPostListItem: () => null
}));
jest.mock('../../src/components/volunteer/VolunteerPostModal', () => ({
  VolunteerPostModal: () => null
}));
jest.mock('../../src/components/volunteer/VolunteerPostTextField', () => ({
  VolunteerPostTextField: () => null
}));
jest.mock('../../src/components/volunteer/VolunteerAvatar', () => ({
  VolunteerAvatar: () => null
}));
jest.mock('../../src/components/form/DropdownInput', () => ({ DropdownInput: () => null }));
jest.mock('../../src/components/form/Input', () => ({ Input: () => null }));

import { VolunteerPosts } from '../../src/components/volunteer/VolunteerPosts';
import { VolunteerFormConversation } from '../../src/components/volunteer/VolunteerFormConversation';
import { VolunteerMessage } from '../../src/components/volunteer/VolunteerMessage';
import { VolunteerGroupMembersAndApplicants } from '../../src/components/volunteer/VolunteerGroupMembersAndApplicants';
import { VolunteerUserNotificationSettings } from '../../src/components/volunteer/VolunteerUserNotificationSettings';

const flush = async () => {
  await act(async () => {});
};
beforeEach(() => {
  jest.clearAllMocks();
  mockToken.mockRejectedValue(new Error('temporarily locked'));
  mockUser.mockRejectedValue(new Error('temporarily locked'));
  mockUpdate.mockResolvedValue({ code: 200 });
  mockStorePush.mockResolvedValue({ code: 200 });
});

it.each([
  [
    'posts',
    <VolunteerPosts
      key="posts"
      contentContainerId={1}
      isRefetching={false}
      navigation={{} as never}
      openWebScreen={() => {}}
    />
  ],
  [
    'conversation',
    <VolunteerFormConversation
      key="conversation"
      navigation={{} as never}
      route={{} as never}
      scrollToTop={() => {}}
    />
  ],
  [
    'message',
    <VolunteerMessage
      key="message"
      data={{ results: [] } as never}
      conversationId={1}
      refetch={() => {}}
    />
  ],
  [
    'members',
    <VolunteerGroupMembersAndApplicants
      key="members"
      {...({
        groupId: 1,
        setIsGroupMember: () => {},
        setIsGroupApplicant: () => {}
      } as React.ComponentProps<typeof VolunteerGroupMembersAndApplicants>)}
    />
  ]
])(
  '%s handles read rejection and retries without getting stuck loading',
  async (_name, component) => {
    const view = render(component);
    await flush();
    expect(view.getByText('Stored data unavailable')).toBeTruthy();
    expect(view.queryByText('Loading')).toBeNull();
    mockToken.mockResolvedValue('existing-token');
    mockUser.mockResolvedValue({ currentUserId: '7' });
    fireEvent.press(view.getByText('Retry'));
    await flush();
    expect(view.queryByText('Stored data unavailable')).toBeNull();
  }
);

it('retries token sync without reverting or resubmitting an acknowledged settings update', async () => {
  const view = render(<VolunteerUserNotificationSettings />);
  fireEvent.press(view.getByText('Toggle'));
  await flush();
  expect(view.getByText('Stored data unavailable')).toBeTruthy();
  expect(mockRevert).not.toHaveBeenCalled();
  mockToken.mockResolvedValue('existing-token');
  fireEvent.press(view.getByText('Retry'));
  await flush();
  expect(view.queryByText('Stored data unavailable')).toBeNull();
  expect(mockUpdate).toHaveBeenCalledTimes(1);
  expect(mockStorePush).toHaveBeenCalledWith('existing-token');
});

it('handles a failed settings mutation and reverts the optimistic toggle', async () => {
  mockUpdate.mockRejectedValue(new Error('offline'));
  const view = render(<VolunteerUserNotificationSettings />);
  fireEvent.press(view.getByText('Toggle'));
  await flush();
  expect(mockRevert).toHaveBeenCalledTimes(1);
  expect(mockToken).not.toHaveBeenCalled();
});
