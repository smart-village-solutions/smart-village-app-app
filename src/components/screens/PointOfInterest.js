import PropTypes from 'prop-types';
import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';

import { device, texts } from '../../config';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { WrapperNoFlex } from '../Wrapper';
import { PriceCard } from './PriceCard';
import { InfoCard } from './InfoCard';
import { OperatingCompanyInfo } from './OperatingCompanyInfo';
import { OpeningTimesCard } from './OpeningTimesCard';

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const PointOfInterest = ({ data }) => {
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

  const image =
    !!mediaContents &&
    !!mediaContents.length &&
    !!mediaContents[0].sourceUrl &&
    mediaContents[0].sourceUrl.url; // TODO: some logic to get the first image/thumbnail

  return (
    <SafeAreaView>
      <ScrollView>
        {!!image && <Image source={{ uri: image }} />}

        {!!title && (
          <View>
            <TitleContainer>
              <Title>{title}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
          </View>
        )}
        <InfoCard category={category} addresses={addresses} contact={contact} webUrls={webUrls} />

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
            <WrapperNoFlex>{!!description && <HtmlView html={description} />}</WrapperNoFlex>
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
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
/* eslint-enable complexity */

PointOfInterest.propTypes = {
  data: PropTypes.object.isRequired
};
