import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { consts } from '../config';
import { useTheme } from '../hooks/useTheme';

import { LoadingContainer } from './LoadingContainer';

type Props = {
  loading?: boolean;
};

export const LoadingSpinner = ({ loading }: Props) => {
  const { colors } = useTheme();

  return loading ? (
    <LoadingContainer>
      <View
        accessibilityLabel={consts.a11yLabel.loading}
        accessibilityRole="progressbar"
        accessible
      >
        <ActivityIndicator color={colors.refreshControl} />
      </View>
    </LoadingContainer>
  ) : null;
};
