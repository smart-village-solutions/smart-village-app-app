import React from 'react';
import renderer from 'react-test-renderer';

import { HeaderRight } from '../../src/components/HeaderRight';

jest.mock('../../src/config', () => ({
  normalize: (value: number) => value
}));

const createMockHeader = (testID: string) => () => {
  const ReactLocal = require('react');

  return ReactLocal.createElement('mock-header', { testID });
};

jest.mock('../../src/components/Wrapper', () => {
  const ReactLocal = require('react');

  return {
    WrapperRow: ({ children }: { children: React.ReactNode }) => (
      ReactLocal.createElement('mock-wrapper', null, children)
    )
  };
});

jest.mock('../../src/components/bookmarks', () => ({
  BookmarkHeader: createMockHeader('bookmark-header')
}));

jest.mock('../../src/components/CalendarHeader', () => ({
  CalendarHeader: createMockHeader('calendar-header')
}));

jest.mock('../../src/components/ChatHeader', () => ({
  ChatHeader: createMockHeader('chat-header')
}));

jest.mock('../../src/components/DeleteHeader', () => ({
  DeleteHeader: createMockHeader('delete-header')
}));

jest.mock('../../src/components/DrawerHeader', () => ({
  DrawerHeader: createMockHeader('drawer-header')
}));

jest.mock('../../src/components/EditHeader', () => ({
  EditHeader: createMockHeader('edit-header')
}));

jest.mock('../../src/components/GroupHeader', () => ({
  GroupHeader: createMockHeader('group-header')
}));

jest.mock('../../src/components/InfoHeader', () => ({
  InfoHeader: createMockHeader('info-header')
}));

jest.mock('../../src/components/SearchHeader', () => ({
  SearchHeader: createMockHeader('search-header')
}));

jest.mock('../../src/components/ShareHeader', () => ({
  ShareHeader: createMockHeader('share-header')
}));

describe('HeaderRight', () => {
  const navigation = { openDrawer: jest.fn() } as any;
  const route = { key: 'detail', name: 'Detail', params: {} } as any;

  it('renders the drawer icon as the rightmost header action when share is enabled', () => {
    let testRenderer: renderer.ReactTestRenderer;
    renderer.act(() => {
      testRenderer = renderer.create(
        <HeaderRight
          navigation={navigation}
          route={route}
          withDrawer
          withShare
          shareContent={{ message: 'x' }}
        />
      );
    });

    const renderedChildren = testRenderer!.root.findAll(
      (node) => typeof node.props.testID === 'string'
    );

    expect(renderedChildren.map((node) => node.props.testID)).toEqual(['share-header', 'drawer-header']);
  });
});
