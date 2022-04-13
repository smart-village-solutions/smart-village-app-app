import PropTypes from 'prop-types';
import React from 'react';

import { SafeAreaViewFlex } from '../../../SafeAreaViewFlex';
import { Wrapper, WrapperWithOrientation } from '../../../Wrapper';
import { ConsulCommentListItem } from '../../../Consul/detail/ConsulCommentListItem';

/* NOTE: we need to check a lot for presence, so this is that complex */
export const UserCommentDetail = ({ listData, onRefresh }) => {
  return (
    <SafeAreaViewFlex>
      <WrapperWithOrientation>
        <Wrapper>
          <ConsulCommentListItem item={{ item: listData.comment }} onRefresh={onRefresh} />
        </Wrapper>
      </WrapperWithOrientation>
    </SafeAreaViewFlex>
  );
};

UserCommentDetail.propTypes = {
  listData: PropTypes.object.isRequired,
  onRefresh: PropTypes.func
};
