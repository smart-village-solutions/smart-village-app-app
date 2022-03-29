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
import { groupJoin, groupLeave } from '../../queries/volunteer';
import { Button } from '../Button';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { InfoCard } from '../infoCard';
import { Logo } from '../Logo';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

import { VolunteerGroupMember } from './VolunteerGroupMember';
import { VolunteerPosts } from './VolunteerPosts';

const a11yText = consts.a11yLabel;

// eslint-disable-next-line complexity
export const VolunteerGroup = ({
  data,
  isRefetching,
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

        <VolunteerPosts contentContainerId={contentContainerId} isRefetching={isRefetching} />

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
