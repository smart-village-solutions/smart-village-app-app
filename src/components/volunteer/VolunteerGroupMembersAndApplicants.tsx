import { StackScreenProps } from 'expo-router/js-stack';
import _shuffle from 'lodash/shuffle';
import React, { useEffect, useMemo } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { UseMutateAsyncFunction, useQuery } from 'react-query';

import { consts, texts } from '../../config';
import { isApplicant, isMember, volunteerUserData } from '../../helpers';
import { useVolunteerStoredValue } from '../../hooks/volunteer/storedValue';
import { QUERY_TYPES } from '../../queries';
import { groupMembership } from '../../queries/volunteer';
import { MEMBER_STATUS_TYPES, ScreenName, VolunteerUser } from '../../types';
import { BoldText } from '../Text';
import { Wrapper } from '../Wrapper';

import { VolunteerAvatar } from './VolunteerAvatar';
import { VolunteerStorageError } from './VolunteerStorageError';

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
  const {
    value: storedUser,
    error: storedUserError,
    retry
  } = useVolunteerStoredValue(volunteerUserData);

  const membership = useMemo(() => {
    if (!storedUser) return;
    const { currentUserId } = storedUser;

    const applicants = data?.results?.filter(
      (applicant: { status: number }) => applicant.status === MEMBER_STATUS_TYPES.APPLICANT
    );

    const members = data?.results?.filter(
      (member: { status: number }) => member.status === MEMBER_STATUS_TYPES.MEMBER
    );

    return {
      applicant: isApplicant(currentUserId, applicants),
      member: isMember(currentUserId, members),
      groupApplicants: isGroupOwner ? _shuffle(applicants?.slice(0, MAX_AVATARS_COUNT + 1)) : [],
      groupMembers: _shuffle(members?.slice(0, MAX_AVATARS_COUNT + 1))
    };
  }, [data, isGroupOwner, storedUser]);
  const { groupMembers, groupApplicants } = membership || {};

  useEffect(() => {
    if (!membership) return;
    setIsGroupApplicant(membership.applicant);
    setIsGroupMember(membership.member);
  }, [membership, setIsGroupApplicant, setIsGroupMember]);

  useEffect(() => {
    refetch();
  }, [isSuccessJoin, isSuccessLeave, isSuccessRequest]);

  useEffect(() => {
    // refetch when pull to refresh from parent component
    isRefetching && refetch();
  }, [isRefetching]);

  const storageError = storedUserError ? <VolunteerStorageError onRetry={retry} /> : null;
  if (!groupMembers?.length && !groupApplicants?.length) return storageError;

  return (
    <>
      {storageError}
      {!hideMembers && !!groupMembers?.length && (
        <Wrapper>
          <TouchableOpacity
            accessibilityLabel={texts.accessibilityLabels.actions.showMembers}
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
            accessibilityLabel={texts.accessibilityLabels.actions.showApplicants}
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
