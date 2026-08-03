import React from 'react';
import renderer, { act } from 'react-test-renderer';

import App from '../App';

const renderToJSON = (element) => {
  let component;

  act(() => {
    component = renderer.create(element);
  });

  return component.toJSON();
};

describe('App', () => {
  it('renders correctly', () => {
    const tree = renderToJSON(<App />);
    expect(tree).toMatchSnapshot();
  });
});
