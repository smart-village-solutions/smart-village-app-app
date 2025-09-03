import React from 'react';
import { TouchableOpacity } from 'react-native';

import { texts } from '../../config';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';

export const VolunteerComment = ({
  commentsCount,
  onPress
}: {
  commentsCount: number;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress}>
    <WrapperRow>
      <RegularText small>
        {texts.volunteer.commentNew}
        {!!commentsCount && ` (${commentsCount})`}
      </RegularText>
    </WrapperRow>
  </TouchableOpacity>
);
