jest.setTimeout(30000);
import React from 'react';
import { View } from 'react-native';
import renderer from 'react-test-renderer';

import {
  Wrapper,
  WrapperHorizontal,
  WrapperVertical,
  WrapperLandscape,
  WrapperRow,
  WrapperWrap,
  InfoBox,
  WrapperWithOrientation
} from '../../src/components';

describe('testing Wrapper style component', () => {
  it('renders a default Wrapper', async () => {
    const tree = renderer.create(<Wrapper />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperHorizontal', () => {
    const tree = renderer.create(<WrapperHorizontal big />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperVertical', async () => {
    const tree = renderer.create(<WrapperVertical />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperLandscape', async () => {
    const tree = renderer.create(<WrapperLandscape noFlex />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperRow', async () => {
    const tree = renderer.create(<WrapperRow />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperRow that centers items', async () => {
    const tree = renderer.create(<WrapperRow center />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperRow that does spaceAround items', async () => {
    const tree = renderer.create(<WrapperRow spaceAround />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperRow that does spaceBetween items', async () => {
    const tree = renderer.create(<WrapperRow spaceBetween />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperWrap', async () => {
    const tree = renderer.create(<WrapperWrap />);
    expect(tree).toMatchSnapshot();
  });

  it('renders InfoBox', async () => {
    const tree = renderer.create(<InfoBox />);
    expect(tree).toMatchSnapshot();
  });

  it('renders WrapperWithOrientation', async () => {
    const tree = renderer.create(
      <WrapperWithOrientation needLandscapeWrapper>
        <View></View>
      </WrapperWithOrientation>
    );
    expect(tree).toMatchSnapshot();
  });
});
