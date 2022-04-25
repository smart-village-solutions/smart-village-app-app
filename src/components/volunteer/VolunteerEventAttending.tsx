import { StackScreenProps } from '@react-navigation/stack';
import _shuffle from 'lodash/shuffle';
import React from 'react';
import { FlatList, TouchableOpacity } from 'react-native';

import { consts, texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';
import { BoldText } from '../Text';
import { Wrapper } from '../Wrapper';

import { VolunteerAvatar } from './VolunteerAvatar';

const { ROOT_ROUTE_NAMES } = consts;

const keyExtractor = ({ guid }: { guid: string }) => guid;

const MAX_AVATARS_COUNT = 10;

export const VolunteerEventAttending = ({
  calendarEntryId,
  data,
  navigation
}: {
  calendarEntryId: number;
  data: [{ id: number; guid: string; display_name: string }];
  navigation: StackScreenProps<any>['navigation'];
}) => (
  <Wrapper>
    <TouchableOpacity
      onPress={() =>
        navigation.push(ScreenName.VolunteerIndex, {
          title: texts.volunteer.participants,
          query: QUERY_TYPES.VOLUNTEER.CALENDAR,
          queryVariables: calendarEntryId,
          rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
        })
      }
    >
      <BoldText>{texts.volunteer.participants}</BoldText>
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
    </TouchableOpacity>
  </Wrapper>
);
