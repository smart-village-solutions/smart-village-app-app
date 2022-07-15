import PropTypes from 'prop-types';
import React from 'react';

import { Icon, normalize, texts } from '../../config';
import { ScreenName } from '../../types';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow } from '../Wrapper';

export const WhatIsARButton = ({ data, isLoading, navigation, refetch }) => {
  return (
    <Wrapper>
      <Touchable
        onPress={() => navigation.navigate(ScreenName.ARInfo, { data, isLoading, refetch })}
      >
        <WrapperRow spaceBetween>
          <RegularText>{texts.augmentedReality.whatIsAugmentedReality}</RegularText>
          <Icon.ArrowRight size={normalize(20)} />
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
