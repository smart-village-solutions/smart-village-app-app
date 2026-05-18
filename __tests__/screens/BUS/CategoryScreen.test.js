import React from 'react';
import { ScrollView, Text } from 'react-native';
import renderer from 'react-test-renderer';

import { ServiceList } from '../../../src/components/BUS/ServiceList';
import { shareMessage } from '../../../src/helpers/BUS/shareHelper';
import * as hooks from '../../../src/hooks';
import { CategoryScreen } from '../../../src/screens/BUS/CategoryScreen';
import { IndexScreen } from '../../../src/screens/BUS/IndexScreen';
import { SettingsContext } from '../../../src/SettingsProvider';
import { ScreenName } from '../../../src/types/Navigation';

const mockIndexFilterWrapperAndList = jest.fn();
const mockBusIndexFilter = jest.fn();
const mockVerticalList = jest.fn();
const getLatestVerticalListProps = () =>
  mockVerticalList.mock.calls[mockVerticalList.mock.calls.length - 1][0];

jest.mock('../../../src/hooks', () => ({
  useBusCategoryChildren: jest.fn(),
  useBusInitialArea: jest.fn(),
  useBusLifeSituationsRoot: jest.fn(),
  useBusServiceSearch: jest.fn(),
  useBusServices: jest.fn(),
  useBusTop10: jest.fn(),
  useMatomoTrackScreenView: jest.fn()
}));

jest.mock('../../../src/SettingsProvider', () => {
  const React = jest.requireActual('react');

  return {
    SettingsContext: React.createContext({
      globalSettings: {
        settings: {}
      }
    })
  };
});

jest.mock('../../../src/components', () => {
  const ActualPropTypes = jest.requireActual('prop-types');
  const { View: RNView } = jest.requireActual('react-native');

  const DefaultKeyboardAvoidingView = ({ children }) => <RNView>{children}</RNView>;
  const SafeAreaViewFlex = ({ children }) => <RNView>{children}</RNView>;
  const IndexFilterWrapperAndList = ({ filter }) => {
    mockIndexFilterWrapperAndList({ filter });

    return <RNView />;
  };

  DefaultKeyboardAvoidingView.propTypes = {
    children: ActualPropTypes.node
  };

  SafeAreaViewFlex.propTypes = {
    children: ActualPropTypes.node
  };

  IndexFilterWrapperAndList.propTypes = {
    filter: ActualPropTypes.array
  };

  return {
    DefaultKeyboardAvoidingView,
    IndexFilterWrapperAndList,
    SafeAreaViewFlex
  };
});

jest.mock('../../../src/components/Text', () => {
  const ActualPropTypes = jest.requireActual('prop-types');
  const { Text: RNText } = jest.requireActual('react-native');

  const BoldText = ({ children }) => <RNText>{children}</RNText>;
  const RegularText = ({ children }) => <RNText>{children}</RNText>;

  BoldText.propTypes = {
    children: ActualPropTypes.node
  };

  RegularText.propTypes = {
    children: ActualPropTypes.node
  };

  return { BoldText, RegularText };
});

jest.mock('../../../src/components/DefaultKeyboardAvoidingView', () => {
  const ActualPropTypes = jest.requireActual('prop-types');
  const { View: RNView } = jest.requireActual('react-native');

  const DefaultKeyboardAvoidingView = ({ children }) => <RNView>{children}</RNView>;

  DefaultKeyboardAvoidingView.propTypes = {
    children: ActualPropTypes.node
  };

  return { DefaultKeyboardAvoidingView };
});

jest.mock('../../../src/components/SafeAreaViewFlex', () => {
  const ActualPropTypes = jest.requireActual('prop-types');
  const { View: RNView } = jest.requireActual('react-native');

  const SafeAreaViewFlex = ({ children }) => <RNView>{children}</RNView>;

  SafeAreaViewFlex.propTypes = {
    children: ActualPropTypes.node
  };

  return { SafeAreaViewFlex };
});

jest.mock('../../../src/components/BUS/LifeSituationListItem', () => {
  const ActualPropTypes = jest.requireActual('prop-types');
  const { Text: RNText, View: RNView } = jest.requireActual('react-native');

  const LifeSituationListItem = ({ imageUrl, onPress, subtitle, title }) => (
    <RNView accessibilityLabel={`(${title}) button`} imageUrl={imageUrl} onPress={onPress}>
      <RNText>{title}</RNText>
      {!!subtitle && <RNText>{subtitle}</RNText>}
    </RNView>
  );

  LifeSituationListItem.propTypes = {
    imageUrl: ActualPropTypes.string,
    onPress: ActualPropTypes.func,
    subtitle: ActualPropTypes.string,
    title: ActualPropTypes.string
  };

  return { LifeSituationListItem };
});

jest.mock('../../../src/components/BUS/IndexFilter', () => {
  const { View: RNView } = jest.requireActual('react-native');

  const IndexFilter = (props) => {
    mockBusIndexFilter(props);

    return <RNView />;
  };

  IndexFilter.propTypes = {};

  return { IndexFilter };
});

jest.mock('../../../src/components/BUS/AreaAutocomplete', () => {
  const { View: RNView } = jest.requireActual('react-native');

  const AreaAutocomplete = () => <RNView />;

  AreaAutocomplete.propTypes = {};

  return { AreaAutocomplete };
});

