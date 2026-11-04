import React from 'react';
import { act, render } from '@testing-library/react-native';

import { ConfigurationsContext } from '../../src/ConfigurationsProvider';
import { ImageButton } from '../../src/components/ImageButton';
import { myRequests } from '../../src/queries/SUE';

jest.mock('expo-router/react-navigation', () => ({
  useNavigation: () => ({ navigate: jest.fn() })
}));
jest.mock('../../src/ConfigurationsProvider', () => ({
  ConfigurationsContext: jest.requireActual<typeof React>('react').createContext({ sueConfig: {} })
}));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ mode: 'light' }) }));
jest.mock('../../src/config', () => ({ Icon: {}, normalize: (value: number) => value }));
jest.mock('../../src/helpers', () => ({
  navigateToRoute: jest.fn(),
  resolveThemeOverrides: (button: object) => button,
  shouldShowInternalSuePendingStatus: (value?: boolean) => value !== false
}));
jest.mock('../../src/queries', () => ({
  QUERY_TYPES: { SUE: { MY_REQUESTS: 'myRequests' } }
}));
jest.mock('../../src/queries/SUE', () => ({ myRequests: jest.fn() }));
jest.mock('../../src/components/Button', () => {
  const ReactLocal = jest.requireActual<typeof React>('react');
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { Button: ({ title }: { title?: string }) => ReactLocal.createElement(Text, null, title) };
});
jest.mock('../../src/components/Wrapper', () => ({
  Wrapper: jest.requireActual<typeof import('react-native')>('react-native').View
}));

const savedReportsButton = (showInternalPendingStatus: boolean) => (
  <ConfigurationsContext.Provider value={{ sueConfig: { showInternalPendingStatus } } as never}>
    <ImageButton
      button={{
        title: 'Meine Meldungen',
        routeName: 'SueList',
        params: { query: 'myRequests' }
      }}
    />
  </ConfigurationsContext.Provider>
);

it('keeps an existing saved-reports button visible when rechecking storage fails', async () => {
  (myRequests as jest.Mock).mockResolvedValueOnce([{ serviceRequestId: 123 }]);
  const screen = render(savedReportsButton(true));
  await screen.findByText('Meine Meldungen');

  (myRequests as jest.Mock).mockRejectedValueOnce(new Error('Temporary storage failure'));
  await act(async () => {
    screen.rerender(savedReportsButton(false));
  });

  expect(myRequests).toHaveBeenCalledTimes(2);
  expect(screen.getByText('Meine Meldungen')).toBeTruthy();
});
