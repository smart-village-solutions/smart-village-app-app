import React from 'react';
import { TouchableOpacity } from 'react-native';

import { texts } from '../../config';
import { useLike } from '../../hooks';
import { VolunteerObjectModelType, VolunteerReportTarget } from '../../types';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';

import { VolunteerLike } from './VolunteerLike';
import { VolunteerReportAction } from './VolunteerReportAction';

export const VolunteerCommentAnswer = ({
  commentsCount,
  likesCount,
  objectId,
  objectModel,
  onPress,
  reportTarget,
  userGuid
}: {
  commentsCount: number;
  likesCount: number;
  objectId: number;
  objectModel: VolunteerObjectModelType;
  onPress: () => void;
  reportTarget?: VolunteerReportTarget;
  userGuid?: string | null;
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
          accessibilityLabel={texts.accessibilityLabels.actions.writeAnswer}
          onPress={onPress}
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
        {reportTarget && (
          <VolunteerReportAction target={reportTarget} variant="text" withSeparator />
        )}
      </WrapperRow>
    </>
  );
};
