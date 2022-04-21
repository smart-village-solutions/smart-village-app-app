import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useMutation } from 'react-query';

import { consts, device, texts } from '../../config';
import {
  isOwner,
  volunteerBannerImage,
  volunteerProfileImage,
  volunteerUserData
} from '../../helpers';
import { useOpenWebScreen } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { groupJoin, groupLeave } from '../../queries/volunteer';
import { ScreenName } from '../../types';
import { Button } from '../Button';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { InfoCard } from '../infoCard';
import { Logo } from '../Logo';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

import { VolunteerGroupMember } from './VolunteerGroupMember';
import { VolunteerHomeSection } from './VolunteerHomeSection';
import { VolunteerPosts } from './VolunteerPosts';

const { ROOT_ROUTE_NAMES } = consts;

const a11yText = consts.a11yLabel;

// eslint-disable-next-line complexity
export const VolunteerGroup = ({
  data,
  isRefetching,
  navigation,
  route
}: { data: any; isRefetching: boolean } & StackScreenProps<any>) => {
  const {
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

  const [isGroupMember, setIsGroupMember] = useState<boolean | undefined>();
  const [isGroupOwner, setIsGroupOwner] = useState(false);

  const { mutate: mutateJoin, isSuccess: isSuccessJoin } = useMutation(groupJoin);
  const { mutate: mutateLeave, isSuccess: isSuccessLeave } = useMutation(groupLeave);

  const join = useCallback(async () => {
    const { currentUserId } = await volunteerUserData();

    currentUserId && mutateJoin({ id, userId: currentUserId });
  }, [isGroupMember]);

  const leave = useCallback(async () => {
    const { currentUserId } = await volunteerUserData();

    currentUserId && mutateLeave({ id, userId: currentUserId });
  }, [isGroupMember]);

  const checkIfOwner = useCallback(async () => {
    const { currentUserId } = await volunteerUserData();

    setIsGroupOwner(isOwner(currentUserId, owner));
  }, [owner]);

  useEffect(() => {
    checkIfOwner();
  }, [checkIfOwner]);

  return (
    <View>
      <ImageSection mediaContents={mediaContents} />

      <WrapperWithOrientation>
        {!!name && (
          <TitleContainer>
            <Title accessibilityLabel={`(${name}) ${a11yText.heading}`}>{name}</Title>
          </TitleContainer>
        )}
        {device.platform === 'ios' && <TitleShadow />}

        {!!logo && (
          <Wrapper>
            <Logo source={{ uri: logo }} />
          </Wrapper>
        )}

        <VolunteerGroupMember
          groupId={id}
          navigation={navigation}
          setIsGroupMember={setIsGroupMember}
          isSuccessJoin={isSuccessJoin}
          isSuccessLeave={isSuccessLeave}
        />

        {!!description && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`(${texts.volunteer.description}) ${a11yText.heading}`}>
                {texts.volunteer.description}
              </Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <Wrapper>
              <HtmlView html={description} openWebScreen={openWebScreen} />
            </Wrapper>
          </View>
        )}

        <Wrapper>
          <InfoCard category={{ name: tags }} openWebScreen={openWebScreen} />
        </Wrapper>

        <VolunteerHomeSection
          linkTitle="Alle Termine anzeigen"
          buttonTitle="Termin eintragen"
          showButton={isGroupOwner}
          navigateLink={() =>
            navigation.push(ScreenName.VolunteerIndex, {
              title: texts.volunteer.calendar,
              query: QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
              queryVariables: contentContainerId,
              rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
            })
          }
          navigateButton={() =>
            navigation.navigate(ScreenName.VolunteerForm, {
              title: 'Termin eintragen',
              query: QUERY_TYPES.VOLUNTEER.CALENDAR,
              queryVariables: contentContainerId,
              groupId: id,
              rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
            })
          }
          navigate={() =>
            navigation.push(ScreenName.VolunteerIndex, {
              title: texts.volunteer.calendar,
              query: QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
              queryVariables: contentContainerId,
              rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
            })
          }
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.CALENDAR_ALL}
          queryVariables={contentContainerId}
          sectionTitle="Kalender"
        />

        <VolunteerPosts
          contentContainerId={contentContainerId}
          isRefetching={isRefetching}
          openWebScreen={openWebScreen}
          navigation={navigation}
          isGroupMember={isGroupMember}
        />

        {!isGroupOwner && isGroupMember !== undefined && (
          <Wrapper>
            <Button
              title={isGroupMember ? texts.volunteer.leave : texts.volunteer.join}
              invert={isGroupMember}
              onPress={isGroupMember ? leave : join}
            />
          </Wrapper>
        )}
      </WrapperWithOrientation>
    </View>
  );
};
