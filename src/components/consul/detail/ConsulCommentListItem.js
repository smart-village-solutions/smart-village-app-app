import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { momentFormatUtcToLocal } from '../../../helpers';
import { WrapperRow } from '../../Wrapper';
import { RegularText } from '../..';
import { colors, normalize, texts, Icon } from '../../../config';
import { Touchable } from '../../Touchable';

const text = texts.consul;

export const ConsulCommentListItem = ({ item, index }) => {
  const [responseShow, setResponseShow] = useState(false);
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

  let upVotesPercent = 0;
  let downVotesPercent = 0;
  if (cachedVotesTotal) {
    upVotesPercent = (cachedVotesUp * 100) / cachedVotesTotal;
    downVotesPercent = (cachedVotesDown * 100) / cachedVotesTotal;
  }

  return (
    <View>
      <WrapperRow>
        <RegularText primary>{publicAuthor ? publicAuthor.username : 'Privat'}</RegularText>
        <RegularText> · </RegularText>
        <RegularText smallest placeholder>
          {momentFormatUtcToLocal(publicCreatedAt)}
        </RegularText>
      </WrapperRow>

      <RegularText>{body}</RegularText>

      <View style={styles.votingContainer}>
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
          <WrapperRow>
            <Icon.Like color={colors.placeholder} size={normalize(16)} style={styles.icon} />
            <RegularText smallest placeholder>
              %{upVotesPercent}
            </RegularText>
          </WrapperRow>
          <WrapperRow>
            <Icon.Like
              color={colors.placeholder}
              style={[styles.icon, { transform: [{ rotateX: '180deg' }] }]}
              size={normalize(16)}
            />
            <RegularText smallest placeholder>
              %{downVotesPercent}
            </RegularText>
          </WrapperRow>
        </WrapperRow>
      </View>
      {responseShow && responses && responses.length
        ? responses.map((item, index) => (
            <View key={index} style={styles.replyContainer}>
              <ConsulCommentListItem index={index} item={{ item: item }} />
            </View>
          ))
        : null}
    </View>
  );
};

ConsulCommentListItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number
};

const styles = StyleSheet.create({
  votingContainer: {
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    alignItems: 'center',
    borderColor: colors.placeholder
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
