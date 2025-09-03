import React, { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, ListItem } from 'react-native-elements';
import Markdown from 'react-native-markdown-display';

import { colors, styles as configStyles, Icon, normalize } from '../../config';
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
  setCommentForModal,
  setIsCommentModalCollapsed,
  userGuid
}: {
  authToken: string | null;
  commentId: number;
  isAnswer: boolean;
  latestComments: VolunteerComment[];
  onLinkPress: (url: string) => void;
  setCommentForModal: (comment: {
    message: string;
    objectId: number;
    objectModel: VolunteerObjectModelType;
  }) => void;
  setIsCommentModalCollapsed: (isCollapsed: boolean) => void;
  userGuid?: string | null;
}) => {
  return latestComments?.map((comment, index) => {
    const { commentsCount = 0, comments, id = 0, likes, message, createdAt, createdBy } = comment;
    const { guid, display_name: displayName } = createdBy;
    const isUserAuthor = userGuid === guid;

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

          {isUserAuthor && (
            <Badge
              badgeStyle={styles.badge}
              value={<Icon.Pen color={colors.darkText} size={normalize(16)} />}
              onPress={() => {
                setCommentForModal({
                  message,
                  objectId: id,
                  objectModel: VolunteerObjectModelType.COMMENT
                });
                setIsCommentModalCollapsed(false);
              }}
            />
          )}
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
            commentsCount={commentsCount}
            likesCount={likes.total}
            objectId={isAnswer ? commentId : id}
            objectModel={VolunteerObjectModelType.COMMENT}
            setCommentForModal={setCommentForModal}
            setIsCommentModalCollapsed={setIsCommentModalCollapsed}
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
              setCommentForModal={setCommentForModal}
              setIsCommentModalCollapsed={setIsCommentModalCollapsed}
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
  badge: {
    backgroundColor: colors.surface,
    borderRadius: normalize(40),
    height: normalize(40),
    width: normalize(40)
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
