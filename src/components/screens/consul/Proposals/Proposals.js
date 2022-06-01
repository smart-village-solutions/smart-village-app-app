import PropTypes from 'prop-types';
import React from 'react';

import { texts } from '../../../../config';
import { QUERY_TYPES } from '../../../../queries';
import { ScreenName } from '../../../../types';
import { Button } from '../../../Button';
import { EmptyMessage } from '../../../EmptyMessage';
import { ListComponent } from '../../../ListComponent';
import { Wrapper } from '../../../Wrapper';

export const Proposals = ({ navigation, query, data, refreshControl, myContent }) => {
  return (
    <>
      <ListComponent
        navigation={navigation}
        query={query}
        data={data}
        refreshControl={refreshControl}
        showBackToTop
        ListEmptyComponent={<EmptyMessage title={texts.empty.list} />}
      />

      {!myContent && (
        <Wrapper>
          <Button
            onPress={() =>
              navigation.navigate(ScreenName.ConsulStartNewScreen, {
                title: texts.consul.startNew.newProposalStartButtonLabel,
                query: QUERY_TYPES.CONSUL.START_PROPOSAL
              })
            }
            title={texts.consul.startNew.newProposalStartButtonLabel}
          />
        </Wrapper>
      )}
    </>
  );
};

Proposals.propTypes = {
  data: PropTypes.array.isRequired,
  myContent: PropTypes.bool,
  navigation: PropTypes.object.isRequired,
  query: PropTypes.string.isRequired,
  refreshControl: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
