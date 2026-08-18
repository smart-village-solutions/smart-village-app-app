import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { Link } from '../../src/components';

const renderToJSON = (element) => {
  let component;

  act(() => {
    component = renderer.create(element);
  });

  return component.toJSON();
};

describe('Link', () => {
  const openWebScreen = () => {
    return;
  };

  it('renders a default Link', () => {
    const tree = renderToJSON(<Link description="description" url="url" />);
    expect(tree).toMatchSnapshot();
  });

  it('renders a Link that opens a WebScreen', () => {
    const tree = renderToJSON(
      <Link description="description" url="url" openWebScreen={openWebScreen} />
    );
    expect(tree).toMatchSnapshot();
  });
});
