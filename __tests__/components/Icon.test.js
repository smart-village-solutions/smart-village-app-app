import React from 'react';
import renderer from 'react-test-renderer';

import { NewIcon } from '../../src/config';

describe('Icon', () => {
  const iconStyle = {
    style: jest.fn()
  };

  it('renders a default Icon', () => {
    const tree = renderer.create(<NewIcon.Close />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders an Icon with custom style', () => {
    const tree = renderer.create(<NewIcon.Close style={iconStyle} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders an Icon with custom color', () => {
    const tree = renderer.create(<NewIcon.Close color="#123456" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a svg Icon', () => {
    // skipping because of `TypeError: Cannot read property 'push' of null`
    const tree = renderer.create(<NewIcon.ArrowDown />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