jest.mock('../../../src/components/VerticalList', () => {
  const ActualPropTypes = jest.requireActual('prop-types');
  const { View: RNView } = jest.requireActual('react-native');

  const renderOptionalNode = (node) => {
    if (!node) {
      return null;
    }

    if (typeof node === 'function') {
      const OptionalNode = node;

      return <OptionalNode />;
    }

    return node;
  };

  const VerticalList = (props) => {
    mockVerticalList(props);

    return (
      <RNView>
        {renderOptionalNode(props.ListHeaderComponent)}
        {renderOptionalNode(props.ListEmptyComponent)}
      </RNView>
    );
  };

  VerticalList.propTypes = {
    data: ActualPropTypes.array,
    ListEmptyComponent: ActualPropTypes.oneOfType([ActualPropTypes.func, ActualPropTypes.node]),
    ListHeaderComponent: ActualPropTypes.oneOfType([ActualPropTypes.func, ActualPropTypes.node])
  };

  return { VerticalList };
});

describe('BUS CategoryScreen', () => {
  const navigation = { push: jest.fn() };
  const refetch = jest.fn();
  const defaultCategoryChildrenState = {
    data: [],
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch
  };
  const baseCategory = {
    id: '247228741',
    name: 'Lebenslagen für Bürgerinnen und Bürger',
    publicServiceTypes: [{ id: 'service-1', name: 'Meldebescheinigung' }]
  };
  const route = {
    params: {
      areaId: '09162000',
      category: baseCategory,
      isRootCategory: true
    }
  };
  const createCategoryRoute = ({
    areaId = '09162000',
    category = {},
    isRootCategory = true
  } = {}) => ({
    params: {
      areaId,
      category: {
        ...baseCategory,
        publicServiceTypes: [],
        ...category
      },
      isRootCategory
    }
  });
  const pressServiceRow = (component, label = 'Meldebescheinigung') => {
    const serviceRow = component.root.findByProps({
      accessibilityLabel: `(${label}) button`
    });

    renderer.act(() => {
      serviceRow.props.onPress();
    });
  };
  const expectBusDetailNavigation = (service) => {
    expect(navigation.push).toHaveBeenCalledWith(ScreenName.BusDetail, {
      areaId: '09162000',
      data: service,
      query: '',
      queryVariables: {},
      rootRouteName: 'BUS',
      shareContent: {
        message: shareMessage(service)
      },
      title: service.name
    });
  };
  const expectCategoryStateMessage = ({ isRootCategory, expectedText }) => {
    hooks.useBusCategoryChildren.mockReturnValue({
      ...defaultCategoryChildrenState,
      isError: true
    });

    const component = renderScreen(createCategoryRoute({ isRootCategory }));

    expect(component.root.findByType(ScrollView)).toBeTruthy();
    expect(component.root.findByType(Text).props.children).toBe(expectedText);
  };

  beforeEach(() => {
    navigation.push.mockClear();
    refetch.mockClear();
    hooks.useBusServices.mockReturnValue({
      data: [{ id: 'service-1', name: 'Meldebescheinigung' }],
      isFetching: false,
      isLoading: false,
      refetch
    });
  });

  const renderScreen = (screenRoute = route) => {
    let component;

    renderer.act(() => {
      component = renderer.create(<CategoryScreen navigation={navigation} route={screenRoute} />);
    });

    return component;
  };

  it('renders category entries and direct services together', () => {
    hooks.useBusCategoryChildren.mockReturnValue({
      data: [
        {
          id: '247228745',
          image: {
            url: 'https://example.com/partnerschaft.jpg'
          },
          name: 'Partnerschaft und Familie'
        },
        {
          id: '247228746',
          name: 'Geburt'
        }
      ],
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch
    });

    const component = renderScreen();
    const renderedTexts = component.root
      .findAllByType(Text)
      .map((textNode) => textNode.props.children)
      .filter(Boolean);

    expect(renderedTexts).toEqual(
      expect.arrayContaining(['Partnerschaft und Familie', 'Geburt', 'Meldebescheinigung'])
    );
    expect(
      component.root.findByProps({
        accessibilityLabel: '(Partnerschaft und Familie) button',
        imageUrl: 'https://example.com/partnerschaft.jpg'
      })
    ).toBeTruthy();
  });

  it('pushes child categories to BusCategory', () => {
    hooks.useBusCategoryChildren.mockReturnValue({
      data: [
        {
          id: '247228745',
          name: 'Partnerschaft und Familie',
          publicServiceTypes: []
        }
      ],
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch
    });

    const component = renderScreen();
    const categoryRow = component.root.findByProps({
      accessibilityLabel: '(Partnerschaft und Familie) button'
    });

    renderer.act(() => {
      categoryRow.props.onPress();
    });

    expect(navigation.push).toHaveBeenCalledWith(ScreenName.BusCategory, {
      areaId: '09162000',
      category: {
        id: '247228745',
        name: 'Partnerschaft und Familie',
        publicServiceTypes: []
      },
      isRootCategory: false,
      title: 'Partnerschaft und Familie'
    });
  });

  it('filters invalid child categories and sorts valid ones by numeric position and title', () => {
    hooks.useBusCategoryChildren.mockReturnValue({
      data: [
        {
          id: 'child-c',
          name: 'Charlie',
          position: '2',
          publicServiceTypes: []
        },
        {
          id: 'child-a',
          name: 'Alpha',
          position: 1,
          publicServiceTypes: []
        },
        {
          id: 'child-b',
          name: 'Bravo',
          position: '2',
          publicServiceTypes: []
        },
        {
          id: null,
          name: 'Ohne ID',
          publicServiceTypes: []
        },
        {
          id: 'child-empty-name',
          name: '   ',
          publicServiceTypes: []
        }
      ],
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch
    });

    const component = renderScreen();
    const renderedTexts = component.root
      .findAllByType(Text)
      .map((textNode) => textNode.props.children)
      .filter(Boolean);

    expect(renderedTexts).toEqual(
      expect.arrayContaining(['Alpha', 'Bravo', 'Charlie', 'Meldebescheinigung'])
    );
    expect(renderedTexts.indexOf('Alpha')).toBeLessThan(renderedTexts.indexOf('Bravo'));
    expect(renderedTexts.indexOf('Bravo')).toBeLessThan(renderedTexts.indexOf('Charlie'));
    expect(renderedTexts).not.toContain('Ohne ID');
  });

  it('pushes direct services to BusDetail', () => {
    hooks.useBusCategoryChildren.mockReturnValue(defaultCategoryChildrenState);

    const component = renderScreen();
    pressServiceRow(component);
    expectBusDetailNavigation({
      id: 'service-1',
      name: 'Meldebescheinigung'
    });
  });

  it('resolves direct service refs against the current area services before opening details', () => {
    hooks.useBusCategoryChildren.mockReturnValue(defaultCategoryChildrenState);
    hooks.useBusServices.mockReturnValue({
      data: [{ id: 'resolved-service-77', name: 'Meldebescheinigung' }],
      isFetching: false,
      isLoading: false,
      refetch
    });

    const component = renderScreen();
    pressServiceRow(component);
    expectBusDetailNavigation({
      id: 'resolved-service-77',
      name: 'Meldebescheinigung'
    });
  });

  it('renders direct service refs even when they are not part of the currently loaded area services', () => {
    hooks.useBusCategoryChildren.mockReturnValue({
      data: [],
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch
    });
    hooks.useBusServices.mockReturnValue({
      data: [{ id: 'other-service', name: 'Anderer Dienst' }],
      isFetching: false,
      isLoading: false,
      refetch
    });

    const component = renderScreen();

    expect(
      component.root.findByProps({
        accessibilityLabel: '(Meldebescheinigung) button'
      })
    ).toBeTruthy();
  });

  it('keeps the refreshable container mounted for the empty state', () => {
    hooks.useBusCategoryChildren.mockReturnValue(defaultCategoryChildrenState);

    const emptyRoute = createCategoryRoute();
    const component = renderScreen(emptyRoute);

    expect(component.root.findByType(ScrollView)).toBeTruthy();
    expect(component.root.findByType(Text).props.children).toBe(
      'Für diese Lebenslage sind derzeit keine Unterkategorien oder Leistungen verfügbar.'
    );
  });

  it.each([
    [false, 'Diese Lebenslage konnte derzeit nicht geladen werden.'],
    [true, 'Die Lebenslagen konnten derzeit nicht geladen werden.']
  ])(
    'renders the correct error copy for root category state %s',
    (isRootCategory, expectedText) => {
      expectCategoryStateMessage({ isRootCategory, expectedText });
    }
  );

  it('does not render stale child categories after switching to a failed category', () => {
    const categoryARoute = {
      params: {
        areaId: '09162000',
        category: {
          id: 'category-a',
          name: 'Kategorie A',
          publicServiceTypes: []
        },
        isRootCategory: false
      }
    };
    const categoryBRoute = {
      params: {
        areaId: '09162000',
        category: {
          id: 'category-b',
          name: 'Kategorie B',
          publicServiceTypes: []
        },
        isRootCategory: false
      }
    };

    hooks.useBusCategoryChildren
      .mockReturnValueOnce({
        data: [
          {
            id: 'child-a',
            name: 'Unterkategorie A',
            publicServiceTypes: []
          }
        ],
        isError: false,
        isFetching: false,
        isLoading: false,
        refetch
      })
      .mockReturnValueOnce({
        data: [
          {
            id: 'child-a',
            name: 'Unterkategorie A',
            publicServiceTypes: []
          }
        ],
        isError: true,
        isFetching: false,
        isLoading: false,
        refetch
      });

    const component = renderScreen(categoryARoute);

    expect(
      component.root.findByProps({
        accessibilityLabel: '(Unterkategorie A) button'
      })
    ).toBeTruthy();

    renderer.act(() => {
      component.update(<CategoryScreen navigation={navigation} route={categoryBRoute} />);
    });

    expect(
      component.root.findAllByProps({
        accessibilityLabel: '(Unterkategorie A) button'
      })
    ).toHaveLength(0);
    expect(component.root.findByType(Text).props.children).toBe(
      'Diese Lebenslage konnte derzeit nicht geladen werden.'
    );
  });

  it('does not return null for category id 0', () => {
    hooks.useBusCategoryChildren.mockReturnValue({
      data: [],
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch
    });

    const zeroIdRoute = {
      params: {
        areaId: '09162000',
        category: {
          id: 0,
          name: 'Kategorie Null',
          publicServiceTypes: []
        },
        isRootCategory: false
      }
    };
    const component = renderScreen(zeroIdRoute);

    expect(component.toJSON()).not.toBeNull();
    expect(component.root.findByType(ScrollView)).toBeTruthy();
  });

  it('shows back to top in nested life situations when the content exceeds the viewport', () => {
    hooks.useBusCategoryChildren.mockReturnValue({
      data: [
        {
          id: '247228745',
          name: 'Partnerschaft und Familie',
          publicServiceTypes: []
        }
      ],
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch
    });

    const nestedRoute = {
      params: {
        areaId: '09162000',
        category: {
          ...baseCategory,
          publicServiceTypes: []
        },
        isRootCategory: false
      }
    };
    const component = renderScreen(nestedRoute);

    renderer.act(() => {
      component.root.findByType(ScrollView).props.onContentSizeChange(0, 5000);
    });

    const renderedTexts = component.root
      .findAllByType(Text)
      .map((textNode) => textNode.props.children)
      .filter(Boolean);

    expect(renderedTexts).toContain('ZURÜCK NACH OBEN');
  });
});

