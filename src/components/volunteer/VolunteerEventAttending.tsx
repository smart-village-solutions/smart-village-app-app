import _shuffle from 'lodash/shuffle';
import React from 'react';
import { FlatList } from 'react-native';

import { texts } from '../../config';
import { BoldText } from '../Text';
import { Wrapper } from '../Wrapper';

import { VolunteerAvatar } from './VolunteerAvatar';

const keyExtractor = ({ guid }: { guid: string }) => guid;

const MAX_AVATARS_COUNT = 10;

export const VolunteerEventAttending = ({
  data
}: {
  data: [{ id: number; guid: string; display_name: string }];
}) => (
  <Wrapper>
    <BoldText>{texts.volunteer.attending}</BoldText>
    <FlatList
      keyExtractor={keyExtractor}
      data={_shuffle(data.slice(0, MAX_AVATARS_COUNT + 1))}
      renderItem={({ item, index }: any) => (
        <VolunteerAvatar
          {...{
            item: { user: item },
            index,
            totalCount: data.length,
            MAX_AVATARS_COUNT
          }}
        />
      )}
      showsHorizontalScrollIndicator={false}
      horizontal
      bounces={false}
    />
  </Wrapper>
);
