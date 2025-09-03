import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Badge, ListItem } from 'react-native-elements';
import Markdown from 'react-native-markdown-display';

import { colors, styles as configStyles, Icon, normalize, texts } from '../../config';
import { momentFormat, volunteerListDate } from '../../helpers';
import { useComments } from '../../hooks';
import { VolunteerComment, VolunteerObjectModelType } from '../../types';
import { BoldText, RegularText } from '../Text';

import { VolunteerAvatar } from './VolunteerAvatar';
import { VolunteerCommentAnswer } from './VolunteerCommentAnswer';

const keyExtractor = (item, index) => `index${index}-comment${item.id}`;

export const VolunteerComments = ({
  authToken,
  commentsCount,
  commentId,
  isAnswer,
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
  commentId: number;
  isAnswer: boolean;
  latestComments: VolunteerComment[];
  objectId: number;
  objectModel: VolunteerObjectModelType;
  onLinkPress: (url: string) => void;
  setCommentForModal: (comment: {
    message: string;
    objectId: number;
    objectModel: VolunteerObjectModelType;
  }) => void;
  setIsCommentModalCollapsed: (isCollapsed: boolean) => void;
  userGuid?: string | null;
}) => {
  const [loadedComments, setLoadedComments] = useState<VolunteerComment[]>([]);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const latestCount = latestComments?.length || 0;
  const previousCommentsCount = commentsCount - latestCount;
  const hasLoadedPrevious = loadedComments?.length > 0;
  const { comments: allComments } = useComments({
    objectId: isAnswer ? commentId : objectId,
    objectModel
  });

  useEffect(() => {
    if (!hasLoadedPrevious) return;

    const latestIds = latestComments?.map(({ id }: { id: number }) => id) || [];
    const nextPrevious =
      allComments?.results?.filter(({ id }: { id: number }) => !latestIds.includes(id)) || [];

    setLoadedComments(nextPrevious);
  }, [hasLoadedPrevious, allComments?.results, latestComments]);

  const comments = useMemo(() => {
    if (!hasLoadedPrevious) return latestComments;

    const byId = new Map<number, VolunteerComment>();

    loadedComments?.forEach((comment) => comment?.id && byId.set(comment.id, comment));
    latestComments?.forEach((comment) => comment?.id && byId.set(comment.id, comment));

    return Array.from(byId.values());
  }, [hasLoadedPrevious, loadedComments, latestComments]);

  const loadPreviousComments = useCallback(async () => {
    if (isLoadingPrevious || hasLoadedPrevious) return;

    setIsLoadingPrevious(true);

    try {
      const latestIds = latestComments?.map(({ id }: { id: number }) => id) || [];
      const previousComments =
        allComments?.results?.filter(({ id }: { id: number }) => !latestIds.includes(id)) || [];

      setLoadedComments(previousComments);
    } catch (error) {
      console.error('Error loading previous comments:', error);
    } finally {
      setIsLoadingPrevious(false);
    }
  }, [isLoadingPrevious, hasLoadedPrevious, latestComments, allComments?.results]);

  return (
    <>
      {previousCommentsCount > 0 && !hasLoadedPrevious && (
        <ListItem containerStyle={styles.loadPreviousContainer}>
          <TouchableOpacity onPress={loadPreviousComments} disabled={isLoadingPrevious}>
            <RegularText small>
              {isLoadingPrevious
                ? texts.volunteer.loading
                : `${texts.volunteer.showPreviousComments(previousCommentsCount)}`}
            </RegularText>
          </TouchableOpacity>
        </ListItem>
      )}

      {comments?.map((comment, index) => {
        const {
          commentsCount = 0,
          comments,
          id = 0,
          likes,
          message,
          createdAt,
          createdBy
        } = comment;
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
                  commentsCount={commentsCount}
                  commentId={id}
                  isAnswer
                  latestComments={comments || []}
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
