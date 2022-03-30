import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';

import { consts, texts } from '../../config';
import { volunteerUserData } from '../../helpers';
import { useOpenWebScreen } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';
import { Button } from '../Button';
import { AddressSection } from '../infoCard/AddressSection';
import { ContactSection } from '../infoCard/ContactSection';
import { UrlSection } from '../infoCard/UrlSection';
import { Title, TitleContainer } from '../Title';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

const { a11yLabel, ROOT_ROUTE_NAMES } = consts;

export const VolunteerUser = ({
  data,
  navigation,
  route
}: { data: any } & StackScreenProps<any>) => {
  const [isMe, setIsMe] = useState(true);

  const name = data?.display_name;
  const username = data?.account?.username;
  const contact = {
    lastName: username,
    phone: data?.profile?.phone_private,
    email: data?.account?.email,
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

    navigation.setOptions({ headerRight: () => null });
  }, [route, navigation]);

  // action to open source urls
  const openWebScreen = useOpenWebScreen(
    route.name === QUERY_TYPES.VOLUNTEER.PROFILE
      ? texts.screenTitles.volunteer.me
      : texts.detailTitles.volunteer.member,
    undefined,
    route.params?.rootRouteName
  );

  return (
    <WrapperWithOrientation>
      <TitleContainer>
        <Title big center accessibilityLabel={`${name} ${a11yLabel.heading}`}>
          {name}
        </Title>
      </TitleContainer>

      <Wrapper>
        <ContactSection contact={contact} />

        <AddressSection address={address} openWebScreen={openWebScreen} />

        <UrlSection openWebScreen={openWebScreen} webUrls={webUrls} />
      </Wrapper>

      {!isMe && (
        <Wrapper>
          <Button
            onPress={() =>
              navigation.push(ScreenName.VolunteerForm, {
                title: texts.volunteer.conversationStart,
                query: QUERY_TYPES.VOLUNTEER.CONVERSATION,
                rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER,
                selectedUserId: data?.id
              })
            }
            title={texts.volunteer.conversationStart}
          />
        </Wrapper>
      )}

      {/* <TitleContainer>
        <Title
          center
          accessibilityLabel={`${texts.volunteer.memberships} ${a11yLabel.heading}`}
        >
          {texts.volunteer.memberships}
        </Title>
      </TitleContainer>
      <Wrapper>
        <RegularText>...</RegularText>
      </Wrapper>
      <Wrapper>
        <Button onPress={() => undefined} title={texts.volunteer.edit} disabled={isLoading} />
      </Wrapper> */}
    </WrapperWithOrientation>
  );
};
