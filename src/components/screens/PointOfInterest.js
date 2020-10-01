import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import _filter from 'lodash/filter';

import { device, texts } from '../../config';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper } from '../Wrapper';
import { PriceCard } from './PriceCard';
import { InfoCard } from './InfoCard';
import { OperatingCompanyInfo } from './OperatingCompanyInfo';
import { OpeningTimesCard } from './OpeningTimesCard';
import { ImagesCarousel } from '../ImagesCarousel';

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const PointOfInterest = ({ data, navigation }) => {
  const {
    addresses,
    category,
    contact,
    description,
    mediaContents,
    openingHours,
    operatingCompany,
    priceInformations,
    title,
    webUrls
  } = data;
  const rootRouteName = navigation.getParam('rootRouteName', '');
  // action to open source urls
  const openWebScreen = (webUrl) =>
    navigation.navigate({
      routeName: 'Web',
      params: {
        title: 'Ort',
        webUrl,
        rootRouteName
      }
    });

  let images = [];

  !!mediaContents &&
    !!mediaContents.length &&
    _filter(
      mediaContents,
      (mediaContent) =>
        mediaContent.contentType === 'image' || mediaContent.contentType === 'thumbnail'
    ).forEach((item) => {
      !!item.sourceUrl &&
        !!item.sourceUrl.url &&
        images.push({
          picture: {
            uri: item.sourceUrl.url,
            copyright: item.copyright
          }
        });
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
        <InfoCard category={category} addresses={addresses} contact={contact} webUrls={webUrls} />
      </Wrapper>

      {/* TODO: show map for location */}
      {/* {!!location && (
        <View>
          <TitleContainer>
            <Title>{texts.pointOfInterest.location}</Title>
          </TitleContainer>
          {device.platform === 'ios' && <TitleShadow />}
        </View>
      )} */}

      {!!openingHours && !!openingHours.length && (
        <View>
          <TitleContainer>
            <Title>{texts.pointOfInterest.openingTime}</Title>
          </TitleContainer>
          {device.platform === 'ios' && <TitleShadow />}
          <OpeningTimesCard openingHours={openingHours} />
        </View>
      )}

      {!!priceInformations && !!priceInformations.length && (
        <View>
          <TitleContainer>
            <Title>{texts.pointOfInterest.prices}</Title>
          </TitleContainer>
          {device.platform === 'ios' && <TitleShadow />}
          <PriceCard prices={priceInformations} />
        </View>
      )}

      {!!description && (
        <View>
          <TitleContainer>
            <Title>{texts.pointOfInterest.description}</Title>
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
            <Title>{texts.pointOfInterest.operatingCompany}</Title>
          </TitleContainer>
          {device.platform === 'ios' && <TitleShadow />}
          <OperatingCompanyInfo
            name={operatingCompany.name}
            address={operatingCompany.address}
            contact={operatingCompany.contact}
            webUrls={operatingCompany.contact.webUrls}
            openWebScreen={openWebScreen}
          />
        </View>
      )}
    </View>
  );
};
/* eslint-enable complexity */

PointOfInterest.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object
};
