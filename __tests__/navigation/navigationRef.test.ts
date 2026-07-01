const mockNavigationRef = {
  isReady: jest.fn(() => false)
};

describe('navigationRef queue', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockNavigationRef.isReady.mockReturnValue(false);

    jest.doMock('@react-navigation/native', () => ({
      createNavigationContainerRef: jest.fn(() => mockNavigationRef)
    }));
  });

  it('runs queued navigation actions once navigation is ready', () => {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const {
      flushPendingNavigationActions,
      runWhenNavigationReady
    } = require('../../src/navigation/navigationRef');
    /* eslint-enable @typescript-eslint/no-var-requires */
    const action = jest.fn();

    runWhenNavigationReady(action);
    expect(action).not.toHaveBeenCalled();

    mockNavigationRef.isReady.mockReturnValue(true);
    flushPendingNavigationActions();

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('continues flushing queued actions when one action throws', () => {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const {
      flushPendingNavigationActions,
      runWhenNavigationReady
    } = require('../../src/navigation/navigationRef');
    /* eslint-enable @typescript-eslint/no-var-requires */
    const failingAction = jest.fn(() => {
      throw new Error('boom');
    });
    const succeedingAction = jest.fn();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    runWhenNavigationReady(failingAction);
    runWhenNavigationReady(succeedingAction);

    mockNavigationRef.isReady.mockReturnValue(true);

    expect(() => flushPendingNavigationActions()).not.toThrow();
    expect(failingAction).toHaveBeenCalledTimes(1);
    expect(succeedingAction).toHaveBeenCalledTimes(1);

    flushPendingNavigationActions();
    expect(succeedingAction).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });
});
