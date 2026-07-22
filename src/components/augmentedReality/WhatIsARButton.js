import PropTypes from 'prop-types';
import React from 'react';

import { Icon, normalize, texts } from '../../config';
import { ScreenName } from '../../types';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow } from '../Wrapper';
import { useTheme } from '../../hooks/useTheme';

export const WhatIsARButton = ({ data, isLoading, navigation, refetch }) => {
  const { colors } = useTheme();

  return (
    <Wrapper>
      <Touchable
        accessibilityLabel={texts.accessibilityLabels.actions.whatIsAugmentedReality}
        onPress={() => navigation.navigate(ScreenName.ARInfo, { data, isLoading, refetch })}
      >
        <WrapperRow spaceBetween>
          <RegularText>{texts.augmentedReality.whatIsAugmentedReality}</RegularText>
          <Icon.ArrowRight color={colors.darkText} size={normalize(18)} />
        </WrapperRow>
      </Touchable>
    </Wrapper>
  );
};

WhatIsARButton.propTypes = {
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  navigation: PropTypes.object,
  refetch: PropTypes.func
};
