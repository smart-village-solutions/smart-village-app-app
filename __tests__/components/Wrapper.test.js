jest.setTimeout(30000);
import React from 'react';
import renderer from 'react-test-renderer';

import {
  InfoBox,
  Wrapper,
  WrapperHorizontal,
  WrapperRow,
  WrapperVertical,
  WrapperWrap
} from '../../src/components';

describe('testing Wrapper style component', () => {
  it('renders a default Wrapper', async () => {
    const tree = renderer.create(<Wrapper />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperHorizontal', () => {
    const tree = renderer.create(<WrapperHorizontal big />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperVertical', async () => {
    const tree = renderer.create(<WrapperVertical />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperRow', async () => {
    const tree = renderer.create(<WrapperRow />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperRow that centers items', async () => {
    const tree = renderer.create(<WrapperRow center />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperRow that does spaceAround items', async () => {
    const tree = renderer.create(<WrapperRow spaceAround />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperRow that does spaceBetween items', async () => {
    const tree = renderer.create(<WrapperRow spaceBetween />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperWrap', async () => {
    const tree = renderer.create(<WrapperWrap />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders InfoBox', async () => {
    const tree = renderer.create(<InfoBox />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
