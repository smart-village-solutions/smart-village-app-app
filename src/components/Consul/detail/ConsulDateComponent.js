import PropTypes from 'prop-types';
import React from 'react';

import { RegularText, BoldText } from '../../Text';
import { Wrapper } from '../../Wrapper';
import { momentFormatUtcToLocal } from '../../../helpers';

export const ConsulDateComponent = ({ startsAt, endsAt }) => {
  return (
    <Wrapper>
      <>
        <BoldText>Startdatum</BoldText>
        <RegularText primary small>
          {momentFormatUtcToLocal(startsAt)}
        </RegularText>
      </>
      <>
        <BoldText>Enddatum</BoldText>
        <RegularText primary small>
          {momentFormatUtcToLocal(endsAt)}
        </RegularText>
      </>
    </Wrapper>
  );
};

ConsulDateComponent.propTypes = {
  startsAt: PropTypes.string,
  endsAt: PropTypes.string
};
