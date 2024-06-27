import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator } from 'react-native';

import { colors, Icon, normalize } from '../../config';
import { DOWNLOAD_TYPE } from '../../helpers';

export const IconForDownloadType = ({ isListView, downloadType, showOnDetailPage }) => {
  if (showOnDetailPage) {
    return <Icon.ArrowRight color={colors.darkText} size={normalize(18)} />;
  }

  switch (downloadType) {
    case DOWNLOAD_TYPE.DOWNLOADABLE:
      return <Icon.ArrowDownCircle color={colors.primary} size={normalize(16)} />;
    case DOWNLOAD_TYPE.DOWNLOADED:
      if (isListView) {
        return <Icon.CloseCircle color={colors.darkText} size={normalize(16)} />;
      }

      return <Icon.Check color={colors.primary} size={normalize(20)} />;
    default:
      return <ActivityIndicator size="small" color={colors.refreshControl} />;
  }
};

IconForDownloadType.propTypes = {
  isListView: PropTypes.bool,
  downloadType: PropTypes.string.isRequired,
  showOnDetailPage: PropTypes.bool
};
