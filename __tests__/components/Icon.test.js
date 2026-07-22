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

  it('uses the active theme for its default color', () => {
    const tree = renderIcon(
      <ThemeContext.Provider value={{ colors: darkColors, isDark: true, mode: 'dark' }}>
        <Icon.EditSetting />
      </ThemeContext.Provider>
    );

    expect(JSON.stringify(tree.toJSON())).toContain(darkColors.primary);
  });
});
