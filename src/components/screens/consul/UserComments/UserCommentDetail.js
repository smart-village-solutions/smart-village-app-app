import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { getConsulUser } from '../../../../helpers';
import { SectionHeader } from '../../../SectionHeader';
import { Wrapper } from '../../../Wrapper';
import { ConsulCommentListItem } from '../../../consul';

export const UserCommentDetail = ({ data, refetch, navigation }) => {
  const [userId, setUserId] = useState();

  const { commentableTitle } = data.comment;

  useEffect(() => {
    getConsulUser().then(setUserId);
  }, []);

  data.comment = { ...data.comment, userId, userComment: true };

  return (
    <>
      <SectionHeader title={commentableTitle} />
      <Wrapper>
        <ConsulCommentListItem
          commentItem={data.comment}
          refetch={refetch}
          navigation={navigation}
        />
      </Wrapper>
    </>
  );
};

UserCommentDetail.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  refetch: PropTypes.func
};
