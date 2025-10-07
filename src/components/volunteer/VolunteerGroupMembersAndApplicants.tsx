import { StackScreenProps } from '@react-navigation/stack';
import _shuffle from 'lodash/shuffle';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { UseMutateAsyncFunction, useQuery } from 'react-query';

import { consts, texts } from '../../config';
import { isApplicant, isMember, volunteerUserData } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { groupMembership } from '../../queries/volunteer';
import { MEMBER_STATUS_TYPES, ScreenName, VolunteerUser } from '../../types';
import { BoldText } from '../Text';
import { Wrapper } from '../Wrapper';

import { VolunteerAvatar } from './VolunteerAvatar';

const { ROOT_ROUTE_NAMES } = consts;

const keyExtractor = ({ user: { guid } }: { user: VolunteerUser }) => guid;

const MAX_AVATARS_COUNT = 10;

export const VolunteerGroupMembersAndApplicants = ({
  groupId,
  hideMembers = false,
  navigation,
  isGroupOwner,
  isGroupMember,
  setIsGroupMember,
  setIsGroupApplicant,
  isRefetching,
  mutateAsyncJoin,
  isSuccessJoin,
  mutateAsyncLeave,
  isSuccessLeave,
  isSuccessRequest
}: {
  groupId: number;
  hideMembers: boolean;
  navigation: StackScreenProps<any>['navigation'];
  isGroupOwner?: boolean;
  isGroupMember?: boolean;
  setIsGroupMember: (isMember: boolean) => void;
  setIsGroupApplicant: (isApplicant: boolean) => void;
  isRefetching: boolean;
  mutateAsyncJoin: UseMutateAsyncFunction<any, unknown, { id: number; userId: string }, unknown>;
  isSuccessJoin: boolean;
  mutateAsyncLeave: UseMutateAsyncFunction<any, unknown, { id: number; userId: string }, unknown>;
  isSuccessLeave: boolean;
  isSuccessRequest: boolean;
}) => {
  const { data, refetch } = useQuery(['groupMembership', groupId], () =>
    groupMembership({ id: groupId })
  );
  const [groupMembers, setGroupMembers] = useState<{ user: VolunteerUser }[]>();
  const [groupApplicants, setGroupApplicants] = useState<{ user: VolunteerUser }[]>();

  const setMembersAndApplicants = useCallback(async () => {
    const { currentUserId } = await volunteerUserData();

    const applicants = data?.results?.filter(
      (applicant: { status: number }) => applicant.status === MEMBER_STATUS_TYPES.APPLICANT
    );

    setIsGroupApplicant(isApplicant(currentUserId, applicants));

    if (isGroupOwner) {
      const fewShuffledApplicants = _shuffle(applicants?.slice(0, MAX_AVATARS_COUNT + 1)) as [
        { user: VolunteerUser }
      ];

      setGroupApplicants(fewShuffledApplicants);
    }

    const members = data?.results?.filter(
      (member: { status: number }) => member.status === MEMBER_STATUS_TYPES.MEMBER
    );

    setIsGroupMember(isMember(currentUserId, members));

    const fewShuffledMembers = _shuffle(members?.slice(0, MAX_AVATARS_COUNT + 1)) as [
      { user: VolunteerUser }
    ];

    setGroupMembers(fewShuffledMembers);
  }, [data, isGroupOwner]);

  useEffect(() => {
    setMembersAndApplicants();
  }, [setMembersAndApplicants]);

  useEffect(() => {
    refetch();
  }, [isSuccessJoin, isSuccessLeave, isSuccessRequest]);

  useEffect(() => {
    // refetch when pull to refresh from parent component
    isRefetching && refetch();
  }, [isRefetching]);

  if (!groupMembers?.length && !groupApplicants?.length) return null;

  return (
    <>
      {!hideMembers && !!groupMembers?.length && (
        <Wrapper>
          <TouchableOpacity
            onPress={() =>
              navigation.push(ScreenName.VolunteerIndex, {
                title: texts.volunteer.members,
                query: QUERY_TYPES.VOLUNTEER.MEMBERS,
                queryVariables: { id: groupId },
                rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER,
                isGroupMember
              })
            }
            disabled={!isGroupMember}
          >
            <BoldText>{texts.volunteer.members}</BoldText>
            <FlatList
              keyExtractor={keyExtractor}
              data={groupMembers}
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
      )}
      {isGroupOwner && !!groupApplicants?.length && (
        <Wrapper>
          <TouchableOpacity
            onPress={() =>
              navigation.push(ScreenName.VolunteerIndex, {
                title: texts.volunteer.applicants,
                query: QUERY_TYPES.VOLUNTEER.APPLICANTS,
                queryVariables: { id: groupId },
                rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER,
                isGroupMember,
                mutateAsyncJoin,
                mutateAsyncLeave
              })
            }
          >
            <BoldText>{texts.volunteer.applicants}</BoldText>
            <FlatList
              keyExtractor={keyExtractor}
              data={groupApplicants}
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
      )}
    </>
  );
};
