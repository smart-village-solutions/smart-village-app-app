import { Dimensions } from 'react-native';

import { imageWidth } from '../../src/helpers/imageHelper';

jest.mock('../../src/config/device', () => ({ device: { isTablet: false } }));

afterEach(() => jest.restoreAllMocks());

it('uses the measured safe width for full-width landscape images', () => {
  jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 874, height: 402 });

  expect(imageWidth(true, 750)).toBe(750);
  expect(imageWidth(false, 750)).toBe(402);
  expect(imageWidth(false, 300)).toBe(300);
  expect(imageWidth(true)).toBe(874);
});

it('bounds portrait images without changing window-based callers', () => {
  jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 402, height: 874 });

  expect(imageWidth(true, 370)).toBe(370);
  expect(imageWidth(false, 370)).toBe(370);
  expect(imageWidth(false)).toBe(402);
});
