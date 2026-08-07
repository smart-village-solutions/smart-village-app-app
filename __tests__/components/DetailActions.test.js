import React from 'react';
import renderer from 'react-test-renderer';

import { DetailActions } from '../../src/components/detail/DetailActions';

jest.mock('../../src/components/bookmarks', () => ({
  BookmarkHeader: 'mock-bookmark-action'
}));

jest.mock('../../src/components/ShareHeader', () => ({
  ShareHeader: 'mock-share-action'
}));

jest.mock('../../src/config', () => ({
  normalize: (value) => value
}));

const route = {
  key: 'detail-key',
  name: 'Detail',
  params: {
    query: 'newsItem',
    queryVariables: { id: '42' },
    shareContent: { message: 'Share me' }
  }
};

const renderDetailActions = () => {
  let tree;

  renderer.act(() => {
    tree = renderer.create(<DetailActions route={route} />);
  });

  return tree;
};

describe('DetailActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders bookmark and share actions without duplicating the header accessibility action', () => {
    const tree = renderDetailActions();

    expect(tree.root.findAllByType('mock-bookmark-action')).toHaveLength(1);
    expect(tree.root.findAllByType('mock-share-action')).toHaveLength(1);
    expect(tree.root.findAll((node) => node.props.accessibilityRole === 'switch')).toHaveLength(0);
  });
});
