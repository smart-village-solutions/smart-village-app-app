import React, { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import Markdown from 'react-native-markdown-display';

import { colors, styles as configStyles, normalize } from '../../config';
import { momentFormat, volunteerListDate } from '../../helpers';
import { VolunteerComment, VolunteerObjectModelType } from '../../types';
import { BoldText, RegularText } from '../Text';

import { VolunteerAvatar } from './VolunteerAvatar';
import { VolunteerCommentAnswer } from './VolunteerCommentAnswer';

const keyExtractor = (item, index) => `index${index}-comment${item.id}`;

export const VolunteerComments = ({
  authToken,
  commentId,
  isAnswer,
  latestComments,
  onLinkPress,
  userGuid
}: {
  authToken: string | null;
  commentId: number;
  isAnswer: boolean;
  latestComments: VolunteerComment[];
  onLinkPress: (url: string) => void;
  userGuid?: string | null;
}) => {
  return latestComments?.map((comment, index) => {
    const { commentsCount = 0, comments, id = 0, likes, message, createdAt, createdBy } = comment;
    const { guid, display_name: displayName } = createdBy;

    return (
      <Fragment key={keyExtractor(comment, index)}>
        <ListItem containerStyle={styles.commentsContainer}>
          <VolunteerAvatar item={{ user: { guid, display_name: displayName } }} />

          <ListItem.Content>
            <BoldText small>{displayName}</BoldText>
            <RegularText smallest>
              {momentFormat(
                volunteerListDate({
                  end_datetime: '',
                  start_datetime: '',
                  updated_at: createdAt
                }),
                'DD.MM.YYYY HH:mm'
              )}
            </RegularText>
          </ListItem.Content>
        </ListItem>

        <ListItem containerStyle={styles.commentsContainer}>
          <Markdown onLinkPress={onLinkPress} style={configStyles.markdown}>
            {message}
          </Markdown>
        </ListItem>

        <ListItem
          containerStyle={[styles.commentsContainer, styles.noPaddingTop, styles.paddingBottom]}
        >
          <VolunteerCommentAnswer
            authToken={authToken}
            commentsCount={commentsCount}
            likesCount={likes.total}
            objectId={isAnswer ? commentId : id}
            objectModel={VolunteerObjectModelType.COMMENT}
            userGuid={userGuid}
          />
        </ListItem>

        {!!commentsCount && (
          <View style={[styles.answerCommentsContainer, styles.noPaddingTop]}>
            <VolunteerComments
              authToken={authToken}
              commentId={id}
              isAnswer
              latestComments={comments || []}
              onLinkPress={onLinkPress}
              userGuid={userGuid}
            />
          </View>
        )}
      </Fragment>
    );
  });
};

const styles = StyleSheet.create({
  answerCommentsContainer: {
    backgroundColor: colors.gray20,
    paddingLeft: normalize(24)
  },
  commentsContainer: {
    backgroundColor: colors.gray20,
    paddingHorizontal: normalize(12),
    paddingBottom: 0,
    paddingTop: normalize(12)
  },
  noPaddingTop: {
    paddingTop: 0
  },
  paddingBottom: {
    paddingBottom: normalize(12)
  }
});
