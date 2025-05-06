import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { SettingsContext } from '../../SettingsProvider';
import { consts, normalize, texts } from '../../config';
import {
  isImageUrlReachable,
  volunteerBannerImage,
  volunteerProfileImage,
  volunteerUserData
} from '../../helpers';
import { useOpenWebScreen } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';
import { Button } from '../Button';
import { HeaderRight } from '../HeaderRight';
import { ImageSection } from '../ImageSection';
import { Logo } from '../Logo';
import { SectionHeader } from '../SectionHeader';
import { BoldText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';
import { AddressSection } from '../infoCard/AddressSection';
import { ContactSection } from '../infoCard/ContactSection';
import { UrlSection } from '../infoCard/UrlSection';

const { ROOT_ROUTE_NAMES } = consts;

export const VolunteerUser = ({
  data,
  navigation,
  route
}: { data: any } & StackScreenProps<any>) => {
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;
  const [bannerImageUrl, setBannerImageUrl] = useState<string>();
  const [isMe, setIsMe] = useState<boolean>();

  const name = data?.display_name;
  const username = data?.account?.username;
  const contact = {
    lastName: username,
    phone: data?.profile?.phone_private,
    // do not show the email address to others due to privacy
    email: isMe === true ? data?.account?.email : '',
    fax: data?.profile?.fax
  };
  const address = {
    city: data?.profile?.city,
    street: data?.profile?.street,
    zip: data?.profile?.zip
  };
  const webUrls = [
    { url: data?.profile?.url },
    { url: data?.profile?.url_linkedin },
    { url: data?.profile?.url_xing },
    { url: data?.profile?.url_facebook },
    { url: data?.profile?.url_twitter },
    { url: data?.profile?.url_youtube }
  ];
  const about = data?.profile?.about;
  const logo = volunteerProfileImage(data?.guid);
  const mediaContents = [
    {
      contentType: 'image',
      sourceUrl: { url: bannerImageUrl }
    }
  ];

  useEffect(() => {
    isImageUrlReachable(volunteerBannerImage(data?.guid)).then(
      (isReachable) => !!isReachable && setBannerImageUrl(volunteerBannerImage(data?.guid))
    );
  }, [data?.guid]);

  const checkIfMe = useCallback(async () => {
    const { currentUserId } = await volunteerUserData();

    setIsMe(currentUserId == data?.id);
  }, [data]);

  useEffect(() => {
    checkIfMe();
  }, [checkIfMe]);

  // remove share header for user detail screens
  useEffect(() => {
    if (route.name === QUERY_TYPES.VOLUNTEER.PROFILE) return;

    if (isMe) {
      navigation.setOptions({
        headerRight: () => (
          <HeaderRight
            {...{
              navigation,
              onPress: () =>
                navigation.navigate(ScreenName.VolunteerForm, {
                  query: QUERY_TYPES.VOLUNTEER.PROFILE,
                  userData: data,
                  title: data?.display_name
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
  }, [route, navigation, isMe, data]);

  // action to open source urls
  const openWebScreen = useOpenWebScreen(
    route.name === QUERY_TYPES.VOLUNTEER.PROFILE
      ? texts.screenTitles.volunteer.me
      : texts.detailTitles.volunteer.user,
    undefined,
    route.params?.rootRouteName
  );

  return (
    <>
      <ImageSection mediaContents={mediaContents} />

      {!!logo && (
        <Logo source={{ uri: logo }} containerStyle={[!!bannerImageUrl && styles.logoContainer]} />
      )}

      <SectionHeader title={name} />
      {!!about && (
        <Wrapper>
          <BoldText>{texts.volunteer.aboutMe}</BoldText>
          <RegularText>{about}</RegularText>
        </Wrapper>
      )}

      <Wrapper>
        <ContactSection contact={contact} />

        <AddressSection address={address} openWebScreen={openWebScreen} />

        <UrlSection openWebScreen={openWebScreen} webUrls={webUrls} />
      </Wrapper>

      {isMe === false && (
        <Wrapper>
          <Button
            onPress={() =>
              navigation.push(ScreenName.VolunteerForm, {
                title: texts.volunteer.messageNew,
                query: QUERY_TYPES.VOLUNTEER.CONVERSATION,
                rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER,
                selectedUserIds: [data?.id]
              })
            }
            title={texts.volunteer.messageNew}
          />
        </Wrapper>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    left: normalize(7),
    paddingLeft: 100,
    position: 'absolute',
    top: -80
  }
});
