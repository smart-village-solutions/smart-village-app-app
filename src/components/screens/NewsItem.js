import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { consts } from '../../config';
import { matomoTrackingString, momentFormatUtcToLocal, trimNewLines } from '../../helpers';
import { useMatomoTrackScreenView, useOpenWebScreen } from '../../hooks';
import { DataProviderButton } from '../DataProviderButton';
import { ImageSection } from '../ImageSection';
import { SectionHeader } from '../SectionHeader';
import { StorySection } from '../StorySection';
import { HeadlineText, RegularText } from '../Text';
import { Wrapper, WrapperRow, WrapperVertical } from '../Wrapper';

const { MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const NewsItem = ({ data, route }) => {
  const { dataProvider, mainTitle, contentBlocks, publishedAt, sourceUrl, settings, categories } =
    data;

  const logo = dataProvider && dataProvider.logo && dataProvider.logo.url;
  const link = sourceUrl && sourceUrl.url;
  const subtitle = dataProvider && dataProvider.name;
  // the title of a news item is either a given main title or the title from the first content block
  const title = mainTitle || (!!contentBlocks && !!contentBlocks.length && contentBlocks[0].title);
  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? '';
  const shareContent = route.params?.shareContent;

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle, link, rootRouteName, shareContent);

  // the categories of a news item can be nested and we need the map of all names of all categories
  const categoryNames = categories && categories.map((category) => category.name).join(' / ');

  useMatomoTrackScreenView(
    matomoTrackingString([
      MATOMO_TRACKING.SCREEN_VIEW.NEWS_ITEMS,
      dataProvider && dataProvider.name,
      categoryNames,
      title
    ])
  );

  const businessAccount = dataProvider?.dataType === 'business_account';

  return (
    <View>
      {!!subtitle && (
        <WrapperVertical style={styles.noPaddingBottom}>
          <WrapperRow center>
            <HeadlineText smaller uppercase>
              {subtitle}
            </HeadlineText>
          </WrapperRow>
        </WrapperVertical>
      )}

      <WrapperRow center>
        <SectionHeader big center title={trimNewLines(title)} />
      </WrapperRow>

      {!!momentFormatUtcToLocal(publishedAt) && (
        <Wrapper center>
          <WrapperRow center>
            <RegularText>{momentFormatUtcToLocal(publishedAt)}</RegularText>
          </WrapperRow>
        </Wrapper>
      )}

      {/* the images from the first content block will be present in the main image carousel */}
      <ImageSection mediaContents={contentBlocks?.[0]?.mediaContents} />

      {!!contentBlocks?.length &&
        contentBlocks.map((contentBlock, index) => (
          <StorySection
            key={`${contentBlock.id}-${index}`}
            contentBlock={contentBlock}
            index={index}
            openWebScreen={openWebScreen}
            settings={settings}
          />
        ))}

      {!!businessAccount && <DataProviderButton dataProvider={dataProvider} />}
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  noPaddingBottom: {
    paddingBottom: 0
  }
});

NewsItem.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
