import React, { Fragment } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Badge, ListItem } from 'react-native-elements';
import Markdown from 'react-native-markdown-display';

import { colors, styles as configStyles, Icon, normalize, texts } from '../../config';
import { momentFormat, volunteerListDate } from '../../helpers';
import { useInfiniteComments } from '../../hooks/volunteer/comment';
import { VolunteerComment, VolunteerFileObject, VolunteerObjectModelType } from '../../types';
import { BoldText, RegularText } from '../Text';

import { VolunteerAvatar } from './VolunteerAvatar';
import { VolunteerCommentAnswer } from './VolunteerCommentAnswer';
import { VolunteerCommentFiles } from './VolunteerCommentFiles';

export const VolunteerComments = ({
  authToken,
  commentsCount,
  commentId,
  isAnswer = false,
  latestComments,
  objectId,
  objectModel,
  onLinkPress,
  setCommentForModal,
  setIsCommentModalCollapsed,
  userGuid
}: {
  authToken: string | null;
  commentsCount: number;
  commentId?: number;
  isAnswer?: boolean;
  latestComments: VolunteerComment[];
  objectId: number;
  objectModel: VolunteerObjectModelType;
  onLinkPress: (url: string) => void;
  setCommentForModal: (comment: {
    files?: VolunteerFileObject[];
    message?: string;
    objectId: number;
    objectModel: VolunteerObjectModelType;
  }) => void;
  setIsCommentModalCollapsed: (isCollapsed: boolean) => void;
  userGuid?: string | null;
}) => {
  const { comments, hasLoadedPrevious, loadPreviousComments, previousCommentsCount } =
    useInfiniteComments({
      commentsCount,
      latestComments,
      objectId: isAnswer ? commentId : objectId,
      objectModel
    });

  return (
    <>
      {previousCommentsCount > 0 && !hasLoadedPrevious && (
        <ListItem containerStyle={styles.loadPreviousContainer}>
          <TouchableOpacity onPress={loadPreviousComments}>
            <RegularText small>
              {texts.volunteer.showPreviousComments(previousCommentsCount)}
            </RegularText>
          </TouchableOpacity>
        </ListItem>
      )}

      {comments?.map((comment) => {
        const {
          commentsCount: childCommentsCount = 0,
          comments: childComments,
          files,
          id = 0,
          likes,
          message,
          createdAt,
          createdBy
        } = comment;
        const { guid, display_name: displayName } = createdBy;
        const isUserAuthor = userGuid === guid;

        return (
          <Fragment key={`comment-${id}`}>
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
                      files,
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

            <VolunteerCommentFiles authToken={authToken} files={files} isAnswer={isAnswer} />

            <ListItem
              containerStyle={[styles.commentsContainer, styles.noPaddingTop, styles.paddingBottom]}
            >
              <VolunteerCommentAnswer
                commentsCount={childCommentsCount}
                likesCount={likes.total}
                objectId={id}
                objectModel={VolunteerObjectModelType.COMMENT}
                onPress={() => {
                  setCommentForModal({
                    objectId: isAnswer ? commentId : id,
                    objectModel: VolunteerObjectModelType.COMMENT
                  });
                  setIsCommentModalCollapsed(false);
                }}
                userGuid={userGuid}
              />
            </ListItem>

            {!isAnswer && (
              <View style={[styles.answerCommentsContainer, styles.noPaddingTop]}>
                <VolunteerComments
                  authToken={authToken}
                  commentsCount={childCommentsCount}
                  commentId={id}
                  isAnswer
                  latestComments={childComments || []}
                  objectId={objectId}
                  objectModel={VolunteerObjectModelType.COMMENT}
                  onLinkPress={onLinkPress}
                  setCommentForModal={setCommentForModal}
                  setIsCommentModalCollapsed={setIsCommentModalCollapsed}
                  userGuid={userGuid}
                />
              </View>
            )}
          </Fragment>
        );
      })}
    </>
  );
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
  loadPreviousContainer: {
    backgroundColor: colors.gray20,
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(12)
  },
  noPaddingTop: {
    paddingTop: 0
  },
  paddingBottom: {
    paddingBottom: normalize(12)
  }
});
