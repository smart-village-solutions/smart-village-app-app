import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { device, texts } from '../../config';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper } from '../Wrapper';
import { PriceCard } from './PriceCard';
import { TimeCard } from './TimeCard';
import { InfoCard } from './InfoCard';
import { ListSubtitle } from '../TextList';

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
      prices
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
      prices
    });
  }, []);

  const { title, body, category, image, addresses, contact, webUrls, openingHours, prices } = page;

  return (
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

      {/* TODO: layout check with data */}
      {/* {!!openingHours && !!openingHours.length && (
        <View>
          <TitleContainer>
            <Title>{texts.pointOfInterest.openingTime}</Title>
          </TitleContainer>
          {device.platform === 'ios' && <TitleShadow />}
          <TimeCard openingHours={openingHours} />
        </View>
      )} */}

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
          <Wrapper>{!!body && <HtmlView html={body} />}</Wrapper>
        </View>
      )}
    </ScrollView>
  );
};
/* eslint-enable complexity */

PointOfInterest.propTypes = {
  data: PropTypes.object.isRequired
};
