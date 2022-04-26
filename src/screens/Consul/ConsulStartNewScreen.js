import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';
import React from 'react';

import { QUERY_TYPES } from '../../queries';
import {
  SafeAreaViewFlex,
  NewDebate,
  NewProposal,
  DefaultKeyboardAvoidingView,
  WrapperWithOrientation
} from '../../components';

const getComponent = (query) => {
  switch (query) {
    case QUERY_TYPES.CONSUL.START_DEBATE:
    case QUERY_TYPES.CONSUL.UPDATE_DEBATE:
      return NewDebate;
    case QUERY_TYPES.CONSUL.START_PROPOSAL:
    case QUERY_TYPES.CONSUL.UPDATE_PROPOSAL:
      return NewProposal;
    default:
      null;
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
          <WrapperWithOrientation>
            <Component query={query} navigation={navigation} route={route} data={data} />
          </WrapperWithOrientation>
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

ConsulStartNewScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  route: PropTypes.object
};
