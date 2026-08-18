import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { IconUrl, colorizeSvg } from '../../src/config/icons/IconUrl';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';

const renderIconUrl = (component: React.ReactNode, svgFolderUrl?: string) =>
  render(
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
  );

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
});
