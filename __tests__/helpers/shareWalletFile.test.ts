const mockShare = jest.fn();
const mockIsAvailable = jest.fn();
let mockMissingModule = false;
let mockModuleLoads = 0;

jest.mock('expo-sharing', () => {
  mockModuleLoads += 1;
  if (mockMissingModule) throw new Error('Cannot find native module ExpoSharing');
  return { shareAsync: mockShare, isAvailableAsync: mockIsAvailable };
});

describe('optional wallet sharing', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockModuleLoads = 0;
    mockMissingModule = false;
  });

  it('does not load the native module while importing the screen helper', async () => {
    mockMissingModule = true;
    const { shareWalletFile } = jest.requireActual('../../src/helpers/wallet/shareWalletFile');
    expect(mockModuleLoads).toBe(0);
    await expect(shareWalletFile('file:///card.png')).rejects.toThrow('ExpoSharing');
  });

  it('shares a file when the native feature is available', async () => {
    mockIsAvailable.mockResolvedValue(true);
    const { shareWalletFile } = jest.requireActual('../../src/helpers/wallet/shareWalletFile');
    await shareWalletFile('file:///card.png');
    expect(mockShare).toHaveBeenCalledWith('file:///card.png');
  });

  it('returns a catchable error when sharing is unavailable', async () => {
    mockIsAvailable.mockResolvedValue(false);
    const { shareWalletFile } = jest.requireActual('../../src/helpers/wallet/shareWalletFile');
    await expect(shareWalletFile('file:///card.png')).rejects.toThrow('unavailable');
    expect(mockShare).not.toHaveBeenCalled();
  });
});
