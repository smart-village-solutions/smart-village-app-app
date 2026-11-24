import type { DocumentNode, FieldNode, SelectionSetNode } from 'graphql';

import { GET_CATEGORIES } from '../../src/queries/categories';
import { GET_POINTS_OF_INTEREST_AND_TOURS } from '../../src/queries/pointsOfInterestAndTours';

const operation = (document: DocumentNode) =>
  document.definitions.find((entry) => entry.kind === 'OperationDefinition');
const fields = (selection?: SelectionSetNode): FieldNode[] =>
  selection?.selections.filter((entry): entry is FieldNode => entry.kind === 'Field') || [];
const names = (selection?: SelectionSetNode) => fields(selection).map(({ name }) => name.value);

test('the independent home query requests version requirements and CMS visibility for both content types', () => {
  const root = fields(operation(GET_POINTS_OF_INTEREST_AND_TOURS)?.selectionSet);
  ['pointsOfInterest', 'tours'].forEach((name) => {
    expect(names(root.find((field) => field.name.value === name)?.selectionSet)).toEqual(
      expect.arrayContaining(['id', 'payload', 'visible'])
    );
  });
});

test('category availability uses complete public POI/tour lists with the same location constraint', () => {
  const root = fields(operation(GET_CATEGORIES)?.selectionSet);
  [
    ['categoryPointsOfInterest', 'pointsOfInterest'],
    ['categoryTours', 'tours']
  ].forEach(([alias, name]) => {
    const field = root.find((entry) => entry.alias?.value === alias);
    expect(field?.name.value).toBe(name);
    expect(field?.arguments).toEqual([
      expect.objectContaining({
        name: expect.objectContaining({ value: 'location' }),
        value: expect.objectContaining({
          kind: 'Variable',
          name: expect.objectContaining({ value: 'location' })
        })
      })
    ]);
    expect(names(field?.selectionSet)).toEqual(
      expect.arrayContaining(['id', 'payload', 'visible', 'categories', 'category'])
    );
  });
  const categoryField = root.find((entry) => entry.name.value === 'categories' && !entry.alias);
  expect(categoryField?.arguments?.map(({ name }) => name.value)).toEqual([
    'ids',
    'excludeIds',
    'tagList'
  ]);
  expect(names(categoryField?.selectionSet)).not.toContain('payload');
  expect(root.find((entry) => entry.alias?.value === 'categoryHierarchy')?.arguments).toHaveLength(
    0
  );
});
