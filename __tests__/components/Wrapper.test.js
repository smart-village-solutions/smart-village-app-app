jest.setTimeout(30000);
import React from 'react';
import renderer, { act } from 'react-test-renderer';

import {
  InfoBox,
  Wrapper,
  WrapperHorizontal,
  WrapperRow,
  WrapperVertical,
  WrapperWrap
} from '../../src/components';

const renderToJSON = (element) => {
  let component;

  act(() => {
    component = renderer.create(element);
  });

  return component.toJSON();
};

describe('testing Wrapper style component', () => {
  it('renders a default Wrapper', async () => {
    const tree = renderToJSON(<Wrapper />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperHorizontal', () => {
    const tree = renderToJSON(<WrapperHorizontal big />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperVertical', async () => {
    const tree = renderToJSON(<WrapperVertical />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperRow', async () => {
    const tree = renderToJSON(<WrapperRow />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperRow that centers items', async () => {
    const tree = renderToJSON(<WrapperRow center />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperRow that does spaceAround items', async () => {
    const tree = renderToJSON(<WrapperRow spaceAround />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperRow that does spaceBetween items', async () => {
    const tree = renderToJSON(<WrapperRow spaceBetween />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperWrap', async () => {
    const tree = renderToJSON(<WrapperWrap />);
    expect(tree).toMatchSnapshot();
  });

  it('renders InfoBox', async () => {
    const tree = renderToJSON(<InfoBox />);
    expect(tree).toMatchSnapshot();
  });
});
