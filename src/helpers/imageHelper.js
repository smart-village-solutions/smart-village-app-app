import { device } from '../config/device';

// for horizontal CardList the cards are only 70% of the screen width
export const imageWidth = (horizontal = false) => (horizontal ? device.width * 0.7 : device.width);

export const imageHeight = (horizontal = false) => {
  // image aspect ratio is 360x180, so for accurate ratio in our view we need to calculate
  // a factor with our current device with for the image, to set a correct height
  const factor = imageWidth(horizontal) / 360;

  return 180 * factor;
};
