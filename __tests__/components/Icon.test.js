import React from 'react';
import renderer from 'react-test-renderer';

import { Icon } from '../../src/components';

describe('Icon', () => {
  const iconStyle = {
    style: jest.fn()
  };

  it('renders a default Icon', () => {
    const tree = renderer.create(<Icon name="name" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a focused Icon', () => {
    const tree = renderer.create(<Icon name="name" focused={true} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders an Icon with custom style', () => {
    const tree = renderer.create(<Icon name="name" iconStyle={iconStyle} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders an Icon with custom color', () => {
    const tree = renderer.create(<Icon name="name" iconColor="iconColor" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test.skip('renders a svg Icon', () => {
    const tree = renderer.create(<Icon xml="xml" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
