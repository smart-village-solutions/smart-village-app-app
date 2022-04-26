import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { Wrapper } from '../../../Wrapper';
import { ConsulCommentListItem } from '../../../consul';
import { Title, TitleContainer, TitleShadow } from '../../../Title';
import { device } from '../../../../config';
import { texts, consts } from '../../../../config';
import { getConsulUser } from '../../../../helpers';

const a11yText = consts.a11yLabel;

export const UserCommentDetail = ({ listData, onRefresh, navigation }) => {
  const [userId, setUserId] = useState();

  const { commentableTitle } = listData.comment;

  useEffect(() => {
    getConsulUser().then((val) => {
      if (val) return setUserId(JSON.parse(val).id);
    });
  }, []);

  listData.comment = { ...listData.comment, userId, userComment: true };

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
          commentItem={listData.comment}
          onRefresh={onRefresh}
          navigation={navigation}
        />
      </Wrapper>
    </>
  );
};

UserCommentDetail.propTypes = {
  listData: PropTypes.object.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  onRefresh: PropTypes.func
};
