import { StackScreenProps } from '@react-navigation/stack';
import _shuffle from 'lodash/shuffle';
import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';

import { consts, texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { ScreenName, VolunteerUser } from '../../types';
import { BoldText } from '../Text';
import { Wrapper } from '../Wrapper';

import { VolunteerAvatar } from './VolunteerAvatar';

const { ROOT_ROUTE_NAMES } = consts;

const keyExtractor = ({ guid }: VolunteerUser) => guid;

const MAX_AVATARS_COUNT = 10;

export const VolunteerEventAttending = ({
  calendarEntryId,
  data,
  navigation,
  isAttendingEvent
}: {
  calendarEntryId: number;
  data: VolunteerUser[];
  navigation: StackScreenProps<any>['navigation'];
  isAttendingEvent?: boolean;
}) => {
  const [attendees, setAttendees] = useState<VolunteerUser[]>();

  useEffect(() => {
    const fewShuffledAttendees = _shuffle(data?.slice(0, MAX_AVATARS_COUNT + 1)) as VolunteerUser[];

    fewShuffledAttendees?.length && setAttendees(fewShuffledAttendees);
  }, [data]);

  return (
    <Wrapper>
      <TouchableOpacity
        onPress={() =>
          navigation.push(ScreenName.VolunteerIndex, {
            title: texts.volunteer.participants,
            query: QUERY_TYPES.VOLUNTEER.CALENDAR,
            queryVariables: calendarEntryId,
            rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER,
            isAttendingEvent
          })
        }
      >
        <BoldText>{texts.volunteer.participants}</BoldText>
        <FlatList
          keyExtractor={keyExtractor}
          data={attendees}
          renderItem={({ item, index }: { item: VolunteerUser; index: number }) => (
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
};
