import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import _filter from 'lodash/filter';

import { device } from '../../config';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { Logo } from '../Logo';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';
import { ImagesCarousel } from '../ImagesCarousel';
import { momentFormat, openLink, trimNewLines } from '../../helpers';
import { RegularText } from '../Text';

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const NewsItem = ({ data }) => {
  const { dataProvider, contentBlocks, title, publishedAt, sourceUrl } = data;

  const subtitle = `${momentFormat(publishedAt)} | ${dataProvider && dataProvider.name}`;
  const logo = dataProvider && dataProvider.logo && dataProvider.logo.url;
  const body =
    contentBlocks &&
    contentBlocks.length &&
    contentBlocks.map((contentBlock) => contentBlock.body).join('');
  const link = sourceUrl && sourceUrl.url;
  let images = [];

  !!contentBlocks &&
    !!contentBlocks.length &&
    contentBlocks.map((contentBlock) => {
      !!contentBlock.mediaContents &&
        !!contentBlock.mediaContents.length &&
        _filter(
          contentBlock.mediaContents,
          (mediaContent) =>
            mediaContent.contentType === 'image' || mediaContent.contentType === 'thumbnail'
        ).map((mediaContent) => {
          !!mediaContent.sourceUrl &&
            !!mediaContent.sourceUrl.url &&
            images.push({ picture: { uri: mediaContent.sourceUrl.url } });
        });
    });

  return (
    <View>
      {!!images && images.length > 1 && <ImagesCarousel data={images} />}
      {!!images && images.length === 1 && <Image source={images[0].picture} />}

      {!!title && !!link ? (
        <TitleContainer>
          <Touchable onPress={() => openLink(link)}>
            <Title>{title}</Title>
          </Touchable>
        </TitleContainer>
      ) : (
        !!title && (
          <TitleContainer>
            <Title>{title}</Title>
          </TitleContainer>
        )
      )}
      {device.platform === 'ios' && <TitleShadow />}
      <Wrapper>
        {!!subtitle && <RegularText small>{subtitle}</RegularText>}
        {!!logo && <Logo source={{ uri: logo }} />}
        {!!body && <HtmlView html={trimNewLines(body)} />}
      </Wrapper>
    </View>
  );
};
/* eslint-enable complexity */

NewsItem.propTypes = {
  data: PropTypes.object.isRequired
};
