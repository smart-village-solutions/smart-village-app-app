import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Linking, TouchableOpacity, Text, ScrollView, StyleSheet } from 'react-native';

import {
  HtmlView,
  Icon,
  Image,
  Title,
  TitleContainer,
  TitleShadow,
  Wrapper,
  WrapperMargin
} from '../../components';
import { mail, location, phone as phoneIcon, url as urlIcon } from '../../icons';
import { colors } from '../../config';
import { PriceCard } from './PriceCard';
import { TimeCard } from './TimeCard';
import { momentFormat } from '../../helpers';

export const PointOfInterest = ({ data }) => {
  const [page, setPage] = useState({});

  useEffect(() => {
    const {
      name,
      description,
      category,
      mediaContents,
      dataProvider,
      addresses,
      contact,
      webUrls,
      prices,
      openingHours
    } = data;
    const { city, street, zip } = addresses[0];
    const { phone, email } = contact;

    setPage({
      title: name,
      body: description,
      category,
      image: mediaContents[0].sourceUrl.url,
      address: `${street}, ${zip} ${city}`,
      phone: `${phone}`,
      email: `${email}`,
      // url: `${webUrls[0].url}`
      openingHours,
      prices
    });
  }, []);

  const { phone, email, url, title, body, image, address, prices, openingHours } = page;

  return (
    <ScrollView>
      {!!image && <Image source={{ uri: image }} />}

      <TitleShadow />
      <TitleContainer>
        <Title>{!!title && title.toUpperCase()}</Title>
      </TitleContainer>
      <TitleShadow />

      <Wrapper>
        <WrapperMargin>
          {!!address && <Icon icon={location(colors.primary)} style={styles.padding} />}
          <Text>{address}</Text>
        </WrapperMargin>

        <WrapperMargin>
          {!!phone && <Icon icon={phoneIcon(colors.primary)} style={styles.padding} />}
          <Text>{phone}</Text>
        </WrapperMargin>

        <WrapperMargin>
          {!!email && <Icon icon={mail(colors.primary)} style={styles.padding} />}
          <TouchableOpacity onPress={() => Linking.openURL(url)}>
            <Text>{email}</Text>
          </TouchableOpacity>
        </WrapperMargin>

        <WrapperMargin>
          {!!url && <Icon icon={urlIcon(colors.primary)} style={styles.padding} />}
          <TouchableOpacity onPress={() => Linking.openURL(url)}>
            <Text>{url}</Text>
          </TouchableOpacity>
        </WrapperMargin>
      </Wrapper>

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
      <TimeCard openingHours={openingHours} />

      <TitleShadow />
      <TitleContainer>
        <Title>{'preise'.toUpperCase()}</Title>
      </TitleContainer>
      <TitleShadow />
      <PriceCard prices={prices} />

      <TitleShadow />
      <TitleContainer>
        <Title>{'beschreibung'.toUpperCase()}</Title>
      </TitleContainer>
      <TitleShadow />
      <Wrapper>{!!body && <HtmlView html={body} />}</Wrapper>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  padding: {
    marginRight: 15
  }
});

PointOfInterest.propTypes = {
  data: PropTypes.object.isRequired
};
