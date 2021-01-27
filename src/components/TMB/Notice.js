import PropTypes from 'prop-types';
import React from 'react';

import { texts } from '../../config';
import { HtmlView } from '../HtmlView';
import { Wrapper } from '../Wrapper';

export const TMBNotice = ({ dataProvider, openWebScreen }) =>
  'Tourismus-Marketing Brandenburg' === dataProvider?.name && (
    <Wrapper>
      <HtmlView html={texts.tmb.notice} openWebScreen={openWebScreen} />
    </Wrapper>
  );

TMBNotice.propTypes = {
  dataProvider: PropTypes.object.isRequired,
  openWebScreen: PropTypes.func.isRequired
};
