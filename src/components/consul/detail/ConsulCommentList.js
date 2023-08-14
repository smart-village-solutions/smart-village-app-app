import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';

import { normalize, texts } from '../../../config';
import { SectionHeader } from '../../SectionHeader';

import { ConsulCommentListItem } from './ConsulCommentListItem';

export const ConsulCommentList = ({ commentCount, commentsData, navigation, refetch, userId }) => {
  commentsData.sort((a, b) => a.id - b.id);

  let comments = getThreadedComments(commentsData, null, userId);

  return (
    <>
      <SectionHeader
        title={`${
          commentCount > 1 ? texts.consul.comments : texts.consul.comment
        } (${commentCount})`}
      />
      <FlatList
        contentContainerStyle={{ padding: normalize(14) }}
        keyboardShouldPersistTaps="handled"
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
