import React from 'react';
import renderer from 'react-test-renderer';

import { Icon } from '../../src/components';

describe('Icon', () => {
  const iconStyle = {
    style: jest.fn()
  };

  it('renders a default Icon', () => {
    const tree = renderer.create(<Icon name="name" />);
    expect(tree).toMatchSnapshot();
  });

  it('renders a focused Icon', () => {
    const tree = renderer.create(<Icon name="name" focused={true} />);
    expect(tree).toMatchSnapshot();
  });

  it('renders an Icon with custom style', () => {
    const tree = renderer.create(<Icon name="name" iconStyle={iconStyle} />);
    expect(tree).toMatchSnapshot();
  });

  it('renders an Icon with custom color', () => {
    const tree = renderer.create(<Icon name="name" iconColor="iconColor" />);
    expect(tree).toMatchSnapshot();
  });

  test.skip('renders a svg Icon', () => {
    const tree = renderer.create(<Icon xml="xml" />);
    expect(tree).toMatchSnapshot();
  });
});
