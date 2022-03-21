import PropTypes from 'prop-types';
import React from 'react';
import { View, Text } from 'react-native';

export const DebateDetail = ({ navigation, route, listData }) => {
  return (
    <View>
      <Text>{listData.debate.title}</Text>
    </View>
  );
};

DebateDetail.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  route: PropTypes.object.isRequired,
  listData: PropTypes.object.isRequired
};
