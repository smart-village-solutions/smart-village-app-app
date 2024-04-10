import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { texts } from '../../../config';
import { getGenericItemMatomoName, matomoTrackingString } from '../../../helpers';
import { useMatomoTrackScreenView, useOpenWebScreen } from '../../../hooks';
import { ImageSection } from '../../ImageSection';
import { SectionHeader } from '../../SectionHeader';
import { StorySection } from '../../StorySection';
import { BoldText, HeadlineText } from '../../Text';
import { Wrapper, WrapperHorizontal, WrapperVertical } from '../../Wrapper';
import { InfoCard } from '../../infoCard';

const isImage = (mediaContent) => mediaContent.contentType === 'image';

// eslint-disable-next-line complexity
export const NoticeboardDetail = ({ data, route }) => {
  const {
    categories,
    contentBlocks,
    dataProvider,
    dates,
    genericType,
    mediaContents,
    priceInformations,
    sourceUrl,
    title
  } = data;

  useMatomoTrackScreenView(
    matomoTrackingString([
      getGenericItemMatomoName(genericType),
      dataProvider && dataProvider.name,
      title
    ])
  );

  const link = sourceUrl?.url;
  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? '';

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle, link, rootRouteName);

  return (
    <View>
      <WrapperVertical style={styles.noPaddingTop}>
        <ImageSection mediaContents={mediaContents?.filter(isImage)} />
      </WrapperVertical>

      {!!categories?.length && !!categories[0].name && (
        <WrapperHorizontal>
          <HeadlineText smaller uppercase>
            {categories[0].name}
          </HeadlineText>
        </WrapperHorizontal>
      )}

      {!!title && <SectionHeader big title={title} />}

      {!!priceInformations?.length && (
        <Wrapper style={styles.noPaddingTop}>
          <BoldText>{priceInformations[0].description}</BoldText>
        </Wrapper>
      )}

      {(!!dates?.length || !!contentBlocks?.length) && (
        <SectionHeader title={texts.noticeboard.details} />
      )}

      {!!dates?.length && (
        <Wrapper>
          <InfoCard dates={dates} />
        </Wrapper>
      )}

      {!!contentBlocks?.length && <SectionHeader title={texts.noticeboard.description} />}

      {contentBlocks?.map((contentBlock, index) => {
        return (
          <StorySection
            contentBlock={contentBlock}
            index={index}
            key={`${contentBlock.id}-${index}`}
            openWebScreen={openWebScreen}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});

NoticeboardDetail.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
