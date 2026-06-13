type AutocompleteKeyboardMarginBottomParams = {
  keyboardHeight: number;
  platform: string;
};

type AutocompleteListContainerHeightParams = AutocompleteKeyboardMarginBottomParams & {
  height: number | string;
  maxKeyboardHeight: number;
};

type AutocompleteMaxKeyboardHeightParams = {
  androidMaxHeight: number;
  iosMaxHeight: number;
  platform: string;
};

export const getAutocompleteKeyboardMarginBottom = ({
  keyboardHeight,
  platform
}: AutocompleteKeyboardMarginBottomParams) => (platform === 'android' ? 0 : keyboardHeight);

export const getAutocompleteListContainerHeight = ({
  height,
  keyboardHeight,
  maxKeyboardHeight
}: AutocompleteListContainerHeightParams) => {
  if (!keyboardHeight || typeof height !== 'number') {
    return height;
  }

  return Math.min(height, maxKeyboardHeight);
};

export const getAutocompleteMaxKeyboardHeight = ({
  androidMaxHeight,
  iosMaxHeight,
  platform
}: AutocompleteMaxKeyboardHeightParams) => (platform === 'ios' ? iosMaxHeight : androidMaxHeight);
