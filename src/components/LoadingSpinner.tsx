import React from 'react';
import { ActivityIndicator, ViewStyle } from 'react-native';

import { colors } from '../config';

import { LoadingContainer } from './LoadingContainer';

type Props = {
  loading?: boolean;
  containerStyle?: ViewStyle;
};

export const LoadingSpinner = ({ loading, containerStyle }: Props) => {
  return loading ? (
    <LoadingContainer containerStyle={containerStyle}>
      <ActivityIndicator color={colors.refreshControl} />
    </LoadingContainer>
  ) : null;
};
