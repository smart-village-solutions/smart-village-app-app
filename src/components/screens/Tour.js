import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { View } from 'react-native';

import { consts, device, Icon, normalize, texts } from '../../config';
import { matomoTrackingString } from '../../helpers';
import { useMatomoTrackScreenView, useOpenWebScreen } from '../../hooks';
import { ARModal } from '../augmentedReality';
import { Button } from '../Button';
import { DataProviderButton } from '../DataProviderButton';
import { DataProviderNotice } from '../DataProviderNotice';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { InfoCard } from '../infoCard';
import { Logo } from '../Logo';
import { RegularText } from '../Text';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow, WrapperWithOrientation } from '../Wrapper';

import { OperatingCompany } from './OperatingCompany';
import { TourCard } from './TourCard';

const { MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const Tour = ({ data, route }) => {
  const {
    addresses,
    category,
    categories,
    contact,
    dataProvider,
    description,
    lengthKm,
    mediaContents,
    operatingCompany,
    title,
    webUrls
  } = data;
  // action to open source urls
  const openWebScreen = useOpenWebScreen(
    route.params?.title ?? '',
    undefined,
    route.params?.rootRouteName
  );

  const logo = dataProvider && dataProvider.logo && dataProvider.logo.url;
  // the categories of a news item can be nested and we need the map of all names of all categories
  const categoryNames = categories && categories.map((category) => category.name).join(' / ');

  // TODO: DEVELOP! - it will be deleted, it was only made to development!
  let augmentedReality = true;
  const [isModalVisible, setIsModalVisible] = useState(false);

  useMatomoTrackScreenView(
    matomoTrackingString([
      MATOMO_TRACKING.SCREEN_VIEW.TOURS,
      dataProvider && dataProvider.name,
      categoryNames,
      title
    ])
  );

  const businessAccount = dataProvider?.dataType === 'business_account';
  const a11yText = consts.a11yLabel;
  return (
    <View>
      <ImageSection mediaContents={mediaContents} />

      {/* TODO: hard code was written just to development it. 
                it will be edited later 
                & component to be relocated */}
      {!!augmentedReality && (
        <Wrapper>
          <Touchable>
            <WrapperRow spaceBetween>
              <RegularText>Was ist Augmented Reality (AR)?</RegularText>
              <Icon.ArrowRight />
            </WrapperRow>
          </Touchable>

          <View style={{ marginTop: normalize(20) }}>
            <Button
              onPress={() => setIsModalVisible(!isModalVisible)}
              invert
              title="Kunstwerke laden"
            />
          </View>
        </Wrapper>
      )}

      <WrapperWithOrientation>
        {!!title && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`(${title}) ${a11yText.heading}`}>{title}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
          </View>
        )}

        <Wrapper>
          {!!logo && <Logo source={{ uri: logo }} />}

          <InfoCard category={category} addresses={addresses} contact={contact} webUrls={webUrls} />
        </Wrapper>

        <TourCard lengthKm={lengthKm} addresses={addresses} />

        {!!description && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`(${texts.tour.description}) ${a11yText.heading}`}>
                {texts.tour.description}
              </Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <Wrapper>
              <HtmlView html={description} openWebScreen={openWebScreen} />
            </Wrapper>
          </View>
        )}

        <OperatingCompany
          openWebScreen={openWebScreen}
          operatingCompany={operatingCompany}
          title={texts.tour.operatingCompany}
        />

        <DataProviderNotice dataProvider={dataProvider} openWebScreen={openWebScreen} />

        {!!businessAccount && <DataProviderButton dataProvider={dataProvider} />}

        {/* TODO: hard code was written just to development it. 
                  it will be edited later */}
        <ARModal
          isListView
          item={{
            DOWNLOAD_TYPE: 'downloaded',
            progress: 0,
            progressSize: 0,
            size: 0,
            title: 'test',
            totalSize: 0
          }}
          isModalVisible={isModalVisible}
          onModalVisible={() => setIsModalVisible(!isModalVisible)}
        />
      </WrapperWithOrientation>
    </View>
  );
};
/* eslint-enable complexity */

Tour.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object,
  route: PropTypes.object.isRequired
};
