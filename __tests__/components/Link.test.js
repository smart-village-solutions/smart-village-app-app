import React from 'react';
import renderer from 'react-test-renderer';

import { Link } from '../../src/components';

describe('Link', () => {
  const openWebScreen = () => {
    return;
  };

  it('renders a default Link', () => {
    const tree = renderer.create(<Link description="description" url="url" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a Link that opens a WebScreen', () => {
    const tree = renderer
      .create(<Link description="description" url="url" openWebScreen={openWebScreen} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
