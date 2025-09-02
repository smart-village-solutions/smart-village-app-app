import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';

import { texts } from '../../config';
import { VolunteerObjectModelType } from '../../types';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';

import { VolunteerCommentModal } from './VolunteerCommentModal';

export const VolunteerComment = ({
  authToken,
  commentsCount,
  objectId,
  objectModel
}: {
  authToken: string | null;
  commentsCount: number;
  objectId: number;
  objectModel: VolunteerObjectModelType;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <>
      <TouchableOpacity onPress={() => setIsCollapsed(false)}>
        <WrapperRow>
          <RegularText small>
            {texts.volunteer.commentNew}
            {!!commentsCount && ` (${commentsCount})`}
          </RegularText>
        </WrapperRow>
      </TouchableOpacity>

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
