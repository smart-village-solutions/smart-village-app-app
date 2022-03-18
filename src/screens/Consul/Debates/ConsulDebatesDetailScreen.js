import PropTypes from 'prop-types';
import React from 'react';
import { View, Text } from 'react-native';

export const ConsulDebatesDetailScreen = () => {
  return (
    <View>
      <Text>asd</Text>
    </View>
  );
};

ConsulDebatesDetailScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  route: PropTypes.object
};
