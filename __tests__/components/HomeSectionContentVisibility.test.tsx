import { HomeSection } from '../../src/components/HomeSection';

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '4.3.0',
  nativeBuildVersion: '1565'
}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: () => ({ globalSettings: { settings: {} } })
}));
jest.mock('../../src/SettingsProvider', () => ({ SettingsContext: {} }));
jest.mock('../../src/helpers/cacheHelper', () => ({
  CACHE_SCOPES: { HOME: 'home' },
  millisecondsUntilCacheExpires: () => 3600000
}));
jest.mock('../../src/helpers/dateTimeHelper', () => ({ eventDate: jest.fn() }));
let mockData: Record<string, unknown[]>;
jest.mock('react-query', () => ({
  useQuery: () => ({ data: mockData, dataUpdatedAt: 1, isLoading: false, refetch: jest.fn() })
}));
jest.mock('../../src/hooks', () => ({
  useHomePointsOfInterestAndToursRefresh: jest.fn(),
  useHomeRefresh: jest.fn(),
  useVolunteerData: () => ({}),
  useGenericItemEvents: () => ({ data: [], isLoading: false, refetch: jest.fn() })
}));
jest.mock('../../src/queries', () => ({
  getQuery: jest.fn(),
  QUERY_TYPES: {
    POINTS_OF_INTEREST_AND_TOURS: 'pointsOfInterestAndTours',
    POINTS_OF_INTEREST: 'pointsOfInterest',
    TOURS: 'tours',
    EVENT_RECORDS: 'eventRecords',
    VOLUNTEER: {}
  }
}));
jest.mock('../../src/ReactQueryClient', () => ({ ReactQueryClient: jest.fn() }));
jest.mock('../../src/components/DataListSection', () => ({ DataListSection: 'DataListSection' }));
const props = {
  query: 'pointsOfInterestAndTours',
  queryVariables: {},
  buttonTitle: 'Alle Angebote anzeigen',
  title: 'Marktplatz'
};
const restricted = { id: 'future', payload: { minVersion: '5.0.0', minBuild: 1573 } };

test('the home section passes only eligible data to the carousel and preserves the source result', () => {
  const normal = { id: 'normal' };
  mockData = { pointsOfInterest: [restricted, normal], tours: [] };
  const element = HomeSection(props as never);
  expect(element.props.sectionData.pointsOfInterest).toEqual([normal]);
  expect(element.props.showButton).toBe(true);
  expect(mockData.pointsOfInterest).toHaveLength(2);
});

test('a section with only restricted or invisible content has no active navigation button', () => {
  mockData = {
    pointsOfInterest: [restricted, { id: 'hidden', visible: false }],
    tours: [restricted]
  };
  const element = HomeSection(props as never);
  expect(element.props.showButton).toBe(false);
});

test('ordinary home sections without payload requirements retain their data and navigation', () => {
  mockData = { newsItems: [{ id: 'normal', title: 'Local news' }] };
  const element = HomeSection({ ...props, query: 'newsItems' } as never);
  expect(element.props.sectionData).toBe(mockData);
  expect(element.props.showButton).toBe(true);
});
