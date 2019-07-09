import PropTypes from 'prop-types';
import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';

import { device, texts } from '../../config';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { Logo } from '../Logo';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper, WrapperNoFlex } from '../Wrapper';

import { InfoCard } from './InfoCard';
import { OperatingCompanyInfo } from './OperatingCompanyInfo';

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const Tour = ({ data }) => {
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

  const logo = dataProvider && dataProvider.logo && dataProvider.logo.url;
  const image =
    mediaContents &&
    mediaContents.length &&
    mediaContents[0].sourceUrl &&
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
        <Wrapper>{!!logo && <Logo source={{ uri: logo }} />}</Wrapper>
        <InfoCard
          category={category}
          lengthKm={lengthKm}
          addresses={addresses}
          contact={contact}
          webUrls={webUrls}
        />

        {!!description && (
          <View>
            <TitleContainer>
              <Title>{texts.eventRecord.description}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <WrapperNoFlex>{!!description && <HtmlView html={description} />}</WrapperNoFlex>
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

Tour.propTypes = {
  data: PropTypes.object.isRequired
};
