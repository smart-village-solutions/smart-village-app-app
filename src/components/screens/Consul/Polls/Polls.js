import PropTypes from 'prop-types';
import React from 'react';

// import { ConsulStartNewButton } from '../../../Consul';
import { ListComponent } from '../../../ListComponent';
// import { QUERY_TYPES } from '../../../../queries';
// import { texts } from '../../../../config';

// const text = texts.consul;

export const Polls = ({ navigation, query, listData, refreshControl }) => {
  return (
    <>
      <ListComponent
        navigation={navigation}
        query={query}
        data={listData}
        refreshControl={refreshControl}
        showBackToTop
      />
      {/* <ConsulStartNewButton
        title={text.startNew.newProposalStartButtonLabel}
        query={QUERY_TYPES.CONSUL.START_PROPOSAL}
        navigation={navigation}
        buttonTitle={text.startNew.newProposalStartButtonLabel}
      /> */}
    </>
  );
};

Polls.propTypes = {
  listData: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  query: PropTypes.string.isRequired,
  route: PropTypes.object.isRequired,
  refreshControl: PropTypes.object.isRequired
};
