import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { SueReportSend } from '../../src/components/SUE/report/SueReportSend';
import { QUERY_TYPES } from '../../src/queries/types';
import { ScreenName } from '../../src/types';

jest.mock('../../src/ConfigurationsProvider', () => ({
  ConfigurationsContext: jest.requireActual('react').createContext({})
}));
jest.mock('../../src/config', () => ({
  device: { platform: 'ios' },
  normalize: (value: number) => value,
  texts: {
    sue: {
      myReports: 'Meine Meldungen',
      viewMyReports: 'Meine Meldungen ansehen',
      report: { sendReportDone: {} }
    }
  }
}));
jest.mock('../../src/hooks', () => ({
  useAppInfo: () => ({}),
  useKeyboardHeight: () => 0
}));
jest.mock('../../src/queries', () => ({
  QUERY_TYPES: { APP_USER_CONTENT: 'appUserContent' },
  createQuery: jest.fn()
}));
jest.mock('../../src/queries/SUE', () => ({ sendUserFeedback: jest.fn() }));
jest.mock('react-apollo', () => ({ useMutation: () => [jest.fn(), { loading: false }] }));
jest.mock('react-native-elements', () => ({ Divider: () => null, Rating: () => null }));
jest.mock('../../src/components/Button', () => ({
  Button: ({ title, onPress }: { title: string; onPress: () => void }) => {
    const { Pressable, Text } = jest.requireActual('react-native');
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    );
  }
}));
jest.mock('../../src/components/DefaultKeyboardAvoidingView', () => ({
  DefaultKeyboardAvoidingView: jest.requireActual('react-native').View
}));
jest.mock('../../src/components/Wrapper', () => ({
  Wrapper: jest.requireActual('react-native').View
}));
jest.mock('../../src/components/Text', () => ({
  BoldText: jest.requireActual('react-native').Text,
  RegularText: jest.requireActual('react-native').Text
}));
jest.mock('../../src/components/Image', () => ({ Image: () => null }));
jest.mock('../../src/components/form', () => ({ Input: () => null }));

it('opens saved reports from the completion screen', () => {
  const navigate = jest.fn();
  const { getByRole } = render(
    <SueReportSend isDone isLoading={false} navigation={{ navigate }} deliveryStatus="sent" />
  );

  fireEvent.press(getByRole('button', { name: 'Meine Meldungen ansehen' }));

  expect(navigate).toHaveBeenCalledWith(ScreenName.SueList, {
    query: QUERY_TYPES.SUE.MY_REQUESTS,
    title: 'Meine Meldungen'
  });
});
