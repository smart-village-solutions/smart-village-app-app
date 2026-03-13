import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Alert, View } from 'react-native';
import { useMutation } from 'react-apollo';

import { useProfileContext } from '../../ProfileProvider';
import { SettingsContext } from '../../SettingsProvider';
import { Icon, colors, consts, texts } from '../../config';
import { matomoTrackingString, momentFormatUtcToLocal, trimNewLines } from '../../helpers';
import { useDetailRefresh, useMatomoTrackScreenView, useOpenWebScreen } from '../../hooks';
import { DELETE_NEWS_ITEM } from '../../queries/newsItems';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';
import { Button } from '../Button';
import { DataProviderButton } from '../DataProviderButton';
import { ImageSection } from '../ImageSection';
import { SectionHeader } from '../SectionHeader';
import { StorySection } from '../StorySection';
import { HeadlineText, RegularText } from '../Text';
import { Wrapper, WrapperRow, WrapperVertical } from '../Wrapper';

const { MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const NewsItem = ({ data, navigation, refetch, route }) => {
  const { globalSettings } = useContext(SettingsContext);
  const { currentUserData, isLoggedIn } = useProfileContext();
  const { showImageRights } = globalSettings || {};
  const imageRightsPosition = showImageRights?.newsDetail?.imageRightsPosition;

  const { dataProvider, mainTitle, contentBlocks, publishedAt, sourceUrl, settings, categories } =
    data;

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
  const currentUserDataProviderId = currentUserData?.user?.data_provider_id;
  const isCurrentUser =
    isLoggedIn &&
    !!currentUserDataProviderId &&
    !!dataProvider?.id &&
    currentUserDataProviderId == dataProvider.id;
  const [deleteNewsItem] = useMutation(DELETE_NEWS_ITEM, {
    variables: { id: data.id },
    onCompleted: () => navigation.goBack()
  });

  useDetailRefresh(() => {
    refetch?.();
  });

  return (
    <View>
      {isCurrentUser && (
        <Wrapper noPaddingBottom>
          <WrapperRow spaceAround>
            <Button
              icon={<Icon.Pencil color={colors.lightestText} />}
              iconPosition="left"
              notFullWidth
              onPress={() =>
                navigation.push(ScreenName.ProfileCreateContentForm, {
                  initialData: data,
                  mode: 'edit',
                  query: QUERY_TYPES.NEWS_ITEM
                })
              }
              title={texts.noticeboard.edit}
            />
            <Button
              icon={<Icon.Trash />}
              iconPosition="left"
              invert
              notFullWidth
              onPress={() =>
                Alert.alert(texts.noticeboard.alerts.hint, texts.noticeboard.alerts.delete, [
                  {
                    text: texts.noticeboard.abort,
                    onPress: () => null,
                    style: 'cancel'
                  },
                  {
                    text: texts.noticeboard.delete,
                    onPress: () => deleteNewsItem(),
                    style: 'destructive'
                  }
                ])
              }
              title={texts.noticeboard.delete}
            />
          </WrapperRow>
        </Wrapper>
      )}

      {!!subtitle && (
        <WrapperVertical noPaddingBottom>
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
      <ImageSection
        imageRightsPosition={imageRightsPosition}
        mediaContents={contentBlocks?.[0]?.mediaContents}
      />

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

NewsItem.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object,
  refetch: PropTypes.func,
  route: PropTypes.object.isRequired
};
