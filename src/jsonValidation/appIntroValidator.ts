import { isArray, isObjectLike, isString } from 'lodash';

import { Initializer, Initializers } from '../helpers';
import { AppIntroSlide } from '../types';

type AppIntroSlideData = {
  image: string;
  title: string;
  text: string;
  onLeaveSlideName?: string;
  onLeaveSlide?: Initializer;
};

const isValidAppIntroSlideData = (json: unknown): json is AppIntroSlideData => {
  if (!isObjectLike(json)) {
    return false;
  }

  const { image, title, text, onLeaveSlide } = json as AppIntroSlideData;

  // the purpose is to filter out slides that have invalid onLeaveSlides in them.
  // that way slides corresponding to features of newer app versions will not be shown.
  const isInitializer = !onLeaveSlide || Object.values(Initializer).includes(onLeaveSlide);

  return isString(image) && isString(title) && isString(text) && isInitializer;
};

export const parseIntroSlides = (json: unknown): AppIntroSlide[] => {
  if (!isArray(json)) {
    return [];
  }

  return json.filter<AppIntroSlideData>(isValidAppIntroSlideData).map((value) => ({
    ...value,
    onLeaveSlideName: value.onLeaveSlide,
    onLeaveSlide: value.onLeaveSlide ? Initializers[value.onLeaveSlide] : undefined
  }));
};
