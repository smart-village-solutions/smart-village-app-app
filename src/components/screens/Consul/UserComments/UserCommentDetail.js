import PropTypes from 'prop-types';
import React from 'react';

import { Wrapper } from '../../../Wrapper';
import { ConsulCommentListItem } from '../../../Consul/detail/ConsulCommentListItem';

/* NOTE: we need to check a lot for presence, so this is that complex */
export const UserCommentDetail = ({ listData, onRefresh }) => {
  return (
    <Wrapper>
      <ConsulCommentListItem item={{ item: listData.comment }} onRefresh={onRefresh} />
    </Wrapper>
  );
};

UserCommentDetail.propTypes = {
  listData: PropTypes.object.isRequired,
  onRefresh: PropTypes.func
};
