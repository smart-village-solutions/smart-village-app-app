import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback } from 'react';

import { texts } from '../../config';
import { ScreenName } from '../../types';
import { SectionHeader } from '../SectionHeader';
import { Wrapper } from '../Wrapper';

import { VolunteerGroupSearchField } from './VolunteerGroupSearchField';

export const VolunteerGroupSearch = ({
  contentContainerId,
  guid,
  isGroupMember,
  navigation,
  userGuid
}: {
  contentContainerId: number;
  guid: string;
  isGroupMember?: boolean;
  navigation: StackScreenProps<any>['navigation'];
  userGuid?: string | null;
}) => {
  const onPress = useCallback(() => {
    navigation.push(ScreenName.VolunteerGroupSearch, {
      contentContainerId,
      guid,
      userGuid
    });
  }, [guid, userGuid]);

  return (
    <>
      {!!isGroupMember && <SectionHeader onPress={onPress} title={texts.volunteer.groupSearch} />}

      {!!isGroupMember && (
        <Wrapper noPaddingTop>
          <VolunteerGroupSearchField onPress={onPress} />
        </Wrapper>
      )}
    </>
  );
};
