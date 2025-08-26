import React from 'react';
import { TouchableOpacity } from 'react-native';

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
    <TouchableOpacity onPress={onToggleLike} disabled={loading}>
      <WrapperRow>
        <RegularText small>
          {liked ? 'Gefällt mir nicht mehr' : 'Gefällt mir'} ({likeCount})
        </RegularText>
      </WrapperRow>
    </TouchableOpacity>
  );
};
