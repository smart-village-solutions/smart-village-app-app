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
  normalize: (value) => value,
  texts: {
    detailActions: {
      remember: '{{title}} merken',
      rememberFallback: 'Merken',
      share: '{{title}} teilen',
      shareFallback: 'Teilen'
    }
  }
}));

const route = {
  key: 'detail-key',
  name: 'Detail',
  params: {
    query: 'newsItem',
    queryVariables: { id: '42' },
    shareContent: { message: 'Share me' },
    title: 'Nachricht'
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
    expect(tree.root.findByType('mock-bookmark-action').props.label).toBe('Nachricht merken');
    expect(tree.root.findByType('mock-share-action').props.label).toBe('Nachricht teilen');
    expect(tree.root.findByType('mock-bookmark-action').props.buttonStyle).toMatchObject({
      flexDirection: 'row',
      width: '100%'
    });
    expect(tree.root.findByProps({ accessibilityRole: 'toolbar' }).props.style).not.toHaveProperty(
      'flexDirection',
      'row'
    );
  });
});
