import React from 'react';
import { TouchableOpacity } from 'react-native';

import { texts } from '../../config';
import { useLike } from '../../hooks';
import { VolunteerObjectModelType } from '../../types';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';

import { VolunteerLike } from './VolunteerLike';

export const VolunteerCommentAnswer = ({
  commentsCount,
  likesCount,
  objectId,
  objectModel,
  userGuid,
  setCommentForModal,
  setIsCommentModalCollapsed
}: {
  commentsCount: number;
  likesCount: number;
  objectId: number;
  objectModel: VolunteerObjectModelType;
  userGuid?: string | null;
  setCommentForModal: (comment: {
    message?: string;
    objectId: number;
    objectModel: VolunteerObjectModelType;
  }) => void;
  setIsCommentModalCollapsed: (isCollapsed: boolean) => void;
}) => {
  const { liked, likeCount, toggleLike } = useLike({
    initialLikeCount: likesCount,
    objectId,
    objectModel,
    userGuid
  });

  return (
    <>
      <WrapperRow>
        <TouchableOpacity
          onPress={() => {
            setCommentForModal({ objectId, objectModel });
            setIsCommentModalCollapsed(false);
          }}
        >
          <WrapperRow>
            <RegularText small>
              {texts.volunteer.commentAnswerNew}
              {!!commentsCount && ` (${commentsCount})`}
            </RegularText>
          </WrapperRow>
        </TouchableOpacity>
        <RegularText small> • </RegularText>
        <VolunteerLike liked={liked} likeCount={likeCount} onToggleLike={toggleLike} />
      </WrapperRow>
    </>
  );
};
