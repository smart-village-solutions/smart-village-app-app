import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('../../src/helpers', () => ({
  getAccessibilityHeaderEntryEnabled: jest.fn(() => true),
  openShare: jest.fn()
}));

jest.mock('../../src/components/AccessibilitySettingsModal', () => ({
  AccessibilitySettingsModal: () => null
}));

jest.mock('../../src/components/CalendarHeader', () => ({
  CalendarHeader: () => null
}));

jest.mock('../../src/components/ChatHeader', () => ({
  ChatHeader: () => null
}));

jest.mock('../../src/components/DeleteHeader', () => ({
  DeleteHeader: () => null
}));

jest.mock('../../src/components/EditHeader', () => ({
  EditHeader: () => null
}));

jest.mock('../../src/components/GroupHeader', () => ({
  GroupHeader: () => null
}));

jest.mock('../../src/components/InfoHeader', () => ({
  InfoHeader: () => null
}));

jest.mock('../../src/components/SearchHeader', () => ({
  SearchHeader: () => {
    const ReactLocal = require('react');

    return ReactLocal.createElement('mock-search-header');
  }
}));

jest.mock('../../src/components/Wrapper', () => ({
  WrapperRow: ({ children, style }) => {
    const ReactLocal = require('react');

    return ReactLocal.createElement('mock-wrapper-row', { style }, children);
  }
}));

jest.mock('../../src/components/bookmarks', () => ({
  BookmarkHeader: () => null
}));

jest.mock('../../src/config', () => {
  const ReactLocal = require('react');

  return {
    colors: {
      darkText: '#222222'
    },
    consts: {
      a11yLabel: {
        accessibilityIcon: 'Barrierefreiheit',
        accessibilityIconHint: 'Öffnet die Barrierefreiheitseinstellungen',
        openMenuHint: 'Öffnet das Menü',
        openMenuIcon: 'Menü',
        shareHint: 'Öffnet Teilen',
        shareIcon: 'Teilen'
      }
    },
    Icon: {
      DrawerMenu: (props: unknown) => ReactLocal.createElement('mock-drawer-icon', props),
      NamedIcon: (props: unknown) => ReactLocal.createElement('mock-named-icon', props),
      Share: (props: unknown) => ReactLocal.createElement('mock-share-icon', props)
    },
    normalize: (value: number) => value
  };
});

import { SettingsContext } from '../../src/SettingsProvider';
import { AccessibilityHeader } from '../../src/components/AccessibilityHeader';
import { DrawerHeader } from '../../src/components/DrawerHeader';
import { HeaderRight } from '../../src/components/HeaderRight';
import { ShareHeader } from '../../src/components/ShareHeader';

const renderWithSettings = (element: React.ReactElement) => {
  let tree: renderer.ReactTestRenderer;

  renderer.act(() => {
    tree = renderer.create(
      <SettingsContext.Provider value={{ globalSettings: { settings: {} } } as never}>
        {element}
      </SettingsContext.Provider>
    );
  });

  return tree!;
};

describe('HeaderRight', () => {
  it('renders accessibility immediately before the drawer icon', () => {
    const tree = renderWithSettings(
      <HeaderRight
        navigation={{ openDrawer: jest.fn() } as never}
        route={{ key: 'route-key', name: 'route-name', params: { shareContent: { message: 'x' } } } as never}
        withAccessibility
        withDrawer
        withSearch
        withShare
      />
    );

    const renderedOrder = tree.root.children[0].findAll((node) =>
      typeof node.type === 'string' &&
      node.type.startsWith('mock-') &&
      node.type !== 'mock-wrapper-row'
    );

    expect(renderedOrder.map((node) => node.type)).toEqual([
      'mock-search-header',
      'mock-share-icon',
      'mock-named-icon',
      'mock-drawer-icon'
    ]);
  });

  it('uses a thicker stroke for the accessibility icon', () => {
    const tree = renderWithSettings(<AccessibilityHeader style={undefined} />);

    expect(tree.root.findByType('mock-named-icon').props.strokeWidth).toBe(1.75);
  });

  it('uses a thicker stroke for the share icon', () => {
    const tree = renderWithSettings(
      <ShareHeader shareContent={{ message: 'Jetzt teilen' }} style={undefined} />
    );

    expect(tree.root.findByType('mock-share-icon').props.strokeWidth).toBe(1.75);
  });

  it('uses a thicker stroke for the drawer icon', () => {
    const tree = renderWithSettings(
      <DrawerHeader navigation={{ openDrawer: jest.fn() } as never} style={undefined} />
    );

    expect(tree.root.findByType('mock-drawer-icon').props.strokeWidth).toBe(1.75);
  });
});
