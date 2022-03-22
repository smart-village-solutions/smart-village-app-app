import PropTypes from 'prop-types';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { momentFormatUtcToLocal } from '../../../helpers';
import { Wrapper, WrapperRow } from '../../Wrapper';
import { BoldText, RegularText } from '../..';
import { colors, normalize } from '../../../config';

export const ConsulCommentListItem = ({ item, index }) => {
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
    publicCreatedAt
  } = item.item;

  let upVotesPercent = 0;
  let downVotesPercent = 0;
  if (cachedVotesTotal) {
    upVotesPercent = (cachedVotesUp * 100) / cachedVotesTotal;
    downVotesPercent = (cachedVotesDown * 100) / cachedVotesTotal;
  }

  if (parentId) return null;

  return (
    <Wrapper>
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
          {parentId === id ? (
            <RegularText smallest placeholder>
              Keine Rückmeldunge
            </RegularText>
          ) : (
            <RegularText smallest placeholder>
              Keine Rückmeldungen
            </RegularText>
          )}
        </View>
        <WrapperRow>
          {cachedVotesTotal > 0 ? (
            <RegularText smallest placeholder>
              {cachedVotesTotal} Stimmen
            </RegularText>
          ) : (
            <RegularText smallest placeholder>
              Keine Bewertung
            </RegularText>
          )}
          <RegularText smallest placeholder>
            %{upVotesPercent} Up
          </RegularText>
          <RegularText smallest placeholder>
            %{downVotesPercent} Down
          </RegularText>
        </WrapperRow>
      </View>
    </Wrapper>
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
  }
});
