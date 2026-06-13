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
});
