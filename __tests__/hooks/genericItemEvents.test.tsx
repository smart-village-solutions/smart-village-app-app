import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { useGenericItemEvents } from '../../src/hooks/genericItemEvents';
import { GenericItemEventSource } from '../../src/types';

const mockUseQueries = jest.fn();
const mockRequest = jest.fn();
const mockParse = jest.fn();

jest.mock('react-query', () => ({ useQueries: (options: unknown) => mockUseQueries(options) }));
jest.mock('../../src/ReactQueryClient', () => ({
  ReactQueryClient: jest.fn(async () => ({ request: mockRequest }))
}));
jest.mock('../../src/helpers/genericItemEventHelper', () => ({
  parseGenericItemEvents: (...args: unknown[]) => mockParse(...args)
}));
jest.mock('../../src/queries', () => ({
  getQuery: jest.fn(() => 'query')
}));
jest.mock('../../src/queries/types', () => ({
  QUERY_TYPES: { GENERIC_ITEMS: 'genericItems' }
}));

const defaultSources = [
  { genericType: 'Project', filterTypes: ['Event'] },
  { genericType: 'Project', filterStatuses: ['active'] }
];
const Probe = ({
  enabled = true,
  onResult,
  sources = defaultSources
}: {
  enabled?: boolean;
  onResult?: (result: ReturnType<typeof useGenericItemEvents>) => void;
  sources?: GenericItemEventSource[];
}) => {
  const result = useGenericItemEvents({
    enabled,
    sources
  });
  React.useEffect(() => onResult?.(result), [onResult, result]);
  return (
    <Text testID="value">{`${result.data.length}:${result.isLoading}:${result.isRefetching}`}</Text>
  );
};

describe('useGenericItemEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParse.mockReturnValue([]);
    mockUseQueries.mockReturnValue([]);
  });

  it('groups duplicate generic types under one stable raw query', () => {
    render(<Probe />);
    expect(mockUseQueries).toHaveBeenCalledWith([
      expect.objectContaining({
        enabled: true,
        queryKey: ['genericItems', { genericType: 'Project' }]
      })
    ]);
  });

  it('requests the raw Generic Item dataset with the configured generic type', async () => {
    render(<Probe />);
    const query = mockUseQueries.mock.calls[0][0][0];
    mockRequest.mockResolvedValue({ genericItems: [] });
    await expect(query.queryFn()).resolves.toEqual({ genericItems: [] });
    expect(mockRequest).toHaveBeenCalledWith('query', {
      genericType: 'Project',
      limit: undefined
    });
  });

  it('normalizes generic type whitespace before querying and parsing', async () => {
    mockUseQueries.mockReturnValue([{ data: { genericItems: [{}] } }]);
    render(<Probe sources={[{ genericType: ' Project ' }]} />);

    const query = mockUseQueries.mock.calls[0][0][0];
    mockRequest.mockResolvedValue({ genericItems: [] });
    await query.queryFn();

    expect(query.queryKey).toEqual(['genericItems', { genericType: 'Project' }]);
    expect(mockRequest).toHaveBeenCalledWith('query', {
      genericType: 'Project',
      limit: undefined
    });
    expect(mockParse).toHaveBeenCalledWith(
      [{}],
      expect.objectContaining({ genericType: 'Project' }),
      undefined
    );
  });

  it('disables raw queries when the integration is disabled', () => {
    render(<Probe enabled={false} />);
    expect(mockUseQueries.mock.calls[0][0][0].enabled).toBe(false);
    expect(mockParse).not.toHaveBeenCalled();
  });

  it('merges and deduplicates transformed occurrences and combines loading state', () => {
    mockUseQueries.mockReturnValue([
      { data: { genericItems: [{}] }, isLoading: true, isRefetching: true }
    ]);
    mockParse.mockReturnValue([{ id: 'one', listDate: '2030-01-01' }]);
    const view = render(<Probe />);
    expect(view.getByTestId('value').props.children).toBe('1:true:true');
    expect(mockParse).toHaveBeenCalledTimes(2);
  });

  it('awaits every enabled raw query refetch', async () => {
    const first = jest.fn(async () => 'first');
    const second = jest.fn(async () => 'second');
    mockUseQueries.mockReturnValue([
      { data: {}, refetch: first },
      { data: {}, refetch: second }
    ]);
    let latestResult: ReturnType<typeof useGenericItemEvents> | undefined;
    render(
      <Probe
        onResult={(result) => {
          latestResult = result;
        }}
        sources={[{ genericType: 'Project' }, { genericType: 'Meeting' }]}
      />
    );
    if (!latestResult) throw new Error('Hook result was not reported');
    await expect(latestResult.refetch()).resolves.toEqual(['first', 'second']);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });
});
