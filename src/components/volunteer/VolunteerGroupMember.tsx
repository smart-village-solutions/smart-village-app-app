import { StackScreenProps } from '@react-navigation/stack';
import _shuffle from 'lodash/shuffle';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { useQuery } from 'react-query';

import { consts, texts } from '../../config';
import { isMember, volunteerUserData } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { groupMembership } from '../../queries/volunteer';
import { ScreenName, VolunteerUser } from '../../types';
import { BoldText } from '../Text';
import { Wrapper } from '../Wrapper';

import { VolunteerAvatar } from './VolunteerAvatar';

const { ROOT_ROUTE_NAMES } = consts;

const keyExtractor = ({ user: { guid } }: { user: VolunteerUser }) => guid;

const MAX_AVATARS_COUNT = 10;

export const VolunteerGroupMember = ({
  groupId,
  navigation,
  isGroupMember,
  setIsGroupMember,
  isSuccessJoin,
  isSuccessLeave
}: {
  groupId: number;
  navigation: StackScreenProps<any>['navigation'];
  isGroupMember?: boolean;
  setIsGroupMember: (isMember: boolean) => void;
  isSuccessJoin: boolean;
  isSuccessLeave: boolean;
}) => {
  const { data, refetch } = useQuery(['groupMembership', groupId], () => groupMembership(groupId));
  const [members, setMembers] = useState<{ user: VolunteerUser }[]>();

  useEffect(() => {
    // filter out members that are not yet in the group (1 === 'pending', 3 === 'accepted')
    const acceptedMembers = data?.results?.filter(
      (member: { status: number }) => member.status === 3
    );

    const fewShuffledMembers = _shuffle(acceptedMembers?.slice(0, MAX_AVATARS_COUNT + 1)) as [
      { user: VolunteerUser }
    ];

    fewShuffledMembers?.length && setMembers(fewShuffledMembers);
  }, [data]);

  const checkIfJoined = useCallback(async () => {
    if (!members?.length) {
      setIsGroupMember(false);
      return;
    }

    const { currentUserId } = await volunteerUserData();

    setIsGroupMember(isMember(currentUserId, members));
  }, [members]);

  useEffect(() => {
    checkIfJoined();
  }, [checkIfJoined]);

  useEffect(() => {
    refetch();
  }, [isSuccessJoin, isSuccessLeave]);

  if (!members?.length) return null;

  return (
    <Wrapper>
      <TouchableOpacity
        onPress={() =>
          navigation.push(ScreenName.VolunteerIndex, {
            title: texts.volunteer.members,
            query: QUERY_TYPES.VOLUNTEER.MEMBERS,
            queryVariables: groupId,
            rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER,
            isGroupMember
          })
        }
      >
        <BoldText>{texts.volunteer.members}</BoldText>
        <FlatList
          keyExtractor={keyExtractor}
          data={members}
          renderItem={({ item, index }: { item: { user: VolunteerUser }; index: number }) => (
            <VolunteerAvatar
              {...{
                item,
                index,
                totalCount: data.total,
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
