import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { IconUrl, colorizeSvg } from '../../src/config/icons/IconUrl';
import { lightColors } from '../../src/config/colors';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';
import { ThemeContext } from '../../src/ThemeContext';

const iconUrlTree = (
  component: React.ReactNode,
  svgFolderUrl?: string,
  primary = lightColors.primary
) => (
  <ThemeContext.Provider
    value={{
      colors: { ...lightColors, primary },
      isDark: primary !== lightColors.primary,
      mode: primary === lightColors.primary ? 'light' : 'dark'
    }}
  >
    <SettingsContext.Provider
      value={{
        ...initialContext,
        globalSettings: {
          ...initialContext.globalSettings,
          settings: {
            icons: { svgFolderUrl }
          }
        }
      }}
    >
      {component}
    </SettingsContext.Provider>
  </ThemeContext.Provider>
);

const renderIconUrl = (component: React.ReactNode, svgFolderUrl?: string, primary?: string) =>
  render(iconUrlTree(component, svgFolderUrl, primary));

describe('IconUrl', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('colorizes black SVG fill and stroke values without changing other colors', () => {
    const svg =
      '<svg><path fill="#000" stroke="black"/><style>.accent{stroke:#000000;fill:#f00}</style></svg>';

    expect(colorizeSvg(svg, '#123456', '#654321')).toBe(
      '<svg><path fill="#123456" stroke="#654321"/><style>.accent{stroke:#654321;fill:#f00}</style></svg>'
    );
  });

  it('replaces arbitrary solid fill and stroke colors for monochrome SVGs', () => {
    const svg =
      '<svg><path fill="#d6492a" stroke="rgb(214, 73, 42)"/><path fill="none" stroke="url(#gradient)"/><style>.accent{fill:red;stroke:transparent}</style></svg>';

    expect(
      colorizeSvg(svg, '#123456', '#654321', {
        replaceAllColors: true
      })
    ).toBe(
      '<svg><path fill="#123456" stroke="#654321"/><path fill="none" stroke="url(#gradient)"/><style>.accent{fill:#123456;stroke:transparent}</style></svg>'
    );
  });

  it('renders a fallback immediately when an icon URI cannot be resolved', () => {
    const { getByText } = renderIconUrl(
      <IconUrl fallback={<Text>fallback icon</Text>} iconName="missing" />
    );

    expect(getByText('fallback icon')).toBeTruthy();
  });

  it('renders a fallback when the remote SVG request fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 404 } as Response);

    const { getByText } = renderIconUrl(
      <IconUrl fallback={<Text>fallback icon</Text>} iconName="missing" />,
      'https://example.com/icons'
    );

    await waitFor(() => expect(getByText('fallback icon')).toBeTruthy());
  });

  it('fetches and renders a valid remote SVG only once', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '<svg viewBox="0 0 24 24"><path fill="#000000" d="M0 0h24v24H0z"/></svg>'
    } as Response);

    const { toJSON } = renderIconUrl(
      <IconUrl color="#123456" iconName="sample" />,
      'https://example.com/icons'
    );

    await waitFor(() => expect(JSON.stringify(toJSON())).toContain('#123456'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('loads a complete SVG URL without requiring an SVG folder setting', async () => {
    const iconUrl = 'https://example.org/service.svg';
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '<svg viewBox="0 0 24 24"><path fill="currentColor" /></svg>'
    } as Response);

    const { toJSON } = renderIconUrl(<IconUrl color="#123456" iconName={iconUrl} />);

    await waitFor(() => expect(JSON.stringify(toJSON())).toContain('#123456'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      iconUrl,
      expect.objectContaining({ signal: expect.anything() })
    );
  });

  it('recolors a loaded SVG when the theme primary color changes without refetching it', async () => {
    const svgFolderUrl = 'https://example.com/icons';
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        '<svg viewBox="0 0 24 24"><path fill="#d6492a" stroke="#d6492a" d="M0 0h24v24H0z"/></svg>'
    } as Response);
    const component = <IconUrl iconName="sample" isMonochrome />;
    const { rerender, toJSON } = renderIconUrl(component, svgFolderUrl, '#000000');

    await waitFor(() => expect(JSON.stringify(toJSON())).toContain('#000000'));

    rerender(iconUrlTree(component, svgFolderUrl, '#FFFFFF'));

    await waitFor(() => expect(JSON.stringify(toJSON())).toContain('#FFFFFF'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
