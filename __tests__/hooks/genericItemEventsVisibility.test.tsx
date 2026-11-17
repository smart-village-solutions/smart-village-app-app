import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { useGenericItemEvents } from '../../src/hooks/genericItemEvents';

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '5.0.0',
  nativeBuildVersion: '1573'
}));
const mockUseQueries = jest.fn();
jest.mock('react-query', () => ({ useQueries: (options: unknown) => mockUseQueries(options) }));
jest.mock('../../src/ReactQueryClient', () => ({ ReactQueryClient: jest.fn() }));
jest.mock('../../src/queries', () => ({
  getQuery: () => 'query',
  QUERY_TYPES: { GENERIC_ITEM: 'genericItem' }
}));
jest.mock('../../src/config', () => ({ consts: {}, texts: {} }));
jest.mock('../../src/helpers/genericTypeHelper', () => ({
  getGenericItemDetailTitle: () => 'Event',
  getGenericItemRootRouteName: () => 'Events'
}));
jest.mock('../../src/helpers/imageHelper', () => ({ mainImageOfMediaContents: () => undefined }));
jest.mock('../../src/helpers/textHelper', () => ({ subtitle: () => '' }));

const source = [{ genericType: 'ParticipationProject' }];
const event = (id: string, payload: Record<string, unknown> = {}) => ({
  id,
  title: id,
  genericType: 'ParticipationProject',
  payload,
  dates: [{ dateStart: '2030-05-03' }]
});
const Probe = () => {
  const { data } = useGenericItemEvents({ sources: source, dateRange: ['2030-05-03'] });
  // Widget counts and calendar rows/dots share this exact occurrence dataset.
  return (
    <Text testID="events">
      {JSON.stringify(data.map(({ title, listDate }) => ({ title, listDate })))}
    </Text>
  );
};

beforeEach(() => jest.clearAllMocks());

it.each([{ minVersion: '6.0.0' }, { minBuild: 1574 }])(
  'excludes restricted cached records before titles and dates become occurrences: %p',
  (requirements) => {
    const cached = { genericItems: [event('Restricted title', requirements), event('Normal')] };
    const original = JSON.stringify(cached);
    mockUseQueries.mockReturnValue([{ data: cached }]);
    const screen = render(<Probe />);
    expect(JSON.parse(screen.getByTestId('events').props.children)).toEqual([
      { title: 'Normal', listDate: '2030-05-03' }
    ]);
    expect(JSON.stringify(cached)).toBe(original);
  }
);

it('keeps unrestricted and boundary-eligible occurrences without changing raw query keys', () => {
  mockUseQueries.mockReturnValue([
    {
      data: {
        genericItems: [event('Normal'), event('Eligible', { minVersion: '5.0.0', minBuild: 1573 })]
      }
    }
  ]);
  const screen = render(<Probe />);
  expect(JSON.parse(screen.getByTestId('events').props.children)).toHaveLength(2);
  expect(mockUseQueries.mock.calls[0][0][0].queryKey).toEqual([
    'genericItems',
    { genericType: 'ParticipationProject' }
  ]);
});

it('returns no occurrences when every cached record is restricted', () => {
  mockUseQueries.mockReturnValue([
    { data: { genericItems: [event('Hidden', { minVersion: '6.0.0' })] } }
  ]);
  const screen = render(<Probe />);
  expect(JSON.parse(screen.getByTestId('events').props.children)).toEqual([]);
});
