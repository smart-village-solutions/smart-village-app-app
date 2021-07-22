import React from 'react';
import renderer from 'react-test-renderer';

import { Icon } from '../../src/config';

describe('Icon', () => {
  const iconStyle = {
    style: jest.fn()
  };

  it('renders a default Icon', () => {
    const tree = renderer.create(<Icon.EditSetting />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders an Icon with custom style', () => {
    const tree = renderer.create(<Icon.EditSetting style={iconStyle} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders an Icon with custom color', () => {
    const tree = renderer.create(<Icon.EditSetting color="#123456" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a svg Icon', () => {
    // skipping because of `TypeError: Cannot read property 'push' of null`
    const tree = renderer.create(<Icon.ArrowDown />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
