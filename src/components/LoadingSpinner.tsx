import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { colors } from '../config';

type Props = {
  loading?: boolean;
};

export const LoadingSpinner = ({ loading }: Props) => {
  if (!loading) return null;

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color={colors.refreshControl} />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

// below is the old code, needed for the app 
// the above is temporary for the new map

// import React from 'react';
// import { ActivityIndicator } from 'react-native';

// import { colors } from '../config';

// import { LoadingContainer } from './LoadingContainer';

// type Props = {
//   loading?: boolean;
// };

// export const LoadingSpinner = ({ loading }: Props) => {
//   return loading ? (
//     <LoadingContainer>
//       <ActivityIndicator color={colors.refreshControl} />
//     </LoadingContainer>
//   ) : null;
// };
