/* eslint-disable react/prop-types */
import React from 'react';
import { render } from '@testing-library/react-native';

import { SliderFilter } from '../../src/components/filter/SliderFilter';
import { lightColors } from '../../src/config/colors';
import { ThemeContext } from '../../src/ThemeContext';

const mockSlider = jest.fn();

jest.mock('react-native-elements', () => ({
  Slider: (props) => {
    const { View } = require('react-native');

    mockSlider(props);

    return <View testID="slider" />;
  }
}));

describe('SliderFilter', () => {
  beforeEach(() => {
    mockSlider.mockReset();
  });

  it('renders visible themed colors for both parts of the slider track', () => {
    render(
      <ThemeContext.Provider value={{ colors: lightColors, isDark: false, mode: 'light' }}>
        <SliderFilter values={[1, 5, 10, 20, 50, 100]} />
      </ThemeContext.Provider>
    );

    expect(mockSlider).toHaveBeenCalledWith(
      expect.objectContaining({
        maximumTrackTintColor: lightColors.gray40,
        minimumTrackTintColor: lightColors.primary
      })
    );
  });
});
