import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';

jest.mock('../../src/ConfigurationsProvider', () => ({
  ConfigurationsContext: jest.requireActual('react').createContext({
    sueConfig: { sueReportScreen: { showFeedbackSection: true, defaultRating: 4 } }
  })
}));
jest.mock('../../src/config', () => ({
  device: { platform: 'ios' },
  normalize: (value: number) => value,
  texts: {
    feedbackScreen: {
      alert: { title: 'Sent', message: 'Thanks', errorTitle: 'Failed', errorMessage: 'Try again' },
      sendButton: { disabled: 'Sending' }
    },
    sue: { report: { sendReportDone: { toEntryList: 'Reports', sendButton: 'Send feedback' } } }
  }
}));
jest.mock('../../src/hooks', () => ({
  useAppInfo: () => ({ appVersion: '5.1.0' }),
  useKeyboardHeight: () => 0
}));
jest.mock('../../src/queries/SUE', () => ({ sendUserFeedback: jest.fn() }));
jest.mock('react-native-elements', () => ({ Divider: () => null, Rating: () => null }));
jest.mock('../../src/components/Button', () => ({
  Button: ({ title, ...props }: { title: string }) => {
    const { Pressable, Text } = jest.requireActual('react-native');
    return (
      <Pressable {...props} accessibilityRole="button" accessibilityLabel={title}>
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
jest.mock('../../src/components/form', () => ({
  Input: ({ control, name }: { control: never; name: string }) => {
    const { Controller } = jest.requireActual('react-hook-form');
    const { TextInput } = jest.requireActual('react-native');
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
          <TextInput testID="feedback-message" value={field.value} onChangeText={field.onChange} />
        )}
      />
    );
  }
}));

import { SueReportSend } from '../../src/components/SUE/report/SueReportSend';
import { sendUserFeedback } from '../../src/queries/SUE';

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

it('retains feedback after failure and clears it only after acknowledging a successful retry', async () => {
  (sendUserFeedback as jest.Mock)
    .mockRejectedValueOnce(new Error('Network unavailable'))
    .mockResolvedValue(undefined);
  const tree = render(
    <SueReportSend isDone isLoading={false} navigation={{ navigate: jest.fn() }} />
  );
  fireEvent.changeText(tree.getByTestId('feedback-message'), 'Keep my feedback');
  fireEvent.press(tree.getByLabelText('Send feedback'));
  await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Failed', 'Try again'));
  expect(tree.getByTestId('feedback-message').props.value).toBe('Keep my feedback');

  fireEvent.press(tree.getByLabelText('Send feedback'));
  await waitFor(() =>
    expect(Alert.alert).toHaveBeenCalledWith('Sent', 'Thanks', expect.any(Array))
  );
  expect(sendUserFeedback).toHaveBeenNthCalledWith(2, {
    message: 'Keep my feedback',
    rating: 4,
    appVersion: '5.1.0'
  });
  expect(tree.getByTestId('feedback-message')).toBeTruthy();
  const success = (Alert.alert as jest.Mock).mock.calls.find((call) => call[0] === 'Sent');
  act(() => success[2][0].onPress());
  expect(tree.queryByTestId('feedback-message')).toBeNull();
});

it('sends only one request when two submissions race before the loading render', async () => {
  let finish!: () => void;
  (sendUserFeedback as jest.Mock).mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  const tree = render(
    <SueReportSend isDone isLoading={false} navigation={{ navigate: jest.fn() }} />
  );
  const button = tree.getByLabelText('Send feedback');
  act(() => {
    fireEvent.press(button);
    fireEvent.press(button);
  });
  await waitFor(() => expect(sendUserFeedback).toHaveBeenCalledTimes(1));
  await act(async () => finish());
});
