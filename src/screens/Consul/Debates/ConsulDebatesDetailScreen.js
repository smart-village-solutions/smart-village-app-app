import PropTypes from 'prop-types';
import React from 'react';
import { View, Text } from 'react-native';

import { LoadingSpinner } from '../../../components';
import { useConsulData } from '../../../hooks';

export const ConsulDebatesDetailScreen = ({ navigation, route }) => {
  const queryVariables = route.params?.queryVariables ?? {};
  const query = route.params?.query ?? '';

  const { data, refetch, isLoading, isError } = useConsulData({
    query,
    queryVariables
  });

  if (isLoading) return <LoadingSpinner loading />;

  // TODO: If Error true return error component
  if (isError) return <Text>{isError.message}</Text>;

  if (!data) return null;

  return (
    <View>
      <Text>{data.debate.title}</Text>
    </View>
  );
};

ConsulDebatesDetailScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  route: PropTypes.object
};
