import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-apollo';

import { momentFormatUtcToLocal } from '../../../helpers';
import { RegularText } from '../../Text';
import { WrapperRow, WrapperVertical } from '../../Wrapper';
import { Button } from '../../Button';
import { Touchable } from '../../Touchable';
import { colors, normalize, texts, Icon } from '../../../config';
import { Input } from '../Form';
import { ConsulClient } from '../../../ConsulClient';
import {
  ADD_REPLY_TO_COMMENT,
  CAST_VOTE_ON_COMMENT,
  DELETE_COMMENT
} from '../../../queries/Consul';

const text = texts.consul;

const deleteCommentAlert = (onDelete) =>
  Alert.alert(text.loginAllFieldsRequiredTitle, text.commentDeleteAlertBody, [
    {
      text: text.abort,
      onPress: () => null,
      style: 'cancel'
    },
    {
      text: text.delete,
      onPress: () => onDelete(),
      style: 'destructive'
    }
  ]);

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const ConsulCommentListItem = ({ item, onRefresh, replyList }) => {
  const [responseShow, setResponseShow] = useState(false);
  const [reply, setReply] = useState(false);
  const [loading, setLoading] = useState(false);

  // React Hook Form
  const { control, handleSubmit, reset } = useForm();

  // GraphQL
  const [addReplyToComment] = useMutation(ADD_REPLY_TO_COMMENT, {
    client: ConsulClient
  });
  const [castVoteOnComment] = useMutation(CAST_VOTE_ON_COMMENT, {
    client: ConsulClient
  });
  const [deleteComment] = useMutation(DELETE_COMMENT, {
    client: ConsulClient
  });

  const {
    body,
    cachedVotesDown,
    cachedVotesTotal,
    cachedVotesUp,
    id,
    publicAuthor,
    publicCreatedAt,
    responses,
    votesFor,
    userId
  } = item.item;

  const commentUserId = publicAuthor ? publicAuthor.id : null;

  const onSubmit = async (val) => {
    setLoading(true);
    await addReplyToComment({ variables: { commentId: id, body: val.comment } })
      .then(() => {
        onRefresh();
        setLoading(false);
        setReply(false);
        setResponseShow(true);
        reset({ comment: null });
      })
      .catch((err) => console.error(err));
  };

  const onVotingToComment = async (UpDown) => {
    await castVoteOnComment({ variables: { commentId: id, vote: UpDown } })
      .then(() => {
        onRefresh();
      })
      .catch((err) => console.error(err));
  };

  const onDelete = async () => {
    await deleteComment({ variables: { id: id } })
      .then(() => onRefresh())
      .catch((err) => console.error(err));
  };

  return (
    <View style={[!replyList && styles.container]}>
      <WrapperRow>
        <RegularText primary>{publicAuthor ? publicAuthor.username : 'Privat'}</RegularText>
        <RegularText> · </RegularText>
        <RegularText smallest>{momentFormatUtcToLocal(publicCreatedAt)}</RegularText>
      </WrapperRow>

      <RegularText>{body}</RegularText>

      {/* Below Comment! */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomLine}>
          {/* Reply Section */}
          {responses && responses.length > 0 ? (
            responseShow ? (
              <Icon.ArrowUp size={normalize(16)} color={colors.primary} />
            ) : (
              <Icon.ArrowDown size={normalize(16)} color={colors.primary} />
            )
          ) : null}
          <>
            {responses && responses.length > 0 ? (
              <Touchable onPress={() => setResponseShow(!responseShow)}>
                <RegularText primary smallest>
                  {responses.length} {responseShow ? text.answer : text.return}
                  {responseShow ? ` (${text.collapse})` : ` (${text.show})`}
                </RegularText>
              </Touchable>
            ) : (
              <RegularText smallest>{text.noReturn}</RegularText>
            )}
          </>

          <Space />

          {/* Delete Button */}
          {commentUserId === userId && (
            <>
              <Touchable onPress={() => deleteCommentAlert(onDelete)} style={styles.deleteButton}>
                <Icon.Trash size={normalize(12)} color={colors.error} />
                <RegularText error smallest>
                  {` ${text.delete}`}
                </RegularText>
              </Touchable>

              <Space />
            </>
          )}

          {/* Reply Button! */}
          <Touchable onPress={() => setReply(!reply)}>
            <RegularText primary smallest>
              {text.answer}
            </RegularText>
          </Touchable>
        </View>

        <View style={styles.bottomLine}>
          {/* Vote for Commit! */}
          <WrapperRow>
            {cachedVotesTotal > 0 ? (
              <RegularText smallest>
                {cachedVotesTotal} {text.votes}
              </RegularText>
            ) : (
              <RegularText smallest>{text.noVotes}</RegularText>
            )}

            {/* Comment like disslike buttons */}
            <LikeDissLikeIcon
              color={
                votesFor.nodes[0]?.voteFlag !== undefined && votesFor.nodes[0]?.voteFlag
                  ? colors.primary
                  : colors.darkText
              }
              like
              cachedVotesUp={cachedVotesUp}
              onPress={() => onVotingToComment('up')}
            />

            <LikeDissLikeIcon
              color={
                votesFor.nodes[0]?.voteFlag !== undefined && !votesFor.nodes[0]?.voteFlag
                  ? colors.error
                  : colors.darkText
              }
              disslike
              cachedVotesDown={cachedVotesDown}
              onPress={() => onVotingToComment('down')}
            />
          </WrapperRow>
        </View>
      </View>

      {/* Reply List! */}
      {responseShow && responses && responses.length
        ? responses.map((item, index) => (
            <View key={index} style={styles.replyContainer}>
              <ConsulCommentListItem
                index={index}
                item={{ item: item }}
                onRefresh={onRefresh}
                replyList={true}
              />
            </View>
          ))
        : null}

      {/* New Reply Comment Input! */}
      {reply ? (
        <>
          <Input
            multiline
            minHeight={50}
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
              title={loading ? text.submittingCommentButton : text.commentAnswerButton}
              disabled={loading}
            />
          </WrapperVertical>
        </>
      ) : null}
    </View>
  );
};
/* eslint-enable complexity */

