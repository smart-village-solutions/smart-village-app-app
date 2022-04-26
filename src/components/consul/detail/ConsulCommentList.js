import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';
import { normalize } from 'react-native-elements';

import { Title, TitleContainer, TitleShadow } from '../../Title';
import { device, texts, consts } from '../../../config';

import { ConsulCommentListItem } from './ConsulCommentListItem';

const a11yText = consts.a11yLabel;

export const ConsulCommentList = ({
  commentCount,
  commentsData,
  onRefresh,
  userId,
  navigation
}) => {
  commentsData.sort((a, b) => b.id - a.id);

  let comments = getThreadedComments(commentsData, null, userId);

  return (
    <>
      <TitleContainer>
        <Title accessibilityLabel={`(${texts.consul.comments}) ${a11yText.heading}`}>
          {commentCount > 1 ? texts.consul.comments : texts.consul.comment} ({commentCount})
        </Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}

      <FlatList
        contentContainerStyle={{ padding: normalize(14) }}
        data={comments}
        renderItem={({ item }) => (
          <ConsulCommentListItem commentItem={item} onRefresh={onRefresh} navigation={navigation} />
        )}
      />
    </>
  );
};

ConsulCommentList.propTypes = {
  commentsData: PropTypes.array.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  commentCount: PropTypes.number,
  onRefresh: PropTypes.func,
  userId: PropTypes.string
};

// Thanks to : https://stackoverflow.com/questions/58492213/make-object-as-child-according-to-the-parent-id-javascript
const getThreadedComments = (data, pid = null, userId) => {
  return data.reduce((r, e) => {
    if (e.parentId == pid) {
      const obj = { ...e, userId };
      const responses = getThreadedComments(data, e.id, userId);
      if (responses.length) obj.responses = responses;
      r.push(obj);
    }
    return r;
  }, []);
};
