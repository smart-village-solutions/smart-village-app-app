import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useId, useLayoutEffect, useState } from 'react';
import { DeviceEventEmitter, StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useMutation } from 'react-query';

import { SettingsContext } from '../../SettingsProvider';
import { colors, styles as configStyles, consts, normalize, texts } from '../../config';
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
  useVolunteerNavigation
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
  VolunteerUser
} from '../../types';
import { Button } from '../Button';
import { HeaderRight } from '../HeaderRight';
import { ImageSection } from '../ImageSection';
import { Logo } from '../Logo';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { Wrapper } from '../Wrapper';
import { InfoCard } from '../infoCard';

import { VolunteerGroupMembersAndApplicants } from './VolunteerGroupMembersAndApplicants';
import { VolunteerHomeSection } from './VolunteerHomeSection';
import { VolunteerPosts } from './VolunteerPosts';

const { ROOT_ROUTE_NAMES } = consts;

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
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;

  const {
    about,
    contentcontainer_id: contentContainerId,
    description,
    guid,
    id,
    join_policy: joinPolicy,
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

  const [userGuid, setUserGuid] = useState<string | null>();
  const [isGroupMember, setIsGroupMember] = useState<boolean | undefined>();
  const [isGroupOwner, setIsGroupOwner] = useState(false);
  const [isGroupApplicant, setIsGroupApplicant] = useState(false);
  const [groupAdmins, setGroupAdmins] = useState<Array<number>>([owner?.id]);

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

  const join = useCallback(async () => {
    const { currentUserId } = await volunteerUserData();

    if (!currentUserId) return;

    if (joinPolicy == JOIN_POLICY_TYPES.INVITE_AND_REQUEST) {
      mutateRequest({ id, userId: currentUserId });
    } else {
      // JOIN_POLICY_TYPES.OPEN
      mutateJoin({ id, userId: currentUserId });
    }
  }, [isGroupMember, isGroupApplicant, joinPolicy]);

  const leave = useCallback(async () => {
    const { currentUserId } = await volunteerUserData();

    currentUserId && mutateLeave({ id, userId: currentUserId });
  }, [isGroupMember]);

  const refreshGroup = useCallback(() => {
    // this will trigger the onRefresh functions provided to the `useVolunteerRefresh` hook
    // in other components.
    DeviceEventEmitter.emit(VOLUNTEER_GROUP_REFRESH_EVENT);
  }, []);

  const checkIfOwner = useCallback(async () => {
    const { currentUserId, currentUserGuid } = await volunteerUserData();

    setUserGuid(currentUserGuid);
    setIsGroupOwner(isOwner(currentUserId, owner));
  }, [owner]);

  const getGroupAdmins = useCallback(async () => {
    const { results } = await groupMembership({ id });

    // if there is only one member, it is the owner, which is the only admin, so we do not need to
    // check for more admins
    results?.length > 1 &&
      setGroupAdmins(
        results
          .filter(({ role }: { role: ROLE_TYPES }) => role === ROLE_TYPES.ADMIN)
          .map(({ user: { id } }: { user: VolunteerUser }) => id)
      );
  }, [id]);

  useLayoutEffect(() => {
    if (isGroupOwner) {
      navigation.setOptions({
        headerRight: () => (
          <HeaderRight
            {...{
              navigation,
              onPress: () =>
                navigation.navigate(ScreenName.VolunteerForm, {
                  query: QUERY_TYPES.VOLUNTEER.GROUP,
                  groupData: data,
                  groupId: data.id
                }),
              route,
              withDrawer: navigationType === 'drawer',
              withEdit: true,
              withShare: true
            }}
          />
        )
      });
    }
  }, [isGroupOwner, data]);

  useFocusEffect(refreshGroup);

  useEffect(() => {
    checkIfOwner();
  }, [checkIfOwner]);

  useEffect(() => {
    getGroupAdmins();
  }, [getGroupAdmins]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  return (
    <View>
      <View>
        <ImageSection mediaContents={mediaContents} />

        {!!logo && <Logo source={{ uri: logo }} containerStyle={styles.logoContainer} />}
      </View>
      <SectionHeader title={name} />
      <VolunteerGroupMembersAndApplicants
        groupId={id}
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
            queryVariables={{ contentContainerId }}
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

          <VolunteerPosts
            contentContainerId={contentContainerId}
            isRefetching={isRefetching}
            openWebScreen={openWebScreen}
            navigation={navigation}
            isGroupMember={isGroupMember}
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

const styles = StyleSheet.create({
  logoContainer: {
    backgroundColor: colors.surface,
    left: normalize(20),
    paddingLeft: 100,
    position: 'absolute',
    top: -80
  }
});
