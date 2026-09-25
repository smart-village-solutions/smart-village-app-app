const mockNavigationRef = {
  isReady: jest.fn(() => false)
};

describe('navigationRef queue', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockNavigationRef.isReady.mockReturnValue(false);

    jest.doMock('expo-router/react-navigation', () => ({
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

  it('replaces an older pending action with the same key', () => {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const {
      flushPendingNavigationActions,
      runWhenNavigationReady
    } = require('../../src/navigation/navigationRef');
    /* eslint-enable @typescript-eslint/no-var-requires */
    const olderAction = jest.fn();
    const newerAction = jest.fn();

    runWhenNavigationReady(olderAction, undefined, 'notification');
    runWhenNavigationReady(newerAction, undefined, 'notification');

    mockNavigationRef.isReady.mockReturnValue(true);
    flushPendingNavigationActions();

    expect(olderAction).not.toHaveBeenCalled();
    expect(newerAction).toHaveBeenCalledTimes(1);
  });

  it('removes an older keyed action when its replacement can run immediately', () => {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const {
      flushPendingNavigationActions,
      runWhenNavigationReady
    } = require('../../src/navigation/navigationRef');
    /* eslint-enable @typescript-eslint/no-var-requires */
    const olderAction = jest.fn();
    const newerAction = jest.fn();
    const olderTargetReady = jest.fn(() => false);

    runWhenNavigationReady(olderAction, olderTargetReady, 'notification');

    mockNavigationRef.isReady.mockReturnValue(true);
    runWhenNavigationReady(newerAction, () => true, 'notification');
    olderTargetReady.mockReturnValue(true);
    flushPendingNavigationActions();

    expect(olderAction).not.toHaveBeenCalled();
    expect(newerAction).toHaveBeenCalledTimes(1);
  });
});
