import PropTypes from 'prop-types';
import React from 'react';

import { HtmlView } from './HtmlView';
import { Wrapper } from './Wrapper';

export const DataProviderNotice = ({ dataProvider, openWebScreen }) => {
  const html = dataProvider?.notice;

  if (!html?.length) {
    return null;
  }

  return (
    <Wrapper>
      <HtmlView html={html} openWebScreen={openWebScreen} />
    </Wrapper>
  );
};

DataProviderNotice.propTypes = {
  dataProvider: PropTypes.object.isRequired,
  openWebScreen: PropTypes.func.isRequired
};
