type AutocompleteKeyboardMarginBottomParams = {
  keyboardHeight: number;
  platform: string;
};

type AutocompleteListContainerHeightParams = {
  height: number | string;
  keyboardHeight: number;
  maxDropdownHeight: number;
};

type AutocompleteMaxDropdownHeightParams = {
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
  maxDropdownHeight
}: AutocompleteListContainerHeightParams) => {
  if (!keyboardHeight || typeof height !== 'number') {
    return height;
  }

  return Math.min(height, maxDropdownHeight);
};

export const getAutocompleteMaxDropdownHeight = ({
  androidMaxHeight,
  iosMaxHeight,
  platform
}: AutocompleteMaxDropdownHeightParams) => (platform === 'ios' ? iosMaxHeight : androidMaxHeight);
