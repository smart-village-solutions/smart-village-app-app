import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import renderer from 'react-test-renderer';

import { Disturber } from '../../src/components/Disturber';
import { ImagesCarousel } from '../../src/components/ImagesCarousel';
import { Wrapper } from '../../src/components/Wrapper';
import { readFromStore } from '../../src/helpers';

jest.mock('../../src/config', () => ({
  Icon: { Close: () => null },
  normalize: (value: number) => value,
  texts: { accessibilityLabels: { actions: { close: 'Close' } } }
}));
jest.mock('../../src/helpers', () => ({
  ...jest.requireActual('../../src/helpers/appDesignSystemHelper'),
  addToStore: jest.fn(),
  findClosestItem: (items: unknown[]) => items[0],
  isActive: () => true,
  readFromStore: jest.fn().mockResolvedValue(null)
}));
jest.mock('../../src/hooks', () => ({
  useHomeRefresh: jest.fn(),
  useStaticContent: () => ({ data: mockData, refetch: jest.fn() })
}));
jest.mock('../../src/components/ImagesCarousel', () => ({ ImagesCarousel: () => null }));
jest.mock('../../src/components/Button', () => ({ Button: () => null }));
jest.mock('../../src/components/Text', () => ({
  HeadlineText: () => null,
  RegularText: () => null
}));

let mockData: object[];
const navigation = { navigate: jest.fn() };

const renderDisturber = async () => {
  let tree: renderer.ReactTestRenderer;
  await renderer.act(async () => {
    tree = renderer.create(
      <Disturber navigation={navigation as never} publicJsonFile="homeDisturber" />
    );
  });
  return tree!;
};

describe('Disturber layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(readFromStore).mockResolvedValue(null);
  });

  it('keeps the standard 16 inset and omits absent description and button sections', async () => {
    mockData = [{ id: 1, headline: 'New', title: 'Welcome' }];
    const tree = await renderDisturber();
    const wrappers = tree.root.findAllByType(Wrapper);

    expect(wrappers).toHaveLength(3);
    expect(StyleSheet.flatten(tree.root.findAllByType(View)[0].props.style)).toEqual({
      paddingBottom: 16,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 16
    });
    expect(wrappers[1].props.noPaddingTop).toBeUndefined();
    expect(wrappers[2].props.noPaddingTop).toBe(true);
  });

  it.each([
    { title: 'Title' },
    { description: 'Description' },
    { button: { title: 'Open', navigationTo: 'Web', params: { webUrl: 'https://example.com' } } }
  ])('retains top padding when the first visible content is %j', async (content) => {
    mockData = [{ id: 1, ...content }];
    const tree = await renderDisturber();
    const wrappers = tree.root.findAllByType(Wrapper);

    expect(wrappers).toHaveLength(2);
    expect(wrappers[1].props.noPaddingTop).toBe(false);
  });

  it('preserves image-only cards without an empty content section', async () => {
    mockData = [{ id: 1, pictures: [{ picture: { uri: 'image.png' } }] }];
    const tree = await renderDisturber();

    expect(tree.root.findAllByType(Wrapper)).toHaveLength(1);
    expect(tree.root.findByType(ImagesCarousel).props.data).toEqual(
      (mockData[0] as { pictures: unknown[] }).pictures
    );
    expect(
      StyleSheet.flatten(tree.root.findByType(ImagesCarousel).parent!.props.style)
    ).toMatchObject({
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8
    });
  });

  it('removes its outer spacing when dismissed', async () => {
    mockData = [{ id: 1, title: 'Welcome' }];
    const tree = await renderDisturber();

    await renderer.act(async () => {
      tree.root.findByType(TouchableOpacity).props.onPress();
    });
    expect(tree.toJSON()).toBeNull();
  });

  it('occupies no space when already dismissed or when no active content exists', async () => {
    mockData = [{ id: 1, title: 'Welcome' }];
    jest.mocked(readFromStore).mockResolvedValue('1');
    const dismissed = await renderDisturber();
    expect(dismissed.toJSON()).toBeNull();

    mockData = [];
    const empty = await renderDisturber();
    expect(empty.toJSON()).toBeNull();
  });
});
