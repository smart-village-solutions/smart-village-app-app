import PropTypes from 'prop-types';
import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import _filter from 'lodash/filter';

import { device, texts } from '../../config';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { Logo } from '../Logo';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper } from '../Wrapper';
import { PriceCard } from './PriceCard';
import { InfoCard } from './InfoCard';
import { OperatingCompanyInfo } from './OperatingCompanyInfo';
import { OpeningTimesCard } from './OpeningTimesCard';
import { ImagesCarousel } from '../ImagesCarousel';

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const EventRecord = ({ data }) => {
  const {
    addresses,
    category,
    contacts,
    dataProvider,
    dates,
    description,
    mediaContents,
    operatingCompany,
    priceInformations,
    title,
    webUrls
  } = data;

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
    <SafeAreaView>
      <ScrollView>
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

          <InfoCard
            category={category}
            addresses={addresses}
            contacts={contacts}
            webUrls={webUrls}
          />
        </Wrapper>

        {!!dates && !!dates.length && (
          <View>
            <TitleContainer>
              <Title>{texts.eventRecord.appointments}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <OpeningTimesCard openingHours={dates} />
          </View>
        )}

        {/* temporary logic in order to show PriceCard just when description is present for the first index */}
        {!!priceInformations && !!priceInformations.length && !!priceInformations[0].description && (
          <View>
            <TitleContainer>
              <Title>{texts.eventRecord.prices}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <PriceCard prices={priceInformations} />
          </View>
        )}

        {!!description && (
          <View>
            <TitleContainer>
              <Title>{texts.eventRecord.description}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <Wrapper>
              <HtmlView html={description} />
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
      </ScrollView>
    </SafeAreaView>
  );
};
/* eslint-enable complexity */

EventRecord.propTypes = {
  data: PropTypes.object.isRequired
};
