import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import _filter from 'lodash/filter';

import { device, normalize } from '../../config';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { LoadingContainer } from '../LoadingContainer';
import { Logo } from '../Logo';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperHorizontal } from '../Wrapper';
import { ImagesCarousel } from '../ImagesCarousel';
import { momentFormat, trimNewLines } from '../../helpers';
import { BoldText, RegularText } from '../Text';
import { Button } from '../Button';

// necessary hacky way of implementing iframe in webview with correct zoom level
// thx to: https://stackoverflow.com/a/55780430
const INJECTED_JAVASCRIPT_FOR_IFRAME_WEBVIEW = `
  const meta = document.createElement('meta');
  meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=0.99, user-scalable=0');
  meta.setAttribute('name', 'viewport');
  document.getElementsByTagName('head')[0].appendChild(meta);
  true;
`;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const NewsItem = ({ data, navigation }) => {
  const { dataProvider, mainTitle, contentBlocks, publishedAt, sourceUrl, settings } = data;

  const logo = dataProvider && dataProvider.logo && dataProvider.logo.url;
  const link = sourceUrl && sourceUrl.url;
  const subtitle = `${momentFormat(publishedAt)} | ${dataProvider && dataProvider.name}`;
  // the title of a news item is either a given main title or the title from the first content block
  const title = mainTitle || (!!contentBlocks && !!contentBlocks.length && contentBlocks[0].title);
  // action to open source urls
  const openWebScreen = () =>
    navigation.navigate({
      routeName: 'Web',
      params: {
        title,
        webUrl: link,
        rootRouteName: 'NewsItems'
      }
    });

  // the images from the first content block will be present in the main image carousel
  let mainImages = [];
  !!contentBlocks &&
    !!contentBlocks.length &&
    !!contentBlocks[0].mediaContents &&
    !!contentBlocks[0].mediaContents.length &&
    _filter(
      contentBlocks[0].mediaContents,
      (mediaContent) =>
        mediaContent.contentType === 'image' || mediaContent.contentType === 'thumbnail'
    ).map((mediaContent) => {
      !!mediaContent.sourceUrl &&
        !!mediaContent.sourceUrl.url &&
        mainImages.push({ picture: { uri: mediaContent.sourceUrl.url } });
    });

  // the story is a map of all available content blocks
  // each content block can have multiple media
  let story = [];
  if (!!contentBlocks && !!contentBlocks.length) {
    contentBlocks.map((contentBlock, index) => {
      let section = [];
      let sectionImages = [];

      // skip the title for the first content block because it is used as the main title
      if (index > 0) {
        !!contentBlock.title &&
          section.push(
            <Wrapper key={`${index}-${contentBlock.id}-title`}>
              <BoldText>{contentBlock.title}</BoldText>
            </Wrapper>
          );
      }

      !!contentBlock.intro &&
        section.push(
          <WrapperHorizontal key={`${index}-${contentBlock.id}-intro`}>
            <HtmlView
              html={trimNewLines(`<div>${contentBlock.intro}</div>`)}
              tagsStyles={{ div: { fontFamily: 'titillium-web-bold' } }}
            />
          </WrapperHorizontal>
        );

      // skip images for the first content block because they are rendered as main images
      if (index > 0) {
        !!contentBlock.mediaContents &&
          !!contentBlock.mediaContents.length &&
          _filter(
            contentBlock.mediaContents,
            (mediaContent) =>
              mediaContent.contentType === 'image' || mediaContent.contentType === 'thumbnail'
          ).map((mediaContent) => {
            !!mediaContent.sourceUrl &&
              !!mediaContent.sourceUrl.url &&
              sectionImages.push({ picture: { uri: mediaContent.sourceUrl.url } });
          });
      }

      !!sectionImages &&
        sectionImages.length > 1 &&
        section.push(
          <ImagesCarousel data={sectionImages} key={`${index}-${contentBlock.id}-imagesCarousel`} />
        );
      !!sectionImages &&
        sectionImages.length === 1 &&
        section.push(
          <Image source={sectionImages[0].picture} key={`${index}-${contentBlock.id}-image`} />
        );

      (!settings ||
        (!!settings && !!settings.displayOnlySummary && settings.displayOnlySummary == 'false')) &&
        !!contentBlock.body &&
        section.push(
          <WrapperHorizontal key={`${index}-${contentBlock.id}-body`}>
            <HtmlView html={trimNewLines(contentBlock.body)} />
          </WrapperHorizontal>
        );

      !!contentBlock.mediaContents &&
        !!contentBlock.mediaContents.length &&
        _filter(
          contentBlock.mediaContents,
          (mediaContent) =>
            mediaContent.contentType === 'video' || mediaContent.contentType === 'audio'
        ).map((mediaContent) => {
          !!mediaContent.sourceUrl &&
            !!mediaContent.sourceUrl.url &&
            section.push(
              <WrapperHorizontal key={`${index}-${contentBlock.id}-mediaContent${mediaContent.id}`}>
                <WebView
                  source={{ html: trimNewLines(mediaContent.sourceUrl.url) }}
                  style={styles.iframeWebView}
                  scrollEnabled={false}
                  bounces={false}
                  injectedJavaScript={INJECTED_JAVASCRIPT_FOR_IFRAME_WEBVIEW}
                  startInLoadingState
                  renderLoading={() => (
                    <LoadingContainer>
                      <ActivityIndicator color={colors.accent} />
                    </LoadingContainer>
                  )}
                />
              </WrapperHorizontal>
            );
        });

      !!settings &&
        !!settings.displayOnlySummary &&
        settings.displayOnlySummary == 'true' &&
        !!settings.onlySummaryLinkText &&
        section.push(
          <WrapperHorizontal key={`${index}-${contentBlock.id}-onlySummaryLinkText`}>
            <Button title={settings.onlySummaryLinkText} onPress={openWebScreen} />
          </WrapperHorizontal>
        );

      story.push(<View key={`${index}-${contentBlock.id}`}>{section}</View>);
    });
  }

  return (
    <View>
      {!!mainImages && mainImages.length > 1 && <ImagesCarousel data={mainImages} />}
      {!!mainImages && mainImages.length === 1 && <Image source={mainImages[0].picture} />}

      {!!title && !!link ? (
        <TitleContainer>
          <Touchable onPress={openWebScreen}>
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
      </Wrapper>

      {!!story && story}
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  iframeWebView: {
    height: normalize(210),
    width: '100%'
  }
});

NewsItem.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired
};
