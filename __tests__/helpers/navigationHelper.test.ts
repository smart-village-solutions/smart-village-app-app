import { navigateToRoute } from '../../src/helpers/navigationHelper';

describe('navigateToRoute', () => {
  const createNavigation = () => {
    const parentNavigate = jest.fn();
    const navigate = jest.fn();
    const push = jest.fn();
    const getParent = jest.fn(() => ({ navigate: parentNavigate }));

    return {
      navigation: {
        getParent,
        navigate,
        push
      },
      parentNavigate,
      navigate,
      push,
      getParent
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('switches to the configured tab when targetTabIndex is provided', () => {
    const { navigation, parentNavigate, navigate, push } = createNavigation();

    navigateToRoute({
      navigation,
      params: { title: 'Meine Meldungen' },
      routeName: 'SueList',
      targetTabIndex: 3
    });

    expect(parentNavigate).toHaveBeenCalledWith('Stack3', {
      screen: 'SueList',
      params: { title: 'Meine Meldungen' }
    });
    expect(navigate).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it('falls back to local navigate when no targetTabIndex is provided', () => {
    const { navigation, parentNavigate, navigate, push } = createNavigation();

    navigateToRoute({
      navigation,
      params: { query: 'requests' },
      routeName: 'SueList'
    });

    expect(parentNavigate).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('SueList', { query: 'requests' });
    expect(push).not.toHaveBeenCalled();
  });

  it('falls back to local push when requested and no targetTabIndex is provided', () => {
    const { navigation, parentNavigate, navigate, push } = createNavigation();

    navigateToRoute({
      navigation,
      params: { id: '123' },
      routeName: 'Detail',
      usePush: true
    });

    expect(parentNavigate).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('Detail', { id: '123' });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('logs and falls back to local navigation when targetTabIndex cannot resolve a parent', () => {
    const navigate = jest.fn();
    const push = jest.fn();
    const getParent = jest.fn(() => undefined);

    navigateToRoute({
      navigation: {
        getParent,
        navigate,
        push
      },
      params: { query: 'myRequests' },
      routeName: 'SueList',
      targetTabIndex: 3
    });

    expect(getParent).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('SueList', { query: 'myRequests' });
    expect(push).not.toHaveBeenCalled();
  });
});
