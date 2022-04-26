import PropTypes from 'prop-types';
import React from 'react';

import { ListComponent } from '../../../ListComponent';
import { QUERY_TYPES } from '../../../../queries';
import { texts } from '../../../../config';
import { Wrapper } from '../../../Wrapper';
import { ScreenName } from '../../../../types';
import { Button } from '../../../Button';

export const Debates = ({ navigation, query, listData, refreshControl, myContent }) => {
  return (
    <>
      <ListComponent
        navigation={navigation}
        query={query}
        data={listData}
        refreshControl={refreshControl}
        showBackToTop
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
  listData: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  query: PropTypes.string.isRequired,
  route: PropTypes.object.isRequired,
  refreshControl: PropTypes.object.isRequired,
  myContent: PropTypes.bool
};
