import PropTypes from 'prop-types';
import React from 'react';

import { TextList } from './TextList';

export const ImageTextList = ({ navigation, data }) => (
  <TextList navigation={navigation} data={data} leftImage />
);

ImageTextList.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired
};
