import React from 'react';

import { CategoryList } from '../../src/components/CategoryList';

jest.mock('../../src/config', () => ({
  colors: {},
  normalize: (value: number) => value,
  texts: { categoryTitles: { pointsOfInterest: 'POIs', tours: 'Tours' } }
}));
jest.mock('../../src/components/CategoryListItem', () => ({
  CategoryListItem: 'CategoryListItem'
}));
jest.mock('../../src/components/LoadingContainer', () => ({
  LoadingContainer: 'LoadingContainer'
}));
jest.mock('../../src/components/SectionHeader', () => ({ SectionHeader: 'SectionHeader' }));

test('an empty filtered category index renders its supplied empty state instead of a permanent spinner', () => {
  const empty = React.createElement(() => null);
  const component = new CategoryList({ data: [], navigation: {}, ListEmptyComponent: empty });
  component.context = { colors: {} };
  expect(component.render()).toBe(empty);
});

test('the existing supplied loading state is retained while the category request is pending', () => {
  const loading = React.createElement(() => null);
  const component = new CategoryList({
    data: undefined,
    navigation: {},
    ListEmptyComponent: loading
  });
  component.context = { colors: {} };
  expect(component.render()).toBe(loading);
});

test('ordinary category counts and nested category selection are preserved', () => {
  const root = { id: '1', title: 'Shopping', pointsOfInterestTreeCount: 2 };
  const child = { id: '2', title: 'Child', pointsOfInterestTreeCount: 1, parent: { id: '1' } };
  const component = new CategoryList({
    data: [root, child],
    navigation: {},
    queryVariables: { ids: ['1'] }
  });
  component.context = { colors: {} };
  expect(component.render().props.sections[0].data).toEqual([child, root]);
});
