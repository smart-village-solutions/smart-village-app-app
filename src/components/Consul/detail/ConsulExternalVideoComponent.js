import PropTypes from 'prop-types';
import React from 'react';

import { RegularText, BoldText } from '../../Text';
import { Wrapper } from '../../Wrapper';
import { openLink } from '../../../helpers';

export const ConsulExternalVideoComponent = ({ videoUrl }) => {
  return (
    <Wrapper>
      <BoldText>Externes Video</BoldText>
      <RegularText primary small onPress={() => openLink(videoUrl)}>
        {videoUrl}
      </RegularText>
    </Wrapper>
  );
};

ConsulExternalVideoComponent.propTypes = {
  videoUrl: PropTypes.string
};
