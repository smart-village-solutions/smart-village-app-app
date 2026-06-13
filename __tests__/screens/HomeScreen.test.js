import { getNotificationNavigationTarget } from '../../src/helpers/notificationNavigationHelper';
import { homeSectionKeyExtractor } from '../../src/helpers/homeSectionKeyExtractor';
import { ScreenName } from '../../src/types';

describe('HomeScreen', () => {
  const navigation = { navigate: jest.fn() };

  it.skip('renders correctly', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const React = require('react');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const renderer = require('react-test-renderer');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { HomeScreen } = require('../../src/screens');

    // skipping because of `Invariant Violation: Could not find "client" in the context or passed in as an option. Wrap the root component in an <ApolloProvider>, or pass an ApolloClient instance in via options.`
    const tree = renderer.create(<HomeScreen navigation={navigation} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it.skip('must contain a right header element (drawer menu)', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { HomeScreen } = require('../../src/screens');

    // skipping because of `TypeError: _screens.HomeScreen.navigationOptions is not a function`
    const navigationOptions = HomeScreen.navigationOptions({ navigation });
    const rightHeaderElement = navigationOptions.headerRight;

    expect(rightHeaderElement).toBeTruthy();
  });

  it('builds a waste collection navigation target without requiring an id', () => {
    expect(getNotificationNavigationTarget({ query_type: 'WasteAddresses' })).toEqual({
      name: ScreenName.WasteCollection,
      params: {
        title: 'Abfallkalender'
      }
    });
  });

  it('keeps regular detail push notifications id based', () => {
    expect(
      getNotificationNavigationTarget({
        id: 'news-1',
        query_type: 'NewsItem',
        title: 'Push title'
      })
    ).toEqual({
      name: ScreenName.Detail,
      params: {
        details: null,
        query: 'newsItem',
        queryVariables: { id: 'news-1' },
        rootRouteName: 'NewsItems',
        shareContent: null,
        title: 'Push title'
      }
    });
  });

  it('does not build regular detail push navigation without an id', () => {
    expect(getNotificationNavigationTarget({ query_type: 'NewsItem' })).toBeUndefined();
  });

  it('builds stable keys for configured home sections', () => {
    expect(homeSectionKeyExtractor({ type: 'carousel' }, 0)).toBe('home-section-type-carousel');
    expect(homeSectionKeyExtractor({ query: 'newsItems', title: 'News' }, 1)).toBe(
      'home-section-query-newsItems-title-News'
    );
    expect(
      homeSectionKeyExtractor({ categoriesNews: [{ categoryId: 1 }, { categoryId: 2 }] }, 2)
    ).toBe('home-section-categories-1-2');
  });
});
