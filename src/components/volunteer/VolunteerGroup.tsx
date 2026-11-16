import { useFocusEffect } from 'expo-router/react-navigation';
import { StackScreenProps } from 'expo-router/js-stack';
import React, { useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { DeviceEventEmitter, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useMutation, useQuery } from 'react-query';

import { SettingsContext } from '../../SettingsProvider';
import { styles as configStyles, consts, normalize, texts } from '../../config';
import {
  isOwner,
  openLink,
  volunteerBannerImage,
  volunteerProfileImage,
  volunteerUserData
} from '../../helpers';
import {
  VOLUNTEER_GROUP_REFRESH_EVENT,
  useOpenWebScreen,
  useVolunteerNavigation,
  useVolunteerRefresh
} from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import {
  groupJoin,
  groupLeave,
  groupMembership,
  groupRequestMembership
} from '../../queries/volunteer';
import {
  JOIN_POLICY_TYPES,
  ROLE_TYPES,
  ScreenName,
  VolunteerGroup as TVolunteerGroup,
  VolunteerModulesType
} from '../../types';
import { Button } from '../Button';
import { HeaderRight } from '../HeaderRight';
import { ImageSection } from '../ImageSection';
import { Logo } from '../Logo';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { Wrapper } from '../Wrapper';
import { InfoCard } from '../infoCard';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useVolunteerStoredValue } from '../../hooks/volunteer/storedValue';

import { VolunteerGroupMembersAndApplicants } from './VolunteerGroupMembersAndApplicants';
import { VolunteerGroupSearch } from './VolunteerGroupSearch';
import { VolunteerHomeSection } from './VolunteerHomeSection';
import { VolunteerPosts } from './VolunteerPosts';
import { VolunteerStorageError } from './VolunteerStorageError';

const { ROOT_ROUTE_NAMES } = consts;

const limit = 99999; // NOTE: we want to receive all groups
const page = 1;

