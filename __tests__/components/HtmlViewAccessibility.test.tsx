import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('@native-html/iframe-plugin', () => ({
  __esModule: true,
  default: () => null,
  iframeModel: {}
}));

jest.mock('@native-html/table-plugin', () => ({
  __esModule: true,
  default: () => null,
  cssRulesFromSpecs: () => '',
  defaultTableStylesSpecs: {},
  tableModel: {}
}));

jest.mock('react-native-webview', () => ({
  WebView: () => null
}));

jest.mock('../../src/AccessibilityProvider', () => {
  const ReactLocal = require('react');

  return {
    AccessibilityContext: ReactLocal.createContext({
      isBoldTextEnabled: false,
      textScaleMultiplier: 1
    })
  };
});

jest.mock('../../src/config', () => ({
  colors: {
    darkText: '#111111',
    lightestText: '#ffffff',
    primary: '#2288cc'
  },
  consts: {
    DIMENSIONS: {
      FULL_SCREEN_MAX_WIDTH: 504
    },
    HTML_REGEX: /<[^>]+>/,
    a11yLabel: {
      image: '(Bild)'
    }
  },
  normalize: (value: number) => value,
  styles: {
    baseFontStyle: {},
    html: {},
    htmlBoldTextEnabled: {}
  }
}));

jest.mock('../../src/helpers', () => ({
  imageWidth: () => 320,
  openLink: jest.fn()
}));

jest.mock('../../src/components/Text', () => ({
  RegularText: ({ children }) => children
}));

jest.mock('react-native-render-html', () => {
  const ReactLocal = require('react');

  const IMGElement = (props: Record<string, unknown>) =>
    ReactLocal.createElement('mock-img-element', {
      ...props,
      ...(props.containerProps as Record<string, unknown>)
    });

  const useIMGElementProps = (props: { tnode: { attributes: Record<string, string> } }) => ({
    alt: props.tnode.attributes.alt,
    containerProps: { testID: 'img-container' },
    source: { uri: props.tnode.attributes.src },
    style: {},
    testID: 'img',
    contentWidth: 320,
    computeMaxWidth: (width: number) => width
  });

  const MockHTML = (props: { renderers?: Record<string, any>; source: { html: string } }) => {
    const ImgRenderer = props.renderers?.img;
    const matches = Array.from(
      props.source.html.matchAll(/<img[^>]*src="([^"]+)"(?:[^>]*alt="([^"]*)")?[^>]*>/g)
    );

    return ReactLocal.createElement(
      'mock-html',
      props,
      matches.map((match, index) =>
        ImgRenderer
          ? ReactLocal.createElement(ImgRenderer, {
              key: `${match[1]}-${index}`,
              tnode: {
                attributes: {
                  src: match[1],
                  ...(match[2] !== undefined ? { alt: match[2] } : {})
                },
                styles: {
                  nativeTextFlow: { color: '#111111' },
                  webBlockRet: {}
                }
              }
            })
          : null
      )
    );
  };

  return {
    __esModule: true,
    default: MockHTML,
    IMGElement,
    useIMGElementProps
  };
});

import { HtmlView } from '../../src/components/HtmlView';

const renderWithAct = (component: React.ReactElement) => {
  let testRenderer: renderer.ReactTestRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(component);
  });

  return testRenderer!;
};

describe('HtmlView accessibility', () => {
  it('maps image alt text to an accessible image element', () => {
    const tree = renderWithAct(
      <HtmlView html={'<p>Text</p><img src="https://example.com/logo.png" alt="Logo des MID">'} />
    );

    const image = tree.root.findByType('mock-img-element');

    expect(image.props.accessible).toBe(true);
    expect(image.props.accessibilityRole).toBe('image');
    expect(image.props.accessibilityLabel).toBe('Logo des MID');
  });

  it('falls back to a generic image label when alt text is missing', () => {
    const tree = renderWithAct(<HtmlView html={'<img src="https://example.com/logo.png">'} />);

    const image = tree.root.findByType('mock-img-element');

    expect(image.props.accessible).toBe(true);
    expect(image.props.accessibilityRole).toBe('image');
    expect(image.props.accessibilityLabel).toBe('(Bild)');
  });
});
