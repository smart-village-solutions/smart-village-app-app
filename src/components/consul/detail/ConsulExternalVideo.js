import PropTypes from 'prop-types';
import React from 'react';

import { openLink } from '../../../helpers';
import { BoldText, RegularText } from '../../Text';
import { Wrapper } from '../../Wrapper';

export const ConsulExternalVideo = ({ videoUrl }) => {
  return (
    <Wrapper>
      <BoldText>Externes Video</BoldText>
      <RegularText primary small onPress={() => openLink(videoUrl)}>
        {videoUrl}
      </RegularText>
    </Wrapper>
  );
};

ConsulExternalVideo.propTypes = {
  videoUrl: PropTypes.string
};
