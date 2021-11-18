import { isArray, isObjectLike, isString } from 'lodash';

import { Initializer, Initializers } from '../helpers/initializationHelper';
import { AppIntroSlide } from '../types';

type AppIntroSlideData = {
  image: string;
  title: string;
  text: string;
  onLeaveSlide?: Initializer;
};

const isValidAppIntroSlideData = (json: unknown): json is AppIntroSlideData => {
  if (!isObjectLike(json)) {
    return false;
  }

  const { image, title, text, onLeaveSlide } = json as AppIntroSlideData;

  const isInitializer = !onLeaveSlide || Object.values(Initializer).includes(onLeaveSlide);

  return isString(image) && isString(title) && isString(text) && isInitializer;
};

export const parseIntroSlides = (json: unknown): AppIntroSlide[] => {
  if (!isArray(json)) {
    return [];
  }

  return json.filter<AppIntroSlideData>(isValidAppIntroSlideData).map((value) => ({
    ...value,
    onLeaveSlide: value.onLeaveSlide ? Initializers[value.onLeaveSlide] : undefined
  }));
};