// eslint-disable-next-line complexity
export const VolunteerGroup = ({
  data,
  refetch,
  isRefetching,
  navigation,
  route
}: {
  data: TVolunteerGroup & { contentcontainer_id: number; join_policy: number };
  refetch: () => void;
  isRefetching: boolean;
} & StackScreenProps<any>) => {
  const styles = useThemeStyles(createStyles);
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;

  const {
    about,
    contentcontainer_id: contentContainerId,
    description,
    guid,
    hideMembers,
    id,
    join_policy: joinPolicy,
    modules,
    name,
    owner,
    tags
  } = data;
  const mediaContents = [
    {
      contentType: 'image',
      sourceUrl: { url: volunteerBannerImage(guid) }
    }
  ];
  const logo = volunteerProfileImage(guid);
  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? '';

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle, undefined, rootRouteName);

  const {
    value: storedUser,
    error: storageError,
    retry: retryStorage
  } = useVolunteerStoredValue(volunteerUserData);
  const userGuid = storedUser?.currentUserGuid;
  const isGroupOwner = !!storedUser && isOwner(storedUser.currentUserId, owner);
  const [isGroupMember, setIsGroupMember] = useState<boolean | undefined>();
  const [isGroupApplicant, setIsGroupApplicant] = useState(false);
  const {
    data: membership,
    isError: adminsError,
    refetch: refetchMembership
  } = useQuery(['groupMembership', id], () => groupMembership({ id }));
  const groupAdmins = useMemo(
    () =>
      membership?.results?.length > 1
        ? membership.results
            .filter(({ role }: { role: ROLE_TYPES }) => role === ROLE_TYPES.ADMIN)
            .map(({ user: { id } }: { user: { id: number } }) => id)
        : [owner?.id],
    [membership, owner?.id]
  );

  const volunteerNavigation = useVolunteerNavigation();
  const {
    mutate: mutateJoin,
    mutateAsync: mutateAsyncJoin,
    isSuccess: isSuccessJoin
  } = useMutation(groupJoin);
  const { mutate: mutateRequest, isSuccess: isSuccessRequest } =
    useMutation(groupRequestMembership);
  const {
    mutate: mutateLeave,
    mutateAsync: mutateAsyncLeave,
    isSuccess: isSuccessLeave
  } = useMutation(groupLeave);

  const join = useCallback(() => {
    const currentUserId = storedUser?.currentUserId;

    if (!currentUserId) return;

    if (joinPolicy == JOIN_POLICY_TYPES.INVITE_AND_REQUEST) {
      mutateRequest({ id, userId: currentUserId });
    } else {
      // JOIN_POLICY_TYPES.OPEN
      mutateJoin({ id, userId: currentUserId });
    }
  }, [storedUser, id, joinPolicy, mutateRequest, mutateJoin]);

  const leave = useCallback(() => {
    const currentUserId = storedUser?.currentUserId;

    currentUserId && mutateLeave({ id, userId: currentUserId });
  }, [storedUser, id, mutateLeave]);

  useVolunteerRefresh(refetch, QUERY_TYPES.VOLUNTEER.GROUP);

  const refreshGroup = useCallback(() => {
    // this will trigger the onRefresh functions provided to the `useVolunteerRefresh` hook
    // in other components.
    DeviceEventEmitter.emit(VOLUNTEER_GROUP_REFRESH_EVENT);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          navigation={navigation}
          onPress={() =>
            navigation.navigate(ScreenName.VolunteerForm, {
              query: QUERY_TYPES.VOLUNTEER.GROUP,
              groupData: data,
              groupId: data.id
            })
          }
          reportTarget={{
            targetType: 'space',
            targetId: Number(id),
            label: texts.volunteer.report.targets.group
          }}
          route={route}
          withDrawer={navigationType === 'drawer'}
          withEdit={isGroupOwner}
          withShare
        />
      )
    });
  }, [isGroupOwner, data, id, navigation, navigationType, route]);

  useFocusEffect(refreshGroup);

  const isCalendarModuleEnabled = useMemo(
    () => !!modules?.find(({ id }) => id === VolunteerModulesType.CALENDAR)?.enabled,
    [modules]
  );

  return (
    <View>
      {(storageError || adminsError) && (
        <VolunteerStorageError
          onRetry={() => {
            retryStorage();
            void refetchMembership();
          }}
        />
      )}
      <View>
        <ImageSection mediaContents={mediaContents} />

        {!!logo && <Logo source={{ uri: logo }} containerStyle={styles.logoContainer} />}
      </View>
      <SectionHeader title={name} />
      <VolunteerGroupMembersAndApplicants
        groupId={id}
        hideMembers={!!hideMembers}
        navigation={navigation}
        isGroupOwner={isGroupOwner}
        isGroupMember={isGroupMember}
        setIsGroupMember={setIsGroupMember}
        setIsGroupApplicant={setIsGroupApplicant}
        isRefetching={isRefetching}
        mutateAsyncJoin={mutateAsyncJoin}
        isSuccessJoin={isSuccessJoin}
        mutateAsyncLeave={mutateAsyncLeave}
        isSuccessLeave={isSuccessLeave}
        isSuccessRequest={isSuccessRequest}
      />

      {isGroupMember !== undefined && !isGroupMember && (
        <Wrapper>
          <Button
            title={texts.volunteer.contactGroupOwner}
            onPress={() =>
              volunteerNavigation(() =>
                navigation.push(ScreenName.VolunteerForm, {
                  title: texts.volunteer.conversationAllStart,
                  query: QUERY_TYPES.VOLUNTEER.CONVERSATION,
                  rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER,
                  selectedUserIds: groupAdmins
                })
              )
            }
          />
        </Wrapper>
      )}

      {!!description && (
        <View>
          <SectionHeader title={texts.volunteer.description} />
          <Wrapper>
            <RegularText>{description}</RegularText>
          </Wrapper>
        </View>
      )}

      {!!about && (
        <View>
          <SectionHeader title={texts.volunteer.about} />
          <Wrapper>
            <Markdown
              onLinkPress={(url) => {
                openLink(url, openWebScreen);
                return false;
              }}
              style={configStyles.markdown}
            >
              {about}
            </Markdown>
          </Wrapper>
        </View>
      )}

      {!!tags?.length && (
        <Wrapper>
          <InfoCard category={{ name: tags }} openWebScreen={openWebScreen} />
        </Wrapper>
      )}

      {!!contentContainerId && (
        <>
          {isCalendarModuleEnabled && (
            <>
              <VolunteerHomeSection
                linkTitle="Alle Termine anzeigen"
                navigateLink={() =>
                  navigation.push(ScreenName.VolunteerIndex, {
                    title: texts.volunteer.events,
                    query: QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
                    queryVariables: { contentContainerId },
                    rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
                  })
                }
                navigate={() =>
                  navigation.push(ScreenName.VolunteerIndex, {
                    title: texts.volunteer.events,
                    query: QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
                    queryVariables: { contentContainerId },
                    rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
                  })
                }
                navigation={navigation}
                query={QUERY_TYPES.VOLUNTEER.CALENDAR_ALL}
                queryVariables={{ contentContainerId, limit, page }}
                sectionTitle={texts.volunteer.events}
                showLink
              />

              {(isGroupOwner || isGroupMember) && (
                <Wrapper>
                  <Button
                    title="Termin eintragen"
                    onPress={() =>
                      navigation.navigate(ScreenName.VolunteerForm, {
                        title: 'Termin eintragen',
                        query: QUERY_TYPES.VOLUNTEER.CALENDAR,
                        groupId: contentContainerId,
                        rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
                      })
                    }
                  />
                </Wrapper>
              )}
            </>
          )}

          {(isGroupOwner || isGroupMember) && (
            <VolunteerGroupSearch
              contentContainerId={contentContainerId}
              guid={guid}
              isGroupMember={isGroupMember}
              navigation={navigation}
              userGuid={userGuid}
            />
          )}

          <VolunteerPosts
            contentContainerId={contentContainerId}
            isGroupMember={isGroupMember}
            isRefetching={isRefetching}
            navigation={navigation}
            openWebScreen={openWebScreen}
            userGuid={userGuid}
          />
        </>
      )}

      {!!joinPolicy && !isGroupOwner && isGroupMember !== undefined && (
        <Wrapper>
          <Button
            title={
              isGroupMember
                ? texts.volunteer.leave
                : isGroupApplicant
                ? texts.volunteer.pending
                : texts.volunteer.join[joinPolicy as keyof typeof texts.volunteer.join]
            }
            invert={isGroupMember}
            onPress={() => volunteerNavigation(isGroupMember ? leave : join)}
            disabled={isGroupApplicant}
          />
          {!isGroupMember && joinPolicy === JOIN_POLICY_TYPES.INVITE_AND_REQUEST && (
            <RegularText small center placeholder>
              {texts.volunteer.requestPending}
            </RegularText>
          )}
        </Wrapper>
      )}
    </View>
  );
};

const createStyles = (colors) => ({
  logoContainer: {
    backgroundColor: colors.surface,
    left: normalize(20),
    paddingLeft: 100,
    position: 'absolute',
    top: -80
  }
});
