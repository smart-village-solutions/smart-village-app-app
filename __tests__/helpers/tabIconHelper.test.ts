import { resolveTabIconSource } from '../../src/helpers/tabIconHelper';

describe('resolveTabIconSource', () => {
  it('keeps the existing named icon configuration working', () => {
    expect(resolveTabIconSource({ iconName: 'Home' }, false)).toEqual({
      type: 'named',
      value: 'Home'
    });
  });

  it('supports SVG and image sources', () => {
    expect(resolveTabIconSource({ svg: 'service' }, false)).toEqual({
      type: 'svg',
      value: 'service'
    });
    expect(resolveTabIconSource({ icon: 'https://example.org/service.png' }, false)).toEqual({
      type: 'image',
      value: 'https://example.org/service.png'
    });
  });

  it('uses the active source while focused', () => {
    expect(
      resolveTabIconSource(
        {
          activeSvg: 'service-active',
          icon: 'https://example.org/service.png'
        },
        true
      )
    ).toEqual({ type: 'svg', value: 'service-active' });
  });

  it('falls back to the regular source when no active source is configured', () => {
    expect(resolveTabIconSource({ icon: 'https://example.org/service.png' }, true)).toEqual({
      type: 'image',
      value: 'https://example.org/service.png'
    });
  });

  it('uses the same source priority as service tiles', () => {
    expect(
      resolveTabIconSource(
        {
          icon: 'https://example.org/service.png',
          iconName: 'Home',
          svg: 'service'
        },
        false
      )
    ).toEqual({ type: 'named', value: 'Home' });
  });

  it('uses raster image overrides for the active theme mode', () => {
    const configuration = {
      activeIcon: 'https://example.org/service-active-light.png',
      icon: 'https://example.org/service-light.png',
      themeImages: {
        dark: {
          activeIcon: 'https://example.org/service-active-dark.png',
          icon: 'https://example.org/service-dark.png'
        }
      }
    };

    expect(resolveTabIconSource(configuration, false, 'dark')).toEqual({
      type: 'image',
      value: 'https://example.org/service-dark.png'
    });
    expect(resolveTabIconSource(configuration, true, 'dark')).toEqual({
      type: 'image',
      value: 'https://example.org/service-active-dark.png'
    });
  });

  it('uses the themed regular image for focus when no themed active image exists', () => {
    expect(
      resolveTabIconSource(
        {
          activeIcon: 'https://example.org/service-active-light.png',
          icon: 'https://example.org/service-light.png',
          themeImages: {
            dark: { icon: 'https://example.org/service-dark.png' }
          }
        },
        true,
        'dark'
      )
    ).toEqual({
      type: 'image',
      value: 'https://example.org/service-dark.png'
    });
  });

  it('does not let a themed image override a higher-priority named regular icon', () => {
    expect(
      resolveTabIconSource(
        {
          iconName: 'Home',
          themeImages: {
            dark: { icon: 'https://example.org/service-dark.png' }
          }
        },
        true,
        'dark'
      )
    ).toEqual({ type: 'named', value: 'Home' });
  });

  it('ignores empty values', () => {
    expect(resolveTabIconSource({ icon: '  ', svg: ' service ' }, false)).toEqual({
      type: 'svg',
      value: 'service'
    });
    expect(resolveTabIconSource({}, false)).toBeUndefined();
  });
});
