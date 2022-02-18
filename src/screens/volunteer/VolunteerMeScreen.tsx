import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useQuery } from 'react-query';

import {
  Button,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  Wrapper,
  WrapperWithOrientation
} from '../../components';
import { AddressSection } from '../../components/infoCard/AddressSection';
import { ContactSection } from '../../components/infoCard/ContactSection';
import { UrlSection } from '../../components/infoCard/UrlSection';
import { consts, texts } from '../../config';
import { storeVolunteerContentContainerId } from '../../helpers';
import { useOpenWebScreen, usePullToRefetch } from '../../hooks';
import { useLogoutHeader } from '../../hooks/volunteer';
import { QUERY_TYPES } from '../../queries';
import { meQuery } from '../../queries/volunteer';

const { a11yLabel } = consts;

export const VolunteerMeScreen = ({ navigation, route }: StackScreenProps<any>) => {
  useLogoutHeader({ query: QUERY_TYPES.VOLUNTEER.PROFILE, navigation });

  // action to open source urls
  const openWebScreen = useOpenWebScreen(
    'Persönliche Daten',
    undefined,
    route.params?.rootRouteName
  );

  const { isLoading, isError, isSuccess, data, refetch } = useQuery('meQuery', meQuery);

  const RefreshControl = usePullToRefetch(refetch);

  useEffect(() => {
    if (isSuccess && data?.account?.contentcontainer_id) {
      // save to global state if there are no errors
      storeVolunteerContentContainerId(data.account.contentcontainer_id);
    }
  }, [isSuccess, data]);

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  if (isError || (isSuccess && data?.status && data?.status !== 200)) {
    return (
      <SafeAreaViewFlex>
        <Wrapper>
          <RegularText>{texts.volunteer.errorLoadingUser}</RegularText>
        </Wrapper>
      </SafeAreaViewFlex>
    );
  }

  const myName = data?.display_name;
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

  return (
    <SafeAreaViewFlex>
      <ScrollView refreshControl={RefreshControl}>
        <WrapperWithOrientation>
          <TitleContainer>
            <Title big center accessibilityLabel={`${myName} ${a11yLabel.heading}`}>
              {myName}
            </Title>
          </TitleContainer>

          <Wrapper>
            <ContactSection contact={contact} />

            <AddressSection address={address} openWebScreen={openWebScreen} />

            <UrlSection openWebScreen={openWebScreen} webUrls={webUrls} />
          </Wrapper>

          <TitleContainer>
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
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
