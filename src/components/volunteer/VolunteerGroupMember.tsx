import _shuffle from 'lodash/shuffle';
import React, { useCallback, useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useQuery } from 'react-query';

import { colors, normalize, texts } from '../../config';
import { isMember, volunteerUserData } from '../../helpers';
import { groupMembership } from '../../queries/volunteer';
import { BoldText } from '../Text';
import { Wrapper } from '../Wrapper';

import { VolunteerAvatar } from './VolunteerAvatar';

const keyExtractor = ({ guid }: { guid: string }) => guid;

const MAX_AVATARS_COUNT = 10;

export const VolunteerGroupMember = ({
  groupId,
  setIsGroupMember,
  isSuccessJoin,
  isSuccessLeave
}: {
  groupId: number;
  setIsGroupMember: (isMember: boolean) => void;
  isSuccessJoin: boolean;
  isSuccessLeave: boolean;
}) => {
  const { data, refetch } = useQuery(['groupMembership', groupId], () => groupMembership(groupId));
  const members = data?.results;

  const checkIfJoined = useCallback(async () => {
    if (!members?.length) return;

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
      <BoldText>{texts.volunteer.members}</BoldText>
      <FlatList
        keyExtractor={keyExtractor}
        data={_shuffle(members.slice(0, MAX_AVATARS_COUNT + 1))}
        renderItem={({ item, index }: any) => (
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
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  border: {
    borderColor: colors.darkText,
    borderWidth: 1
  },
  containerStyle: {
    padding: normalize(2)
  },
  marginLeft: {
    marginLeft: normalize(-12)
  },
  overlayContainerStyle: {
    backgroundColor: colors.lightestText
  },
  placeholderStyle: {
    backgroundColor: colors.lightestText
  },
  titleStyle: {
    color: colors.darkText,
    fontSize: normalize(12)
  }
});
