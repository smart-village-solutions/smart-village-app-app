import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View } from 'react-native';

import { device, texts } from '../../config';
import { eventDate } from '../../helpers';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { Logo } from '../Logo';
import { RegularText } from '../Text';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { ScrollWrapper, Wrapper } from '../Wrapper';
import { PriceCard } from './PriceCard';
import { InfoCard } from './InfoCard';

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
      dates,
      description,
      mediaContents,
      prices,
      title,
      webUrls
    } = data;
    const {
      dateEnd,
      dateStart,
      timeDescription,
      timeEnd,
      timeStart,
      useOnlyTimeDescription,
      weekday
    } = dates[0]; // TODO: show every date not only first

    setPage({
      contact: contacts && contacts.length && contacts[0], // TODO: show every contact not only first
      addresses,
      category,
      dataProvider: dataProvider && ` | ${dataProvider.name}`,
      description,
      eventRecordDate: eventDate(dateStart, dateEnd),
      image:
        mediaContents &&
        mediaContents.length &&
        mediaContents[0].sourceUrl &&
        mediaContents[0].sourceUrl.url, // TODO: some logic to get the first image/thumbnail
      logo: dataProvider && dataProvider.logo && dataProvider.logo.url,
      prices,
      title,
      webUrls
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
    webUrls
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
      </ScrollWrapper>
    </SafeAreaView>
  );
};
/* eslint-enable complexity */

EventRecord.propTypes = {
  data: PropTypes.object.isRequired
};
