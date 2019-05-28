import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

import {
  HtmlView,
  Icon,
  Image,
  Link,
  ListSubtitle,
  ListTitle,
  Title,
  TitleContainer,
  TitleShadow,
  Wrapper,
  WrapperRow
} from '../../components';
import { mail, location, phone as phoneIcon, url as urlIcon, arrowRight } from '../../icons';
import { colors } from '../../config';

export const PointOfInterest = ({ data }) => {
  const [page, setPage] = useState({});

  useEffect(() => {
    const { name, description, category, mediaContents, dataProvider, addresses, contact } = data;
    const { city, street, zip } = addresses[0];
    const { phone, email, webUrls } = contact;

    setPage({
      title: name,
      body: description,
      category,
      image: mediaContents[0].sourceUrl.url,
      address: `${street}, ${zip} ${city}`,
      phone: `${phone}`,
      email: `${email}`,
      url: `${webUrls.url}`
    });
  }, []);

  const { phone, email, url, title, body, image, link, address } = page;

  return (
    <View>
      {!!image && <Image source={{ uri: image }} />}

      <TitleShadow />
      <TitleContainer>
        <Title>{!!title && title.toUpperCase()}</Title>
      </TitleContainer>
      <TitleShadow />

      <WrapperRow>
        {!!address && <Icon icon={location(colors.primary)} />}
        <Text>{address}</Text>
      </WrapperRow>
      <WrapperRow>
        {!!phone && <Icon icon={phoneIcon(colors.primary)} />}
        <Text>{phone}</Text>
      </WrapperRow>
      <WrapperRow>
        {!!email && <Icon icon={mail(colors.primary)} />}
        <Text>{email}</Text>
      </WrapperRow>
      <WrapperRow>
        {!!url && <Icon icon={urlIcon(colors.primary)} />}
        <Text>{url}</Text>
      </WrapperRow>

      <TitleShadow />
      <TitleContainer>
        <Title>{'anfahrt'.toUpperCase()}</Title>
      </TitleContainer>

      <TitleShadow />
      <TitleShadow />
      <TitleContainer>
        <Title>{'öffnungszeiten'.toUpperCase()}</Title>
      </TitleContainer>
      <TitleShadow />

      <TitleShadow />
      <TitleContainer>
        <Title>{'preise'.toUpperCase()}</Title>
      </TitleContainer>
      <TitleShadow />

      <TitleShadow />
      <TitleContainer>
        <Title>{'beschreibung'.toUpperCase()}</Title>
      </TitleContainer>
      <TitleShadow />
      <Wrapper>{!!body && <HtmlView html={body} />}</Wrapper>
    </View>
  );
};

PointOfInterest.propTypes = {
  data: PropTypes.object.isRequired
};
