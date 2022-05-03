import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { useForm } from 'react-hook-form';
import { Alert, StyleSheet, TouchableOpacity, View, Keyboard } from 'react-native';

import { colors, Icon, normalize, texts } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import {
  ADD_REPLY_TO_COMMENT,
  CAST_VOTE_ON_COMMENT,
  DELETE_COMMENT
} from '../../../queries/consul';
import { ScreenName } from '../../../types';
import { Input } from '../../form';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { WrapperRow } from '../../Wrapper';

import { ConsulPublicAuthor } from './ConsulPublicAuthor';

const deleteCommentAlert = (onDelete) =>
  Alert.alert(texts.consul.loginAllFieldsRequiredTitle, texts.consul.commentDeleteAlertBody, [
    {
      text: texts.consul.abort,
      onPress: () => null,
      style: 'cancel'
    },
    {
      text: texts.consul.delete,
      onPress: () => onDelete(),
      style: 'destructive'
    }
  ]);

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const ConsulCommentListItem = ({ commentItem, onRefresh, replyList, navigation }) => {
  const [showResponse, setShowResponse] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      comment: ''
    }
  });

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
    userId,
    userComment
  } = commentItem;

  const commentUserId = publicAuthor?.id;

  const onSubmit = async (replyData) => {
    if (!replyData?.comment) return;

    setIsLoading(true);

    try {
      await addReplyToComment({ variables: { commentId: id, body: replyData.comment } });
      onRefresh();
      setIsLoading(false);
      setShowReply(false);
      setShowResponse(true);
      reset();
      Keyboard.dismiss();
    } catch (error) {
      console.error(error);
    }
  };

  const onVotingToComment = async (UpDown) => {
    try {
      await castVoteOnComment({ variables: { commentId: id, vote: UpDown } });
      onRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  const onDelete = async () => {
    try {
      await deleteComment({ variables: { id } });

      if (userComment) {
        navigation?.navigate(ScreenName.ConsulHomeScreen);
      } else {
        onRefresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={[!replyList && styles.container]}>
      <ConsulPublicAuthor authorData={{ publicAuthor, publicCreatedAt }} />
      <RegularText style={styles.container}>{body}</RegularText>

      <View style={styles.bottomContainer}>
        <View style={styles.bottomLine}>
          {responses && responses.length > 0 ? (
            showResponse ? (
              <Icon.ArrowUp size={normalize(16)} color={colors.primary} />
            ) : (
              <Icon.ArrowDown size={normalize(16)} color={colors.primary} />
            )
          ) : null}
          <>
            {responses && responses.length > 0 ? (
              <Touchable onPress={() => setShowResponse(!showResponse)}>
                <RegularText primary smallest>
                  {responses.length}{' '}
                  {responses.length > 1 ? texts.consul.responses : texts.consul.response}
                  {showResponse ? ` (${texts.consul.collapse})` : ` (${texts.consul.show})`}
                </RegularText>
              </Touchable>
            ) : (
              <RegularText smallest>{texts.consul.noResponse}</RegularText>
            )}
          </>

          <Space />

          {commentUserId === userId && (
            <>
              <Touchable onPress={() => deleteCommentAlert(onDelete)} style={styles.deleteButton}>
                <Icon.Trash size={normalize(12)} color={colors.error} />
                <RegularText error smallest>
                  {` ${texts.consul.delete}`}
                </RegularText>
              </Touchable>

              <Space />
            </>
          )}

          <Touchable onPress={() => setShowReply(!showReply)}>
            <RegularText primary smallest>
              {texts.consul.answer}
            </RegularText>
          </Touchable>
        </View>

        <View style={styles.bottomLine}>
          <WrapperRow>
            <RegularText small>
              {cachedVotesTotal > 0
                ? `${cachedVotesTotal} ${
                    cachedVotesTotal > 1 ? texts.consul.votes : texts.consul.vote
                  }`
                : texts.consul.noVotes}
            </RegularText>

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

      {showResponse && responses && responses.length
        ? responses.map((item, index) => (
            <View key={index} style={styles.replyContainer}>
              <ConsulCommentListItem
                index={index}
                commentItem={item}
                onRefresh={onRefresh}
                replyList={true}
                navigation={navigation}
              />
            </View>
          ))
        : null}

      {showReply ? (
        <WrapperRow style={{ marginTop: normalize(10) }}>
          <Input
            multiline
            minHeight={50}
            name="comment"
            label={texts.consul.commentLabel}
            placeholder={texts.consul.answer}
            autoCapitalize="none"
            control={control}
            chat
          />
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
            disabled={isLoading}
          >
            <Icon.Send color={colors.primary} size={normalize(16)} />
          </TouchableOpacity>
        </WrapperRow>
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
  commentItem: PropTypes.object.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  onRefresh: PropTypes.func,
  replyList: PropTypes.bool,
  userId: PropTypes.string
};

LikeDissLikeIcon.propTypes = {
  cachedVotesDown: PropTypes.number,
  cachedVotesUp: PropTypes.number,
  color: PropTypes.string,
  disslike: PropTypes.bool,
  like: PropTypes.bool,
  onPress: PropTypes.func
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: normalize(10)
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: normalize(10),
    width: '10%'
  },
  deleteButton: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  replyContainer: {
    borderColor: colors.borderRgba,
    borderLeftWidth: 0.5,
    borderStyle: 'solid',
    marginTop: normalize(10),
    paddingLeft: normalize(10)
  },
  icon: {
    paddingHorizontal: 5
  },
  iconButton: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 5
  }
});
