import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import _filter from 'lodash/filter';

import { device, texts } from '../../config';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { Logo } from '../Logo';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper } from '../Wrapper';

import { InfoCard } from './InfoCard';
import { TourCard } from './TourCard';
import { OperatingCompanyInfo } from './OperatingCompanyInfo';
import { ImagesCarousel } from '../ImagesCarousel';

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const Tour = ({ data, navigation }) => {
  const {
    addresses,
    category,
    contact,
    dataProvider,
    description,
    lengthKm,
    mediaContents,
    operatingCompany,
    title,
    webUrls
  } = data;
  const rootRouteName = navigation.getParam('rootRouteName', '');
  // action to open source urls
  const openWebScreen = (webUrl) =>
    navigation.navigate({
      routeName: 'Web',
      params: {
        title: 'Tour',
        webUrl,
        rootRouteName
      }
    });

  const logo = dataProvider && dataProvider.logo && dataProvider.logo.url;
  let images = [];

  !!mediaContents &&
    !!mediaContents.length &&
    _filter(
      mediaContents,
      (mediaContent) =>
        mediaContent.contentType === 'image' || mediaContent.contentType === 'thumbnail'
    ).map((item) => {
      !!item.sourceUrl &&
        !!item.sourceUrl.url &&
        images.push({ picture: { uri: item.sourceUrl.url } });
    });

  return (
    <View>
      {!!images && images.length > 1 && <ImagesCarousel data={images} />}
      {!!images && images.length === 1 && <Image source={images[0].picture} />}

      {!!title && (
        <View>
          <TitleContainer>
            <Title>{title}</Title>
          </TitleContainer>
          {device.platform === 'ios' && <TitleShadow />}
        </View>
      )}

      <Wrapper>
        {!!logo && <Logo source={{ uri: logo }} />}

        <InfoCard category={category} addresses={addresses} contact={contact} webUrls={webUrls} />
      </Wrapper>

      <TourCard lengthKm={lengthKm} addresses={addresses} />

      {!!description && (
        <View>
          <TitleContainer>
            <Title>{texts.eventRecord.description}</Title>
          </TitleContainer>
          {device.platform === 'ios' && <TitleShadow />}
          <Wrapper>
            <HtmlView html={description} openWebScreen={openWebScreen} />
          </Wrapper>
        </View>
      )}

      {!!operatingCompany && (
        <View>
          <TitleContainer>
            <Title>{texts.eventRecord.operatingCompany}</Title>
          </TitleContainer>
          {device.platform === 'ios' && <TitleShadow />}
          <OperatingCompanyInfo
            name={operatingCompany.name}
            address={operatingCompany.address}
            contact={operatingCompany.contact}
            webUrls={operatingCompany.contact.webUrls}
          />
        </View>
      )}
    </View>
  );
};
/* eslint-enable complexity */

Tour.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object
};
