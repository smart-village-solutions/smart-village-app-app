import PropTypes from 'prop-types';
import React from 'react';

import { texts } from '../../config';
import { HtmlView } from '../HtmlView';
import { Wrapper } from '../Wrapper';

export const TMBNotice = ({ dataProvider, openWebScreen }) => {
  const html = dataProvider?.description?.length ? dataProvider.description : texts.tmb.notice;

  return (
    'Tourismus-Marketing Brandenburg' === dataProvider?.name && (
      <Wrapper>
        <HtmlView html={html} openWebScreen={openWebScreen} />
      </Wrapper>
    )
  );
};

TMBNotice.propTypes = {
  dataProvider: PropTypes.object.isRequired,
  openWebScreen: PropTypes.func.isRequired
};
