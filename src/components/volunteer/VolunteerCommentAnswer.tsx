import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';

import { texts } from '../../config';
import { useLike } from '../../hooks';
import { VolunteerObjectModelType } from '../../types';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';

import { VolunteerCommentModal } from './VolunteerCommentModal';
import { VolunteerLike } from './VolunteerLike';

export const VolunteerCommentAnswer = ({
  authToken,
  commentsCount,
  likesCount,
  objectId,
  objectModel,
  userGuid
}: {
  authToken: string | null;
  commentsCount: number;
  likesCount: number;
  objectId: number;
  objectModel: VolunteerObjectModelType;
  userGuid?: string | null;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { liked, likeCount, toggleLike } = useLike({
    initialLikeCount: likesCount,
    objectId,
    objectModel,
    userGuid
  });

  return (
    <>
      <WrapperRow>
        <TouchableOpacity onPress={() => setIsCollapsed(false)}>
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

      <VolunteerCommentModal
        authToken={authToken}
        isCollapsed={isCollapsed}
        objectId={objectId}
        objectModel={objectModel}
        setIsCollapsed={setIsCollapsed}
      />
    </>
  );
};
