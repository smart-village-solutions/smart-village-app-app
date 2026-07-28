import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: () => ({ navigate: jest.fn() })
}));

jest.mock('../../src/components', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactLocal = require('react');

  return {
    AccessibilityHeader: (props: object) =>
      ReactLocal.createElement('mock-accessibility-header', props),
    Button: () => null,
    ConnectedImagesCarousel: () => null,
    HeaderLeft: ({
      backImage
    }: {
      backImage?: (props: { tintColor: string }) => React.ReactNode;
    }) => ReactLocal.createElement('mock-header-left', null, backImage?.({ tintColor: '#141414' })),
    Image: (props: object) => ReactLocal.createElement('mock-sue-image', props),
    ListComponent: () => null,
    RegularText: () => null,
    SafeAreaViewFlex: ({ children }: { children?: React.ReactNode }) => children,
    SectionHeader: () => null,
    Wrapper: ({ children }: { children?: React.ReactNode }) => children,
    WrapperRow: ({ children, style }: { children?: React.ReactNode; style?: object }) =>
      ReactLocal.createElement('mock-wrapper-row', { style }, children),
    WrapperVertical: ({ children }: { children?: React.ReactNode }) => children
  };
});

jest.mock('../../src/config', () => ({
  Icon: {
    ArrowRight: () => null
  },
  normalize: (value: number) => value,
  texts: {
    sue: {
      myReports: 'Meine Meldungen',
      reports: 'Meldungen',
      viewMyReports: 'Meine Meldungen ansehen',
      viewReports: 'Meldungen ansehen'
    }
  }
}));

jest.mock('../../src/ConfigurationsProvider', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactLocal = require('react');

  return {
    ConfigurationsContext: ReactLocal.createContext({ appDesignSystem: {} })
  };
});

jest.mock('../../src/helpers', () => ({
  navigateToRoute: jest.fn()
}));

jest.mock('../../src/hooks', () => ({
  useStaticContent: () => ({ data: [] }),
  useVersionCheck: jest.fn()
}));

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    STATIC_CONTENT_LIST: 'staticContentList',
    SUE: {
      MY_REQUESTS: 'myRequests',
      REQUESTS: 'requests'
    }
  }
}));

jest.mock('../../src/queries/SUE', () => ({
  myRequests: jest.fn().mockResolvedValue([])
}));

jest.mock('../../src/types', () => ({
  ScreenName: {
    SueList: 'SueList'
  }
}));

import { SettingsContext } from '../../src/SettingsProvider';
import { SueHomeScreen } from '../../src/screens/SUE/SueHomeScreen';

describe('SueHomeScreen header', () => {
  it('keeps the SUE logo and adds the configurable accessibility entry', () => {
    const navigation = {
      setOptions: jest.fn()
    };

    renderer.act(() => {
      renderer.create(
        <SettingsContext.Provider value={{ globalSettings: { sections: {} } } as never}>
          <SueHomeScreen navigation={navigation as never} route={{} as never} />
        </SettingsContext.Provider>
      );
    });

    const headerRight = navigation.setOptions.mock.calls[0]?.[0].headerRight;
    let headerTree: renderer.ReactTestRenderer;

    renderer.act(() => {
      headerTree = renderer.create(headerRight());
    });

    const renderedOrder = headerTree!.root.findAll(
      (node) => typeof node.type === 'string' && node.type.startsWith('mock-')
    );

    expect(renderedOrder.map((node) => node.type)).toEqual([
      'mock-wrapper-row',
      'mock-accessibility-header',
      'mock-header-left',
      'mock-sue-image'
    ]);
    expect(headerTree!.root.findByType('mock-wrapper-row').props.style).toMatchObject({
      alignItems: 'center',
      paddingRight: 10
    });
  });
});