describe('BUS IndexScreen', () => {
  const navigation = { navigate: jest.fn(), push: jest.fn() };
  let lifeSituationsRefetch;
  let lifeSituationChildrenRefetch;
  const expectedDefaultFilter = [
    expect.objectContaining({
      id: 2,
      selected: true,
      title: 'Lebenslagen'
    }),
    expect.objectContaining({
      id: 3,
      selected: false,
      title: 'Suche'
    }),
    expect.objectContaining({
      id: 4,
      selected: false,
      title: 'A-Z'
    })
  ];
  const rootCategory = {
    id: '247228741',
    name: 'Lebenslagen fuer Buergerinnen und Buerger',
    publicServiceTypes: []
  };
  const rootChildCategories = [
    {
      id: '247228745',
      image: {
        url: 'https://example.com/familie.jpg'
      },
      name: 'Partnerschaft und Familie',
      description: 'Beschreibung B',
      position: 2
    },
    {
      id: '247228744',
      image: {
        url: 'https://example.com/ausweise.jpg'
      },
      name: 'Ausweise und Dokumente',
      description: 'Beschreibung A',
      position: 1
    },
    {
      id: '247228746',
      name: 'Geburt',
      description: 'Beschreibung C',
      position: 2
    }
  ];
  let servicesRefetch;
  let top10Refetch;
  const expectDefaultFilterState = () => {
    const [{ filter }] = mockIndexFilterWrapperAndList.mock.calls[0];

    expect(filter).toEqual(expectedDefaultFilter);
  };
  const expectSortedRootChildren = (data) => {
    expect(data).toEqual([
      expect.objectContaining({
        id: '247228744',
        routeName: 'BusCategory',
        subtitle: 'Beschreibung A',
        title: 'Ausweise und Dokumente'
      }),
      expect.objectContaining({
        id: '247228746',
        routeName: 'BusCategory',
        subtitle: 'Beschreibung C',
        title: 'Geburt'
      }),
      expect.objectContaining({
        id: '247228745',
        routeName: 'BusCategory',
        subtitle: 'Beschreibung B',
        title: 'Partnerschaft und Familie'
      })
    ]);
  };

  beforeEach(() => {
    mockIndexFilterWrapperAndList.mockClear();
    mockVerticalList.mockClear();
    lifeSituationsRefetch = jest.fn();
    lifeSituationChildrenRefetch = jest.fn();
    navigation.navigate.mockClear();
    navigation.push.mockClear();
    servicesRefetch = jest.fn();
    top10Refetch = jest.fn();
    hooks.useBusInitialArea.mockReturnValue({
      data: {
        id: '09162000',
        label: 'Testort'
      }
    });
    hooks.useBusServices.mockReturnValue({
      data: [],
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
      isLoading: false,
      refetch: servicesRefetch
    });
    hooks.useBusServiceSearch.mockReturnValue({
      data: [],
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
      isLoading: false
    });
    hooks.useBusTop10.mockReturnValue({
      data: [],
      isLoading: false,
      refetch: top10Refetch
    });
    hooks.useBusLifeSituationsRoot.mockReturnValue({
      data: rootCategory,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: lifeSituationsRefetch
    });
    hooks.useBusCategoryChildren.mockReturnValue({
      data: rootChildCategories,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: lifeSituationChildrenRefetch
    });
  });

  const renderIndexScreen = (bus = {}) => {
    let component;

    renderer.act(() => {
      component = renderer.create(
        <SettingsContext.Provider
          value={{
            globalSettings: {
              settings: {
                bus: {
                  areaId: '09162000',
                  initialFilter: ['lifeSituations', 'search', 'aToZ'],
                  uri: 'https://bus.example',
                  ...bus
                }
              }
            }
          }}
        >
          <IndexScreen navigation={navigation} />
        </SettingsContext.Provider>
      );
    });

    return component;
  };

  it('respects the configured BUS tab order including top10 before Lebenslagen', () => {
    renderIndexScreen({
      initialFilter: ['top10', 'lifeSituations', 'search', 'aToZ']
    });

    const [{ filter }] = mockIndexFilterWrapperAndList.mock.calls[0];

    expect(filter).toEqual([
      expect.objectContaining({
        id: 1,
        selected: true,
        title: 'Meistgesucht'
      }),
      expect.objectContaining({
        id: 2,
        selected: false,
        title: 'Lebenslagen'
      }),
      expect.objectContaining({
        id: 3,
        selected: false,
        title: 'Suche'
      }),
      expect.objectContaining({
        id: 4,
        selected: false,
        title: 'A-Z'
      })
    ]);
  });

  it('falls back to the full default BUS filter set when initialFilter is missing or empty', () => {
    renderIndexScreen({
      initialFilter: []
    });

    expectDefaultFilterState();
  });

  it('creates a fresh default filter state on repeated mounts', () => {
    const firstComponent = renderIndexScreen({
      initialFilter: []
    });

    const [{ filter: firstFilter }] = mockIndexFilterWrapperAndList.mock.calls[0];
    firstFilter[0].selected = false;
    renderer.act(() => {
      firstComponent.unmount();
    });

    mockIndexFilterWrapperAndList.mockClear();

    renderIndexScreen({
      initialFilter: []
    });

    expectDefaultFilterState();
  });

  it('does not block the Lebenslagen view when services are still fetching but the root is ready', () => {
    hooks.useBusServices.mockReturnValue({
      data: [],
      isFetching: true,
      isLoading: false,
      refetch: servicesRefetch
    });

    renderIndexScreen();

    const [verticalListProps] = mockVerticalList.mock.calls[0];

    expect(verticalListProps.isLoading).toBe(false);
    expectSortedRootChildren(verticalListProps.data);
  });

  it('renders explicit root empty copy when the Lebenslagen root lookup returns null', () => {
    hooks.useBusLifeSituationsRoot.mockReturnValue({
      data: null,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: lifeSituationsRefetch
    });

    const component = renderIndexScreen();
    const renderedTexts = component.root
      .findAllByType(Text)
      .map((textNode) => textNode.props.children)
      .filter(Boolean);

    const [verticalListProps] = mockVerticalList.mock.calls[0];

    expect(verticalListProps.data).toEqual([]);
    expect(renderedTexts).toEqual(
      expect.arrayContaining([
        '0 TREFFER',
        'Für diese Lebenslage sind derzeit keine Unterkategorien oder Leistungen verfügbar.'
      ])
    );
  });

  it('renders explicit root error copy when the Lebenslagen root lookup fails', () => {
    hooks.useBusLifeSituationsRoot.mockReturnValue({
      data: null,
      isError: true,
      isFetching: false,
      isLoading: false,
      refetch: lifeSituationsRefetch
    });

    const component = renderIndexScreen();
    const renderedTexts = component.root
      .findAllByType(Text)
      .map((textNode) => textNode.props.children)
      .filter(Boolean);

    expect(renderedTexts).toEqual(
      expect.arrayContaining(['0 TREFFER', 'Die Lebenslagen konnten derzeit nicht geladen werden.'])
    );
  });

  it('renders root children when the Lebenslagen root category id is 0', () => {
    hooks.useBusLifeSituationsRoot.mockReturnValue({
      data: {
        id: 0,
        name: 'Lebenslagen Wurzel',
        publicServiceTypes: []
      },
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: lifeSituationsRefetch
    });
    hooks.useBusCategoryChildren.mockReturnValue({
      data: [
        {
          id: 'child-zero',
          name: 'Direktes Kind',
          description: 'Direkte Beschreibung',
          position: 1
        }
      ],
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: lifeSituationChildrenRefetch
    });

    renderIndexScreen();

    const [verticalListProps] = mockVerticalList.mock.calls[0];

    expect(verticalListProps.data).toEqual([
      expect.objectContaining({
        id: 'child-zero',
        routeName: 'BusCategory',
        subtitle: 'Direkte Beschreibung',
        title: 'Direktes Kind'
      })
    ]);
  });

  it('refetches the Lebenslagen root alongside the other BUS index data on refresh', async () => {
    renderIndexScreen();

    await renderer.act(async () => {
      const [verticalListProps] = mockVerticalList.mock.calls[0];

      await verticalListProps.refreshControl.props.onRefresh();
    });

    expect(lifeSituationsRefetch).toHaveBeenCalled();
    expect(lifeSituationChildrenRefetch).toHaveBeenCalled();
    expect(servicesRefetch).toHaveBeenCalled();
    expect(top10Refetch).toHaveBeenCalled();
  });

  it('does not refetch life situation children on refresh when the root category is missing', async () => {
    hooks.useBusLifeSituationsRoot.mockReturnValue({
      data: null,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: lifeSituationsRefetch
    });

    renderIndexScreen();

    await renderer.act(async () => {
      const [verticalListProps] = mockVerticalList.mock.calls[0];

      await verticalListProps.refreshControl.props.onRefresh();
    });

    expect(lifeSituationsRefetch).toHaveBeenCalled();
    expect(lifeSituationChildrenRefetch).not.toHaveBeenCalled();
    expect(servicesRefetch).toHaveBeenCalled();
    expect(top10Refetch).toHaveBeenCalled();
  });

  it('sorts root children by numeric position and then alphabetically by title', () => {
    renderIndexScreen();

    const [verticalListProps] = mockVerticalList.mock.calls[0];

    expect(verticalListProps.data.map((item) => item.title)).toEqual([
      'Ausweise und Dokumente',
      'Geburt',
      'Partnerschaft und Familie'
    ]);
  });

  it('resolves root direct service refs against the current area services', () => {
    hooks.useBusLifeSituationsRoot.mockReturnValue({
      data: {
        ...rootCategory,
        publicServiceTypes: [{ id: 'root-service-ref', name: 'Wohnsitz anmelden' }]
      },
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: lifeSituationsRefetch
    });
    hooks.useBusServices.mockReturnValue({
      data: [{ id: 'resolved-root-service', name: 'Wohnsitz anmelden' }],
      isFetching: false,
      isLoading: false,
      refetch: servicesRefetch
    });

    renderIndexScreen();

    const [verticalListProps] = mockVerticalList.mock.calls[0];

    expect(verticalListProps.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'resolved-root-service',
          routeName: 'BusDetail',
          title: 'Wohnsitz anmelden'
        })
      ])
    );
  });

  it('keeps unresolved root direct service refs visible in the list', () => {
    hooks.useBusLifeSituationsRoot.mockReturnValue({
      data: {
        ...rootCategory,
        publicServiceTypes: [{ id: 'missing-root-service', name: 'Nicht verfuegbar' }]
      },
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: lifeSituationsRefetch
    });
    hooks.useBusServices.mockReturnValue({
      data: [{ id: 'resolved-root-service', name: 'Wohnsitz anmelden' }],
      isFetching: false,
      isLoading: false,
      refetch: servicesRefetch
    });

    renderIndexScreen();

    const [verticalListProps] = mockVerticalList.mock.calls[0];

    expect(
      verticalListProps.data.find(
        (item) => item.routeName === 'BusDetail' && item.title === 'Nicht verfuegbar'
      )
    ).toEqual(
      expect.objectContaining({
        id: 'missing-root-service',
        routeName: 'BusDetail',
        title: 'Nicht verfuegbar'
      })
    );
  });
});

