import {
  getAutocompleteKeyboardMarginBottom,
  getAutocompleteListContainerHeight,
  getAutocompleteMaxKeyboardHeight
} from '../../src/components/waste/autocompleteLayout';

describe('getAutocompleteKeyboardMarginBottom', () => {
  it('does not add keyboard margin on Android because the window is already resized', () => {
    expect(getAutocompleteKeyboardMarginBottom({ keyboardHeight: 320, platform: 'android' })).toBe(
      0
    );
  });

  it('keeps the keyboard margin on iOS', () => {
    expect(getAutocompleteKeyboardMarginBottom({ keyboardHeight: 320, platform: 'ios' })).toBe(320);
  });

  it('limits tall Android lists while the keyboard is visible', () => {
    expect(
      getAutocompleteListContainerHeight({
        height: 600,
        keyboardHeight: 320,
        maxKeyboardHeight: 300,
        platform: 'android'
      })
    ).toBe(300);
  });

  it('keeps short Android lists at their natural height while the keyboard is visible', () => {
    expect(
      getAutocompleteListContainerHeight({
        height: 180,
        keyboardHeight: 320,
        maxKeyboardHeight: 300,
        platform: 'android'
      })
    ).toBe(180);
  });

  it('limits tall iOS lists while the keyboard is visible', () => {
    expect(
      getAutocompleteListContainerHeight({
        height: 600,
        keyboardHeight: 320,
        maxKeyboardHeight: 300,
        platform: 'ios'
      })
    ).toBe(300);
  });

  it('keeps list height unchanged when the keyboard is hidden', () => {
    expect(
      getAutocompleteListContainerHeight({
        height: 600,
        keyboardHeight: 0,
        maxKeyboardHeight: 300,
        platform: 'ios'
      })
    ).toBe(600);
  });

  it('uses a lower max dropdown height on iOS than on Android', () => {
    expect(
      getAutocompleteMaxKeyboardHeight({
        androidMaxHeight: 230,
        iosMaxHeight: 200,
        platform: 'ios'
      })
    ).toBe(200);

    expect(
      getAutocompleteMaxKeyboardHeight({
        androidMaxHeight: 230,
        iosMaxHeight: 200,
        platform: 'android'
      })
    ).toBe(230);
  });
});
