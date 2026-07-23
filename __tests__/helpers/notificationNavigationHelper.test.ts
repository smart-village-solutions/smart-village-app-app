import { ScreenName } from '../../src/types';

const mockNavigationRef = {
  isReady: jest.fn(() => false),
  navigate: jest.fn()
};

describe('notificationNavigationHelper', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockNavigationRef.isReady.mockReturnValue(false);

    jest.doMock('@react-navigation/native', () => ({
      createNavigationContainerRef: jest.fn(() => mockNavigationRef)
    }));
    jest.doMock('../../src/config', () => ({
      consts: {
        ROOT_ROUTE_NAMES: {
          CONVERSATIONS: 'Conversations',
          EVENT_RECORDS: 'EventRecords',
          NEWS_ITEMS: 'NewsItems',
          POINTS_OF_INTEREST_AND_TOURS: 'PointsOfInterestAndTours'
        }
      },
      texts: {
        detailTitles: {},
        screenTitles: {
          wasteCollection: 'Abfallkalender'
        }
      }
    }));
  });

  it('queues waste notification navigation until the navigation container is ready', () => {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const { flushPendingNavigationActions } = require('../../src/navigation/navigationRef');
    const {
      navigateToWasteNotificationTarget
    } = require('../../src/helpers/notificationNavigationHelper');
    /* eslint-enable @typescript-eslint/no-var-requires */

    navigateToWasteNotificationTarget({
      navigationTarget: {
        name: ScreenName.WasteCollection,
        params: { title: 'Abfallkalender' }
      },
      navigationType: 'tab'
    });

    expect(mockNavigationRef.navigate).not.toHaveBeenCalled();

    mockNavigationRef.isReady.mockReturnValue(true);
    flushPendingNavigationActions();

    expect(mockNavigationRef.navigate).toHaveBeenCalledWith('Stack0', {
      params: { title: 'Abfallkalender' },
      screen: ScreenName.WasteCollection
    });
  });

  it('routes regular push notification targets through the root tab stack', () => {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const {
      navigateToNotificationTarget
    } = require('../../src/helpers/notificationNavigationHelper');
    /* eslint-enable @typescript-eslint/no-var-requires */

    mockNavigationRef.isReady.mockReturnValue(true);

    navigateToNotificationTarget({
      navigationTarget: {
        name: ScreenName.Detail,
        params: { query: 'newsItem', queryVariables: { id: 'news-1' } }
      },
      navigationType: 'tab'
    });

    expect(mockNavigationRef.navigate).toHaveBeenCalledWith('Stack0', {
      params: { query: 'newsItem', queryVariables: { id: 'news-1' } },
      screen: ScreenName.Detail
    });
  });
});