const LikeDissLikeIcon = ({ cachedVotesUp, cachedVotesDown, like, disslike, onPress, color }) => {
  return (
    <Touchable onPress={onPress} style={styles.iconButton}>
      <Icon.Like
        color={color}
        style={[styles.icon, { transform: disslike && [{ rotateX: '180deg' }] }]}
        size={normalize(16)}
      />
      <RegularText smallest>{like ? cachedVotesUp : cachedVotesDown}</RegularText>
    </Touchable>
  );
};

const Space = () => {
  return <RegularText smallest> | </RegularText>;
};

ConsulCommentListItem.propTypes = {
  item: PropTypes.object.isRequired,
  onRefresh: PropTypes.func,
  replyList: PropTypes.bool,
  userId: PropTypes.string
};

LikeDissLikeIcon.propTypes = {
  like: PropTypes.bool,
  disslike: PropTypes.bool,
  cachedVotesDown: PropTypes.number,
  cachedVotesUp: PropTypes.number,
  onPress: PropTypes.func,
  color: PropTypes.string
};

const styles = StyleSheet.create({
  container: {
    marginTop: normalize(10)
  },
  bottomContainer: {
    borderBottomWidth: 0.5,
    borderColor: colors.darkText,
    paddingVertical: 5
  },
  bottomLine: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: normalize(10),
    alignItems: 'center'
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  replyContainer: {
    borderLeftWidth: 0.5,
    paddingLeft: normalize(10),
    marginTop: normalize(10),
    borderStyle: 'solid',
    borderColor: colors.borderRgba
  },
  icon: {
    paddingHorizontal: 5
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5
  }
});
