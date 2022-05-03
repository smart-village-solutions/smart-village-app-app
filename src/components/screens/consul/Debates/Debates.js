import PropTypes from 'prop-types';
import React from 'react';

import { ListComponent } from '../../../ListComponent';
import { QUERY_TYPES } from '../../../../queries';
import { texts } from '../../../../config';
import { Wrapper } from '../../../Wrapper';
import { ScreenName } from '../../../../types';
import { Button } from '../../../Button';
import { EmptyMessage } from '../../../EmptyMessage';

export const Debates = ({ navigation, query, data, refreshControl, myContent }) => {
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
                title: texts.consul.startNew.newDebateStartButtonLabel,
                query: QUERY_TYPES.CONSUL.START_DEBATE
              })
            }
            title={texts.consul.startNew.newDebateStartButtonLabel}
          />
        </Wrapper>
      )}
    </>
  );
};

Debates.propTypes = {
  data: PropTypes.array.isRequired,
  myContent: PropTypes.bool,
  navigation: PropTypes.object.isRequired,
  query: PropTypes.string.isRequired,
  refreshControl: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
