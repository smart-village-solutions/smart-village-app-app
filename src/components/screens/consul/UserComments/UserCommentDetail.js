import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { consts, device, texts } from '../../../../config';
import { getConsulUser } from '../../../../helpers';
import { ConsulCommentListItem } from '../../../consul';
import { Title, TitleContainer, TitleShadow } from '../../../Title';
import { Wrapper } from '../../../Wrapper';

const a11yText = consts.a11yLabel;

export const UserCommentDetail = ({ data, refetch, navigation }) => {
  const [userId, setUserId] = useState();

  const { commentableTitle } = data.comment;

  useEffect(() => {
    getConsulUser().then((userInfo) => {
      if (userInfo) return setUserId(JSON.parse(userInfo).id);
    });
  }, []);

  data.comment = { ...data.comment, userId, userComment: true };

  return (
    <>
      <TitleContainer>
        <Title accessibilityLabel={`(${texts.consul.comments}) ${a11yText.heading}`}>
          {commentableTitle}
        </Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}

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
