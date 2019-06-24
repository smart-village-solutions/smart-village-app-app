import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';

import { device, texts } from '../../config';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { WrapperNoFlex } from '../Wrapper';
import { PriceCard } from './PriceCard';
import { OpeningTimesCard } from './OpeningTimesCard';
import { InfoCard } from './InfoCard';
import { OperatingCompanyInfo } from './OperatingCompanyInfo';

/* eslint-disable complexity */
/* TODO: refactoring? */
export const PointOfInterest = ({ data }) => {
  const [page, setPage] = useState({});

  useEffect(() => {
    const {
      name,
      description,
      category,
      mediaContents,
      addresses,
      contact,
      webUrls,
      openingHours,
      prices,
      operatingCompany
    } = data;

    setPage({
      title: name,
      body: description,
      category,
      image: mediaContents[0].sourceUrl.url, // TODO: some logic to get the first image/thumbnail
      addresses,
      contact,
      webUrls,
      openingHours,
      prices,
      operatingCompany
    });
  }, []);

  const {
    title,
    body,
    category,
    image,
    addresses,
    contact,
    webUrls,
    openingHours,
    prices,
    operatingCompany
  } = page;

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

        {/* TODO: map stuff for location */}
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

        {!!prices && !!prices.length && (
          <View>
            <TitleContainer>
              <Title>{texts.pointOfInterest.prices}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <PriceCard prices={prices} />
          </View>
        )}

        {!!body && (
          <View>
            <TitleContainer>
              <Title>{texts.pointOfInterest.description}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <WrapperNoFlex>{!!body && <HtmlView html={body} />}</WrapperNoFlex>
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
