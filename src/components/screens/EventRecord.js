import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View } from 'react-native';

import { device, texts } from '../../config';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { Logo } from '../Logo';
import { RegularText } from '../Text';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { ScrollWrapper, Wrapper } from '../Wrapper';
import { PriceCard } from './PriceCard';
import { InfoCard } from './InfoCard';
import { OperatingCompanyInfo } from './OperatingCompanyInfo';
import { OpeningTimesCard } from './OpeningTimesCard';

/* eslint-disable complexity */
/* TODO: refactoring? */
export const EventRecord = ({ data }) => {
  const [page, setPage] = useState({});

  useEffect(() => {
    const {
      addresses,
      category,
      contacts,
      dataProvider,
      description,
      mediaContents,
      prices,
      title,
      webUrls,
      operatingCompany,
      openingHours
    } = data;

    setPage({
      contact: contacts && contacts.length && contacts[0], // TODO: show every contact not only first
      addresses,
      category,
      dataProvider: dataProvider && ` | ${dataProvider.name}`,
      description,

      image:
        mediaContents &&
        mediaContents.length &&
        mediaContents[0].sourceUrl &&
        mediaContents[0].sourceUrl.url, // TODO: some logic to get the first image/thumbnail
      logo: dataProvider && dataProvider.logo && dataProvider.logo.url,
      prices,
      title,
      webUrls,
      operatingCompany,
      priceInformations,
      openingHours
    });
  }, []);

  const {
    contact,
    addresses,
    category,
    dataProvider,
    description,
    eventRecordDate,
    image,
    logo,
    prices,
    title,
    webUrls,
    operatingCompany,
    priceInformations,
    openingHours
  } = page;

  return (
    <SafeAreaView>
      <ScrollWrapper>
        {!!image && <Image source={{ uri: image }} />}

        {!!title && (
          <View>
            <TitleContainer>
              <Title>{title}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
          </View>
        )}
        <Wrapper>
          {!!eventRecordDate && <RegularText small>{eventRecordDate + dataProvider}</RegularText>}
          {!!logo && <Logo source={{ uri: logo }} />}
        </Wrapper>
        <InfoCard category={category} addresses={addresses} contact={contact} webUrls={webUrls} />

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
              <Title>{texts.eventRecord.prices}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <PriceCard prices={prices} />
          </View>
        )}

        {!!description && (
          <View>
            <TitleContainer>
              <Title>{texts.eventRecord.description}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            {/* TODO: map multiple contentBlocks? */}
            <Wrapper>{!!description && <HtmlView html={description} />}</Wrapper>
          </View>
        )}

        {!!operatingCompany && (
          <View>
            <TitleContainer>
              <Title>{texts.pointOfInterest.operatingCompany}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <OperatingCompanyInfo
              address={operatingCompany.address}
              contact={operatingCompany.contact}
              webUrls={operatingCompany.contact.webUrls}
            />
          </View>
        )}
      </ScrollWrapper>
    </SafeAreaView>
  );
};
/* eslint-enable complexity */

EventRecord.propTypes = {
  data: PropTypes.object.isRequired
};
