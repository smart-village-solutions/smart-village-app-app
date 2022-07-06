import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator } from 'react-native';

import { colors, Icon, normalize } from '../../config';
import { DOWNLOAD_TYPE } from '../../helpers';

export const IconForDownloadType = ({ isListView, itemDownloadType, showOnDetailPage }) => {
  if (showOnDetailPage) {
    return <Icon.ArrowRight size={normalize(20)} />;
  }

  switch (itemDownloadType) {
    case DOWNLOAD_TYPE.DOWNLOADABLE:
      return <Icon.ArrowDownCircle color={colors.primary} size={normalize(16)} />;
    case DOWNLOAD_TYPE.DOWNLOADED:
      return isListView ? (
        <Icon.CloseCircle color={colors.darkText} size={normalize(16)} />
      ) : (
        <Icon.Check color={colors.primary} size={normalize(20)} />
      );

    default:
      return <ActivityIndicator size="small" color={colors.accent} />;
  }
};

IconForDownloadType.propTypes = {
  isListView: PropTypes.bool,
  itemDownloadType: PropTypes.string.isRequired,
  showOnDetailPage: PropTypes.bool
};
