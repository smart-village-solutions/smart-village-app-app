import { Alert } from 'react-native';

import { openKlimaTaler } from '../../src/klimaTaler/entry';

const mockOpen = jest.fn().mockResolvedValue(undefined);
let mockState = { phase: 'error', errorCode: 'E_NETWORK' };
jest.mock('../../src/klimaTaler/configuration', () => ({
  klimaTalerConfiguration: { isEnabled: () => true, ready: () => Promise.resolve() }
}));
jest.mock('../../modules/expo-changers', () => ({}));
jest.mock('../../src/klimaTaler/createEntry', () => ({
  createEntry: () => ({
    open: (...args: unknown[]) => mockOpen(...args),
    getSnapshot: () => mockState
  })
}));

test('the retry action retains the exact offer and repeated taps share one request', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  try {
    await Promise.all([openKlimaTaler(10), openKlimaTaler(10)]);
    expect(mockOpen.mock.calls).toEqual([[10]]);
    const buttons = alert.mock.calls[0][2];
    mockState = { phase: 'open', errorCode: '' };
    buttons?.find((button) => button.text === 'Erneut versuchen')?.onPress?.();
    await Promise.resolve();
    expect(mockOpen.mock.calls).toEqual([[10], [10]]);
  } finally {
    alert.mockRestore();
  }
});
