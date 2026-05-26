import React from 'react';
import { TouchableOpacity } from 'react-native';

import { texts } from '../../config';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';

type VolunteerLikeProps = {
  likeCount: number;
  liked: boolean;
  loading?: boolean;
  onToggleLike: () => void;
};

export const VolunteerLike = ({
  likeCount,
  liked,
  loading = false,
  onToggleLike
}: VolunteerLikeProps) => {
  return (
    <TouchableOpacity
      accessibilityLabel={
        liked ? texts.accessibilityLabels.actions.unlike : texts.accessibilityLabels.actions.like
      }
      onPress={onToggleLike}
      disabled={loading}
    >
      <WrapperRow>
        <RegularText small>
          {liked ? texts.volunteer.likeDelete : texts.volunteer.likeNew}
          {!!likeCount && ` (${likeCount})`}
        </RegularText>
      </WrapperRow>
    </TouchableOpacity>
  );
};
