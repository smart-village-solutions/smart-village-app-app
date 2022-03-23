import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';
import { normalize } from 'react-native-elements';
import { useForm } from 'react-hook-form';

import { Button, Wrapper, WrapperVertical, Title, TitleContainer, TitleShadow } from '../..';
import { device, texts, consts } from '../../../config';
import { Input } from '../form';

import { ConsulCommentListItem } from './ConsulCommentListItem';

const text = texts.consul;
const a11yText = consts.a11yLabel;

export const ConsulCommentList = ({ commentCount, commentsData }) => {
  let comments = getThreadedComments(commentsData);

  // React Hook Form
  const { control, handleSubmit } = useForm();

  const onSubmit = async (val) => {
    // TODO: Mutation Query!
  };

  return (
    <>
      <TitleContainer>
        <Title accessibilityLabel={`(${text.comments}) ${a11yText.heading}`}>
          {commentCount > 1 ? text.comments : text.comment} ({commentCount})
        </Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}

      {/* Comment List! */}
      <FlatList
        contentContainerStyle={{ padding: normalize(14) }}
        data={comments}
        renderItem={(item, index) => <ConsulCommentListItem item={item} index={index} />}
      />

      {/* New Comment Input! */}
      <Wrapper>
        <Input
          name="comment"
          label={text.commentLabel}
          placeholder={text.comment}
          autoCapitalize="none"
          rules={{ required: text.commentEmptyError }}
          control={control}
        />
        <WrapperVertical>
          <Button
            onPress={handleSubmit(onSubmit)}
            title={text.commentAnswerButton}
            disabled={false}
          />
        </WrapperVertical>
      </Wrapper>
    </>
  );
};

ConsulCommentList.propTypes = {
  commentsData: PropTypes.array.isRequired,
  commentCount: PropTypes.number
};

// Thanks to : https://stackoverflow.com/questions/58492213/make-object-as-child-according-to-the-parent-id-javascript
function getThreadedComments(data, pid = null) {
  return data.reduce((r, e) => {
    if (e.parentId == pid) {
      const obj = { ...e };
      const responses = getThreadedComments(data, e.id);
      if (responses.length) obj.responses = responses;
      r.push(obj);
    }
    return r;
  }, []);
}
