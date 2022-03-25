import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-apollo';

import { momentFormatUtcToLocal } from '../../../helpers';
import { RegularText, Button, Touchable, WrapperRow, WrapperVertical } from '../..';
import { colors, normalize, texts, Icon } from '../../../config';
import { Input } from '../Form';
import { ConsulClient } from '../../../ConsulClient';
import { ADD_REPLY_TO_COMMENT, CAST_VOTE_ON_COMMENT } from '../../../queries/Consul';

const text = texts.consul;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const ConsulCommentListItem = ({ item, onRefresh }) => {
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

  const {
    body,
    cachedVotesDown,
    cachedVotesTotal,
    cachedVotesUp,
    id,
    publicAuthor,
    publicCreatedAt,
    responses
  } = item.item;

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

  return (
    <>
      <WrapperRow>
        <RegularText primary>{publicAuthor ? publicAuthor.username : 'Privat'}</RegularText>
        <RegularText> · </RegularText>
        <RegularText smallest placeholder>
          {momentFormatUtcToLocal(publicCreatedAt)}
        </RegularText>
      </WrapperRow>

      <RegularText>{body}</RegularText>

      {/* Below Comment! */}
      <View style={styles.bottomContainer}>
        <View>
          {responses && responses.length > 0 ? (
            <Touchable onPress={() => setResponseShow(!responseShow)}>
              <RegularText primary smallest>
                {responses.length} {responseShow ? text.answer : text.return}
                {responseShow ? `(${text.collapse})` : `(${text.show})`}
              </RegularText>
            </Touchable>
          ) : (
            <RegularText smallest placeholder>
              {text.noReturn}
            </RegularText>
          )}
        </View>

        <Space />

        {/* Reply Button! */}
        <Touchable onPress={() => setReply(!reply)}>
          <RegularText primary smallest>
            Antwort
          </RegularText>
        </Touchable>

        <Space />

        {/* Vote for Commit! */}
        <WrapperRow>
          {cachedVotesTotal > 0 ? (
            <RegularText smallest placeholder>
              {cachedVotesTotal} {text.votes}
            </RegularText>
          ) : (
            <RegularText smallest placeholder>
              {text.noVotes}
            </RegularText>
          )}

          <LikeDissLikeIcon
            like
            cachedVotesUp={cachedVotesUp}
            onPress={() => onVotingToComment('up')}
          />

          <LikeDissLikeIcon
            disslike
            cachedVotesDown={cachedVotesDown}
            onPress={() => onVotingToComment('down')}
          />
        </WrapperRow>
      </View>

      {/* Reply List! */}
      {responseShow && responses && responses.length
        ? responses.map((item, index) => (
            <View key={index} style={styles.replyContainer}>
              <ConsulCommentListItem index={index} item={{ item: item }} onRefresh={onRefresh} />
            </View>
          ))
        : null}

      {/* New Reply Comment Input! */}
      {reply ? (
        <>
          <Input
            multiline
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
    </>
  );
};
/* eslint-enable complexity */

const LikeDissLikeIcon = ({ cachedVotesUp, cachedVotesDown, like, disslike, onPress }) => {
  return (
    <Touchable onPress={onPress} style={styles.iconButton}>
      <Icon.Like
        color={colors.placeholder}
        style={[styles.icon, { transform: disslike && [{ rotateX: '180deg' }] }]}
        size={normalize(16)}
      />
      <RegularText smallest placeholder>
        {like ? cachedVotesUp : cachedVotesDown}
      </RegularText>
    </Touchable>
  );
};

const Space = () => {
  return (
    <RegularText smallest placeholder>
      |
    </RegularText>
  );
};

ConsulCommentListItem.propTypes = {
  item: PropTypes.object.isRequired,
  onRefresh: PropTypes.func
};

LikeDissLikeIcon.propTypes = {
  like: PropTypes.bool,
  disslike: PropTypes.bool,
  cachedVotesDown: PropTypes.number,
  cachedVotesUp: PropTypes.number,
  onPress: PropTypes.func
};

const styles = StyleSheet.create({
  bottomContainer: {
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 5,
    alignItems: 'center',
    borderColor: colors.placeholder,
    flexWrap: 'wrap'
  },
  replyContainer: {
    borderLeftWidth: 0.5,
    paddingLeft: normalize(10),
    borderStyle: 'solid',
    borderColor: colors.placeholder
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
