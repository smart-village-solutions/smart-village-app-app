import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';

import { momentFormatUtcToLocal } from '../../../helpers';
import { RegularText, Button, Touchable, WrapperRow, WrapperVertical } from '../..';
import { colors, normalize, texts, Icon } from '../../../config';
import { Input } from '../form';

const text = texts.consul;

export const ConsulCommentListItem = ({ item, index }) => {
  const [responseShow, setResponseShow] = useState(false);
  const [antwort, setAntwort] = useState(false);

  // React Hook Form
  const { control, handleSubmit } = useForm();

  const {
    body,
    cachedVotesDown,
    cachedVotesTotal,
    cachedVotesUp,
    commentableId,
    commentableType,
    confidenceScore,
    id,
    parentId,
    publicAuthor,
    publicCreatedAt,
    responses
  } = item.item;

  const onSubmit = async (val) => {
    // TODO: Mutation Query!
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
                {responses.length} {text.return}
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

        <Touchable onPress={() => setAntwort(!antwort)}>
          <RegularText primary smallest>
            Antwort
          </RegularText>
        </Touchable>

        <Space />

        {cachedVotesTotal > 0 ? (
          <RegularText smallest placeholder>
            {cachedVotesTotal} {text.votes}
          </RegularText>
        ) : (
          <RegularText smallest placeholder>
            {text.noVotes}
          </RegularText>
        )}

        <LikeDissLikeIcon like cachedVotesUp={cachedVotesUp} />

        <LikeDissLikeIcon disslike cachedVotesDown={cachedVotesDown} />
      </View>

      {/* Reply List! */}
      {responseShow && responses && responses.length
        ? responses.map((item, index) => (
            <View key={index} style={styles.replyContainer}>
              <ConsulCommentListItem index={index} item={{ item: item }} />
            </View>
          ))
        : null}

      {/* New Reply Comment Input! */}
      {antwort ? (
        <>
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
        </>
      ) : null}
    </>
  );
};

const LikeDissLikeIcon = ({ cachedVotesUp, cachedVotesDown, like, disslike }) => {
  return (
    <>
      <Icon.Like
        color={colors.placeholder}
        style={[styles.icon, { transform: disslike && [{ rotateX: '180deg' }] }]}
        size={normalize(16)}
      />
      <RegularText smallest placeholder>
        {like ? cachedVotesUp : cachedVotesDown}
      </RegularText>
    </>
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
  index: PropTypes.number
};

LikeDissLikeIcon.propTypes = {
  like: PropTypes.bool,
  disslike: PropTypes.bool,
  cachedVotesDown: PropTypes.number,
  cachedVotesUp: PropTypes.number
};

const styles = StyleSheet.create({
  bottomContainer: {
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  }
});
