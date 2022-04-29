import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';

import { consts, device, texts, normalize } from '../../../config';
import { Title, TitleContainer, TitleShadow } from '../../Title';

import { ConsulCommentListItem } from './ConsulCommentListItem';

const a11yText = consts.a11yLabel;

export const ConsulCommentList = ({ commentCount, commentsData, navigation, refetch, userId }) => {
  commentsData.sort((a, b) => a.id - b.id);

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
          <ConsulCommentListItem commentItem={item} refetch={refetch} navigation={navigation} />
        )}
      />
    </>
  );
};

ConsulCommentList.propTypes = {
  commentCount: PropTypes.number,
  commentsData: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  refetch: PropTypes.func,
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
