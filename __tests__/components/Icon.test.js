import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { Icon } from '../../src/config';

describe('Icon', () => {
  const iconStyle = {
    style: jest.fn()
  };

  it('renders a default Icon', () => {
    let component;
    act(() => {
      component = renderer.create(<Icon.EditSetting />);
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders an Icon with custom style', () => {
    let component;
    act(() => {
      component = renderer.create(<Icon.EditSetting style={iconStyle} />);
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders an Icon with custom color', () => {
    let component;
    act(() => {
      component = renderer.create(<Icon.EditSetting color="#123456" />);
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a svg Icon', () => {
    // skipping because of `TypeError: Cannot read property 'push' of null`
    let component;
    act(() => {
      component = renderer.create(<Icon.ArrowDown />);
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
