import React from 'react';
import { ActivityIndicator } from 'react-native';

import { colors } from '../config';
import { LoadingContainer } from './LoadingContainer';

type Props = {
  loading?: boolean;
};

export const LoadingSpinner = ({ loading }: Props) => {
  return loading ? (
    <LoadingContainer>
      <ActivityIndicator color={colors.accent} />
    </LoadingContainer>
  ) : null;
};
