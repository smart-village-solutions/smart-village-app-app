import React from 'react';
import renderer from 'react-test-renderer';

import { Icon } from '../../src/config';
import { darkColors, lightColors } from '../../src/config/colors';
import { ThemeContext } from '../../src/ThemeContext';

const renderIcon = (component) => {
  let tree;

  renderer.act(() => {
    tree = renderer.create(component);
  });

  return tree;
};

describe('Icon', () => {
  const iconStyle = {
    style: jest.fn()
  };

  it('renders a default Icon', () => {
    const tree = renderIcon(<Icon.EditSetting />);

    expect(tree.toJSON()).not.toBeNull();
    expect(JSON.stringify(tree.toJSON())).toContain(lightColors.primary);
  });

  it('renders an Icon with custom style', () => {
    const tree = renderIcon(<Icon.EditSetting style={iconStyle} />);

    expect(tree.root.findByType('View').props.style).toEqual(iconStyle);
  });

  it('renders an Icon with custom color', () => {
    const tree = renderIcon(<Icon.EditSetting color="#123456" />);

    expect(JSON.stringify(tree.toJSON())).toContain('#123456');
  });

  it('renders a svg Icon', () => {
    expect(renderIcon(<Icon.ArrowDown />).toJSON()).not.toBeNull();
  });

  it('renders stateful tab icons with independent fill and stroke colors', () => {
    const tree = renderIcon(<Icon.Trash fillColor="transparent" strokeColor="#595959" />);
    const svg = tree.root.findByType('RNSVGSvgView');

    expect(svg.props.fill).toBe('transparent');
    expect(svg.props.stroke).toBe('#595959');
  });

  it('does not override the no-fill default of named outline icons', () => {
    const tree = renderIcon(<Icon.BookmarkEmpty color="#00822b" />);
    const svg = tree.root.findByType('RNSVGSvgView');

    expect(svg.props.fill).toBe('none');
    expect(svg.props.stroke).toBe('#00822b');
  });

  it('provides filled and outline bookmark icons for favorite actions', () => {
    expect(renderIcon(<Icon.BookmarkEmpty />).toJSON()).not.toBeNull();
    expect(renderIcon(<Icon.BookmarkFilled />).toJSON()).not.toBeNull();
  });

  it.each([Icon.DrawerMenu, Icon.EditSetting, Icon.Pen])(
    'uses a visible default stroke width for local outline icons',
    (OutlineIcon) => {
      const tree = renderIcon(<OutlineIcon />);

      expect(JSON.stringify(tree.toJSON())).toContain('1.75');
    }
  );

  it.each([Icon.Location, Icon.LocationActive, Icon.OwnLocation])(
    'keeps fill-aware local icons visible when only their outline is enabled',
    (OutlineIcon) => {
      const tree = renderIcon(<OutlineIcon fillColor="transparent" strokeColor="#00822b" />);
      const serializedTree = JSON.stringify(tree.toJSON());

      expect(serializedTree).toContain('transparent');
      expect(serializedTree).toContain('#00822b');
      expect(serializedTree).toContain('"strokeWidth":1');
    }
  );

  it('uses the fill color as the default SVG stroke color', () => {
    const tree = renderIcon(<Icon.About color="#123456" />);

    expect(JSON.stringify(tree.toJSON())).toContain('#123456');
  });

  it('uses the active theme for its default color', () => {
    const tree = renderIcon(
      <ThemeContext.Provider value={{ colors: darkColors, isDark: true, mode: 'dark' }}>
        <Icon.EditSetting />
      </ThemeContext.Provider>
    );

    expect(JSON.stringify(tree.toJSON())).toContain(darkColors.primary);
  });
});
