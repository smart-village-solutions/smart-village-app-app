import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { consts, texts } from '../config';
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
        accessibilityLabel={texts.defectReport?.wait ?? consts.a11yLabel.loading}
        accessibilityLiveRegion="polite"
        accessibilityRole="progressbar"
        accessibilityState={{ busy: true }}
        accessible
      >
        <ActivityIndicator
          color={colors.refreshControl}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </View>
    </LoadingContainer>
  ) : null;
};
