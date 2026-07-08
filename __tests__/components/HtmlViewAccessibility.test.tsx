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

  const createModel = () => ({
    extend: (factory: any) => {
      const baseModel = {
        getReactNativeProps: (_tnode: any, preGeneratedProps: Record<string, unknown> = {}) =>
          preGeneratedProps
      };

      return {
        ...baseModel,
        ...(typeof factory === 'function' ? factory(baseModel) : factory)
      };
    }
  });

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

  const MockHTML = (props: {
    customHTMLElementModels?: Record<string, any>;
    renderers?: Record<string, any>;
    source: { html: string };
  }) => {
    const ImgRenderer = props.renderers?.img;
    const matches = Array.from(
      props.source.html.matchAll(/<img[^>]*src="([^"]+)"(?:[^>]*alt="([^"]*)")?[^>]*>/g)
    );
    const listMatches = Array.from(
      props.source.html.matchAll(/<(ul|ol)>([\s\S]*?)<\/\1>/g)
    );

    return ReactLocal.createElement(
      'mock-html',
      props,
      [
        ...matches.map((match, index) =>
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
        ),
        ...listMatches.map((match, index) => {
          const listModel = props.customHTMLElementModels?.[match[1]];
          const items = Array.from(match[2].matchAll(/<li>([\s\S]*?)<\/li>/g)).map((liMatch) => ({
            tagName: 'li',
            children: [{ tagName: 'text', data: liMatch[1] }]
          }));

          const listProps = listModel?.getReactNativeProps?.(
            { tagName: match[1] },
            { native: {} }
          ) || { native: {} };

          return ReactLocal.createElement(
            `mock-${match[1]}`,
            {
              key: `list-${index}`,
              ...(listProps.native || {})
            },
            items.map((item, itemIndex) => {
              const itemModel = props.customHTMLElementModels?.li;
              const itemProps = itemModel?.getReactNativeProps?.(
                { tagName: 'li' },
                { native: {} }
              ) || { native: {} };

              return ReactLocal.createElement(
                'mock-li',
                {
                  key: `li-${itemIndex}`,
                  ...(itemProps.native || {})
                },
                item.children[0].data
              );
            })
          );
        })
      ]
    );
  };

  return {
    __esModule: true,
    default: MockHTML,
    defaultHTMLElementModels: {
      p: createModel(),
      li: createModel(),
      ol: createModel(),
      ul: createModel()
    },
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

  it('marks unordered lists and list items with accessibility semantics', () => {
    const tree = renderWithAct(
      <HtmlView html={'<ul><li>Erster Punkt</li><li>Zweiter Punkt</li></ul>'} />
    );

    const list = tree.root.findByProps({ accessibilityRole: 'list' });
    const items = tree.root.findAll(
      (node) => node.props.accessibilityRole === 'listitem'
    );

    expect(list.props.accessibilityRole).toBe('list');
    expect(list.props.accessible).toBe(false);
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items.every((item) => item.props.accessibilityRole === 'listitem')).toBe(true);
    expect(items.every((item) => item.props.accessible === true)).toBe(true);
  });

  it('hides empty paragraphs from accessibility while keeping them renderable', () => {
    const tree = renderWithAct(<HtmlView html={'<p>&nbsp;</p><p>Inhalt</p>'} />);
    const paragraphModel = tree.root.findByType('mock-html').props.customHTMLElementModels.p;

    const emptyParagraphProps = paragraphModel.getReactNativeProps(
      {
        domNode: {
          children: [{ data: '\u00A0', type: 'text' }],
          name: 'p',
          type: 'tag'
        }
      },
      { native: {} }
    );

    const contentParagraphProps = paragraphModel.getReactNativeProps(
      {
        domNode: {
          children: [{ data: 'Inhalt', type: 'text' }],
          name: 'p',
          type: 'tag'
        }
      },
      { native: {} }
    );

    expect(emptyParagraphProps.native.accessible).toBe(false);
    expect(emptyParagraphProps.native.accessibilityElementsHidden).toBe(true);
    expect(emptyParagraphProps.native.importantForAccessibility).toBe('no-hide-descendants');
    expect(contentParagraphProps.native.accessible).toBeUndefined();
  });

  it('removes whitespace-only text nodes between list items', () => {
    const tree = renderWithAct(
      <HtmlView html={'<ul>\n  <li>Erster Punkt</li>\n  <li>Zweiter Punkt</li>\n</ul>'} />
    );
    const { domVisitors } = tree.root.findByType('mock-html').props;
    const parent = { children: [], name: 'ul', type: 'tag' } as any;
    const whitespaceNode = {
      data: '\n  ',
      next: null,
      parent,
      prev: null,
      type: 'text'
    } as any;
    const contentNode = {
      data: 'Erster Punkt',
      next: null,
      parent,
      prev: whitespaceNode,
      type: 'text'
    } as any;

    whitespaceNode.next = contentNode;
    parent.children = [whitespaceNode, contentNode];

    domVisitors.onText(whitespaceNode);

    expect(parent.children).toEqual([contentNode]);
  });
});
