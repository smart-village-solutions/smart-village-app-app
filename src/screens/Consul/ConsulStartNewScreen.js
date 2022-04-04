import PropTypes from 'prop-types';
import React from 'react';

import { QUERY_TYPES } from '../../queries';
import { SafeAreaViewFlex, NewDebate, NewProposal } from '../../components';

const queryType = QUERY_TYPES.CONSUL;

const getComponent = (query) => {
  switch (query) {
    case queryType.START_DEBATE:
    case queryType.UPDATE_DEBATE:
      return NewDebate;
    case queryType.START_PROPOSAL:
    case queryType.UPDATE_PROPOSAL:
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
      <Component query={query} navigation={navigation} route={route} data={data} />
    </SafeAreaViewFlex>
  );
};

ConsulStartNewScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  route: PropTypes.object
};
