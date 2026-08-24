import React from 'react';
import renderer from 'react-test-renderer';

import { DetailActions } from '../../src/components/detail/DetailActions';

jest.mock('../../src/components/bookmarks', () => ({
  BookmarkHeader: 'mock-bookmark-action'
}));

jest.mock('../../src/components/ShareHeader', () => ({
  ShareHeader: 'mock-share-action'
}));

jest.mock('react-native-elements', () => ({
  Divider: 'mock-divider'
}));

jest.mock('../../src/helpers/shareHelper', () => ({
  shareMessage: (data) => `Teilen: ${data.title}`
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

const renderDetailActions = (props = {}) => {
  let tree;

  renderer.act(() => {
    tree = renderer.create(<DetailActions route={route} {...props} />);
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
    expect(tree.root.findAllByType('mock-divider')).toHaveLength(1);
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
    expect(tree.root.findByType('mock-divider').props.style).toMatchObject({
      backgroundColor: expect.any(String),
      width: '100%'
    });
  });

  it('does not render a divider when only one action is available', () => {
    const tree = renderDetailActions({
      route: {
        ...route,
        params: {
          ...route.params,
          shareContent: undefined
        }
      }
    });

    expect(tree.root.findAllByType('mock-bookmark-action')).toHaveLength(1);
    expect(tree.root.findAllByType('mock-divider')).toHaveLength(0);
    expect(tree.root.findAllByType('mock-share-action')).toHaveLength(0);
  });

  it('derives missing share content and the bookmark category from loaded detail data', () => {
    const routeWithoutActionMetadata = {
      ...route,
      params: {
        ...route.params,
        shareContent: undefined
      }
    };
    const tree = renderDetailActions({
      data: { id: '42', title: 'Beteiligung zum Stadtpark' },
      route: routeWithoutActionMetadata,
      suffix: 'ParticipationProject'
    });

    expect(tree.root.findByType('mock-bookmark-action').props.suffix).toBe('ParticipationProject');
    expect(tree.root.findByType('mock-share-action').props.shareContent.message).toContain(
      'Beteiligung zum Stadtpark'
    );
  });
});
