import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { View } from 'react-native';

import { consts, device, texts } from '../../config';
import { volunteerBannerImage, volunteerProfileImage } from '../../helpers';
import { useOpenWebScreen } from '../../hooks';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { InfoCard } from '../infoCard';
import { Logo } from '../Logo';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

import { VolunteerGroupMember } from './VolunteerGroupMember';

const a11yText = consts.a11yLabel;

// eslint-disable-next-line complexity
export const VolunteerGroup = ({
  data,
  refetch,
  route
}: { data: any; refetch: () => void } & StackScreenProps<any>) => {
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
  const { display_name: ownerDisplayName, guid: ownerGuid, id: ownerId } = owner || {};
  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? '';

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle, undefined, rootRouteName);

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

        <VolunteerGroupMember groupId={id} />

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

        {/* <Wrapper>
          <Button
            title={isAttendingEvent ? texts.volunteer.notAttend : texts.volunteer.attend}
            invert={isAttendingEvent}
            onPress={attend}
          />
        </Wrapper> */}
      </WrapperWithOrientation>
    </View>
  );
};