describe('BUS ServiceList', () => {
  const navigation = { navigate: jest.fn(), push: jest.fn() };
  const setArea = jest.fn();
  const mountedComponents = [];
  const LIFE_SITUATIONS_EMPTY_STATE_MESSAGE =
    'Für diese Lebenslage sind derzeit keine Unterkategorien oder Leistungen verfügbar.';
  const SEARCH_FILTER = { id: 3, title: 'Suche', selected: true };
  const A_Z_FILTER = { id: 4, title: 'A-Z', selected: true };
  const LIFE_SITUATIONS_FILTER = { id: 2, title: 'Lebenslagen', selected: true };
  const TOP10_FILTER = { id: 1, title: 'Meistgesucht', selected: true };
  const TEST_FILTER = { id: 999, title: 'Test', selected: true };
  const DEFAULT_TOP10 = [
    {
      id: 'service-a',
      title: 'Altes Top10',
      routeName: 'BusDetail',
      params: { areaId: '09162000' }
    }
  ];
  const createAZSelection = (value = 'A') => [{ id: 1, value, selected: true }];
  const flushAtoZImport = async () => {
    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await Promise.resolve();
  };

  beforeEach(() => {
    mountedComponents.length = 0;
    mockBusIndexFilter.mockClear();
    mockVerticalList.mockClear();
    navigation.navigate.mockClear();
    navigation.push.mockClear();
    setArea.mockClear();
    hooks.useBusServiceSearch.mockReturnValue({
      data: [],
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false
    });
  });

  afterEach(() => {
    renderer.act(() => {
      while (mountedComponents.length) {
        const component = mountedComponents.pop();
        component.unmount();
      }
    });
  });

  const createServiceListProps = (props = {}) => ({
    areaId: '09162000',
    areaName: 'Testort',
    initialAreaId: '09162000',
    initialAreaName: 'Testort',
    isListLoading: false,
    lifeSituationsEmptyStateMessage: LIFE_SITUATIONS_EMPTY_STATE_MESSAGE,
    lifeSituations: [],
    navigation,
    results: [],
    selectedFilter: TOP10_FILTER,
    setArea,
    top10: DEFAULT_TOP10,
    ...props
  });

  const renderServiceList = (props = {}) => {
    let component;

    renderer.act(() => {
      component = renderer.create(<ServiceList {...createServiceListProps(props)} />);
    });
    mountedComponents.push(component);

    return component;
  };

  const updateServiceList = (component, props = {}) => {
    renderer.act(() => {
      component.update(<ServiceList {...createServiceListProps(props)} />);
    });
  };

  const getLatestIndexFilterProps = () =>
    mockBusIndexFilter.mock.calls[mockBusIndexFilter.mock.calls.length - 1][0];

  const setSearchInput = (value) => {
    renderer.act(() => {
      getLatestIndexFilterProps().setSearchData(value);
    });
  };

  const selectAZFilter = (value = 'A') => {
    renderer.act(() => {
      getLatestIndexFilterProps().setAZFilterData(createAZSelection(value));
    });
  };

  it('does not show stale TOP10 data after an area switch while the new area is still loading', () => {
    const component = renderServiceList();
    let [verticalListProps] = mockVerticalList.mock.calls[0];

    expect(verticalListProps.data).toEqual([
      expect.objectContaining({
        id: 'service-a',
        title: 'Altes Top10'
      })
    ]);

    updateServiceList(component, {
      areaId: '11000000',
      areaName: 'Neuort',
      isListLoading: true
    });

    [verticalListProps] = mockVerticalList.mock.calls[mockVerticalList.mock.calls.length - 1];

    expect(verticalListProps.isLoading).toBe(true);
    expect(verticalListProps.data).toEqual([]);
  });

  it('does not show stale A-Z data while the new area is still loading', () => {
    renderServiceList({
      areaId: '11000000',
      areaName: 'Neuort',
      isListLoading: true,
      results: [
        {
          id: 'service-b',
          title: 'Altes A-Z Ergebnis',
          routeName: 'BusDetail',
          params: { areaId: '09162000' }
        }
      ],
      selectedFilter: A_Z_FILTER
    });

    const verticalListProps = getLatestVerticalListProps();

    expect(verticalListProps).toEqual(expect.objectContaining({ data: [], isLoading: true }));
  });

  it('clears previous A-Z results after an area change when the new area has no matching letter entries', () => {
    const component = renderServiceList({
      selectedFilter: A_Z_FILTER
    });

    selectAZFilter('A');

    renderer.act(() => {
      getLatestIndexFilterProps().setListItems([
        {
          id: 'service-a',
          title: 'Anmeldung',
          routeName: 'BusDetail',
          params: { areaId: '09162000', data: { name: 'Anmeldung' } }
        }
      ]);
    });

    expect(getLatestVerticalListProps().data).toEqual([
      expect.objectContaining({
        id: 'service-a',
        title: 'Anmeldung'
      })
    ]);

    updateServiceList(component, {
      areaId: '11000000',
      areaName: 'Neuort',
      results: [],
      selectedFilter: A_Z_FILTER,
      top10: []
    });

    expect(getLatestVerticalListProps().data).toEqual([]);
  });

  it('does not show stale life situations while the new area is still loading', () => {
    renderServiceList({
      areaId: '11000000',
      areaName: 'Neuort',
      isListLoading: true,
      lifeSituations: [
        {
          id: 'life-a',
          title: 'Alte Lebenslage',
          routeName: 'BusCategory',
          params: { areaId: '09162000' }
        }
      ],
      selectedFilter: LIFE_SITUATIONS_FILTER
    });

    const verticalListProps = getLatestVerticalListProps();

    expect(verticalListProps).toEqual(expect.objectContaining({ data: [], isLoading: true }));
  });

  it('renders no items when the selected area is removed', () => {
    renderServiceList({
      areaId: undefined,
      areaName: '',
      results: [
        {
          id: 'service-b',
          title: 'Buergeramt',
          routeName: 'BusDetail',
          params: { areaId: '09162000' }
        }
      ],
      selectedFilter: SEARCH_FILTER
    });

    const verticalListProps = getLatestVerticalListProps();

    expect(verticalListProps.data).toEqual([]);
  });

  it('maps backend BUS search results to clickable list items', () => {
    jest.useFakeTimers();
    hooks.useBusServiceSearch.mockReturnValue({
      data: [
        {
          id: 'service-search-1',
          name: 'Gewerbe anmelden'
        }
      ],
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false
    });

    renderServiceList({ selectedFilter: SEARCH_FILTER });

    setSearchInput('Gewerbe');

    renderer.act(() => {
      jest.advanceTimersByTime(400);
    });

    const verticalListProps = getLatestVerticalListProps();

    expect(verticalListProps.data).toEqual([
      expect.objectContaining({
        id: 'service-search-1',
        routeName: 'BusDetail',
        title: 'Gewerbe anmelden',
        params: expect.objectContaining({
          areaId: '09162000',
          title: 'Gewerbe anmelden'
        })
      })
    ]);
    renderer.act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('debounces BUS search input before updating the backend query term', () => {
    jest.useFakeTimers();
    renderServiceList({ selectedFilter: SEARCH_FILTER });

    expect(hooks.useBusServiceSearch).toHaveBeenLastCalledWith('09162000', '');

    setSearchInput('Unternehmen');

    expect(hooks.useBusServiceSearch).toHaveBeenLastCalledWith('09162000', '');

    renderer.act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(hooks.useBusServiceSearch).toHaveBeenLastCalledWith('09162000', 'Unternehmen');
    renderer.act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('does not show the BUS search spinner while the input is still debouncing', () => {
    jest.useFakeTimers();
    renderServiceList({ selectedFilter: SEARCH_FILTER });

    setSearchInput('Unternehmen');

    expect(getLatestVerticalListProps().isLoading).toBe(false);

    renderer.act(() => {
      jest.advanceTimersByTime(400);
    });

    renderer.act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('clears a pending BUS search term when the selected area changes', () => {
    jest.useFakeTimers();
    let component = renderServiceList({
      selectedFilter: SEARCH_FILTER
    });

    setSearchInput('Unternehmen');

    renderer.act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(hooks.useBusServiceSearch).toHaveBeenLastCalledWith('09162000', 'Unternehmen');

    updateServiceList(component, {
      areaId: '11000000',
      areaName: 'Neuort',
      selectedFilter: SEARCH_FILTER,
      top10: []
    });

    expect(hooks.useBusServiceSearch).toHaveBeenLastCalledWith('11000000', '');
    renderer.act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('keeps the previous BUS search results visible while a new input is still debouncing', () => {
    jest.useFakeTimers();
    hooks.useBusServiceSearch.mockReturnValue({
      data: [
        {
          id: 'service-search-1',
          name: 'Gewerbe anmelden'
        }
      ],
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false
    });

    renderServiceList({ selectedFilter: SEARCH_FILTER });

    setSearchInput('Gewerbe');

    renderer.act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(getLatestVerticalListProps().data).toEqual([
      expect.objectContaining({
        id: 'service-search-1',
        title: 'Gewerbe anmelden'
      })
    ]);

    setSearchInput('Gewerbe a');

    expect(getLatestVerticalListProps().data).toEqual([
      expect.objectContaining({
        id: 'service-search-1',
        title: 'Gewerbe anmelden'
      })
    ]);

    renderer.act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('continues the A-Z import after a temporary next-page fetch is already in flight', async () => {
    const fetchNextServicesPage = jest.fn().mockResolvedValue({
      data: {
        pages: [
          {
            items: [{ id: 'service-a', name: 'Anmeldung' }],
            totalItemCount: 1
          }
        ]
      }
    });

    let component = renderServiceList({
      fetchNextServicesPage,
      hasNextServicesPage: true,
      isFetchingNextServicesPage: true,
      selectedFilter: A_Z_FILTER
    });

    selectAZFilter();

    await renderer.act(async () => {
      await Promise.resolve();
    });

    expect(fetchNextServicesPage).not.toHaveBeenCalled();

    updateServiceList(component, {
      fetchNextServicesPage,
      hasNextServicesPage: true,
      isFetchingNextServicesPage: false,
      isServicesLoading: false,
      selectedFilter: A_Z_FILTER,
      top10: []
    });

    await renderer.act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchNextServicesPage).toHaveBeenCalledTimes(1);
  });

  it('does not restart the A-Z import loop after a failed page load', async () => {
    const fetchNextServicesPage = jest.fn().mockRejectedValue(new Error('timeout'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const component = renderServiceList({
      fetchNextServicesPage,
      hasNextServicesPage: true,
      selectedFilter: A_Z_FILTER
    });

    selectAZFilter();

    await renderer.act(async () => {
      await flushAtoZImport();
    });

    expect(fetchNextServicesPage).toHaveBeenCalledTimes(1);
    updateServiceList(component, {
      fetchNextServicesPage,
      hasNextServicesPage: true,
      selectedFilter: A_Z_FILTER,
      top10: []
    });

    expect(fetchNextServicesPage).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  it('does not mark the A-Z import complete before the first service page for the area has loaded', async () => {
    const fetchNextServicesPage = jest.fn().mockResolvedValue({
      data: {
        pages: [
          {
            items: [{ id: 'service-a', name: 'Anmeldung' }],
            totalItemCount: 1
          }
        ]
      }
    });

    const component = renderServiceList({
      fetchNextServicesPage,
      hasNextServicesPage: false,
      isServicesLoading: true,
      selectedFilter: A_Z_FILTER
    });

    selectAZFilter('A');

    await renderer.act(async () => {
      await Promise.resolve();
    });

    expect(fetchNextServicesPage).not.toHaveBeenCalled();

    updateServiceList(component, {
      fetchNextServicesPage,
      hasNextServicesPage: true,
      isServicesLoading: false,
      selectedFilter: A_Z_FILTER,
      top10: []
    });

    await renderer.act(async () => {
      await flushAtoZImport();
    });

    expect(fetchNextServicesPage).toHaveBeenCalledTimes(1);
  });

  it('stops the A-Z import when the backend reports no loading progress anymore', async () => {
    const fetchNextServicesPage = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          pages: [
            {
              items: [{ id: 'service-a', name: 'Anmeldung' }],
              totalItemCount: 2
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          pages: [
            {
              items: [{ id: 'service-a', name: 'Anmeldung' }],
              totalItemCount: 2
            }
          ]
        }
      })
      .mockRejectedValueOnce(new Error('should not request more pages without progress'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    renderServiceList({
      fetchNextServicesPage,
      hasNextServicesPage: true,
      selectedFilter: A_Z_FILTER
    });

    selectAZFilter();

    await renderer.act(async () => {
      await flushAtoZImport();
    });

    expect(fetchNextServicesPage).toHaveBeenCalledTimes(2);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('restarts the A-Z full import after switching to another letter in the same area', async () => {
    const fetchNextServicesPage = jest.fn().mockResolvedValue({
      data: {
        pages: [
          {
            items: [{ id: 'service-a', name: 'Anmeldung' }],
            totalItemCount: 1
          }
        ]
      }
    });

    renderServiceList({
      fetchNextServicesPage,
      hasNextServicesPage: true,
      selectedFilter: A_Z_FILTER
    });

    selectAZFilter('A');

    await renderer.act(async () => {
      await flushAtoZImport();
    });

    expect(fetchNextServicesPage).toHaveBeenCalledTimes(1);

    selectAZFilter('B');

    await renderer.act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchNextServicesPage).toHaveBeenCalledTimes(2);
  });

  it('does not render the life situations empty state when no area is selected', () => {
    renderServiceList({
      areaId: undefined,
      areaName: '',
      lifeSituationsEmptyStateMessage: LIFE_SITUATIONS_EMPTY_STATE_MESSAGE,
      selectedFilter: LIFE_SITUATIONS_FILTER
    });

    const verticalListProps = getLatestVerticalListProps();

    expect(verticalListProps.data).toEqual([]);
    expect(verticalListProps.ListEmptyComponent).toBeNull();
  });

  it('updates filtered items when the title changes for the same service id', () => {
    jest.useFakeTimers();
    renderServiceList({
      selectedFilter: TEST_FILTER
    });

    renderer.act(() => {
      getLatestIndexFilterProps().setListItems([
        {
          id: 'service-a',
          title: 'Anmeldung Alt',
          routeName: 'BusDetail',
          params: { areaId: '09162000', data: { name: 'Anmeldung Alt' } }
        }
      ]);
    });

    expect(getLatestVerticalListProps().data).toEqual([
      expect.objectContaining({
        id: 'service-a',
        title: 'Anmeldung Alt'
      })
    ]);

    renderer.act(() => {
      getLatestIndexFilterProps().setListItems([
        {
          id: 'service-a',
          title: 'Anmeldung Aktualisiert',
          routeName: 'BusDetail',
          params: { areaId: '09162000', data: { name: 'Anmeldung Aktualisiert' } }
        }
      ]);
    });

    expect(getLatestVerticalListProps().data).toEqual([
      expect.objectContaining({
        id: 'service-a',
        title: 'Anmeldung Aktualisiert'
      })
    ]);

    renderer.act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });
});
