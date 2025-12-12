import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView } from 'react-native';

import {
  DefaultKeyboardAvoidingView,
  NewDebate,
  NewProposal,
  SafeAreaViewFlex
} from '../../components';
import { QUERY_TYPES } from '../../queries';

const getComponent = (query) => {
  switch (query) {
    case QUERY_TYPES.CONSUL.START_DEBATE:
    case QUERY_TYPES.CONSUL.UPDATE_DEBATE:
      return NewDebate;
    case QUERY_TYPES.CONSUL.START_PROPOSAL:
    case QUERY_TYPES.CONSUL.UPDATE_PROPOSAL:
      return NewProposal;
    default:
      return null;
  }
};

export const ConsulStartNewScreen = ({ navigation, route }) => {
  const query = route.params?.query ?? '';
  const data = route.params?.data ?? {};

  const Component = getComponent(query);

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Component query={query} navigation={navigation} route={route} data={data} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

ConsulStartNewScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object
};
