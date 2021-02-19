import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';

import { device, texts } from '../config';
import { momentFormat, trimNewLines } from '../helpers';
import { isContact } from '../jsonValidation';
import { ImageSection } from './ImageSection';
import { InfoCard } from './infoCard';
import { Logo } from './Logo';
import { StorySection } from './StorySection';
import { BoldText, RegularText } from './Text';
import { Title, TitleContainer, TitleShadow } from './Title';
import { Touchable } from './Touchable';
import { Wrapper, WrapperRow, WrapperWithOrientation, WrapperWrap } from './Wrapper';

// eslint-disable-next-line complexity
export const Offer = ({ data, navigation }) => {
  const {
    contentBlocks,
    dataProvider,
    payload,
    pointOfInterestData,
    publishedAt,
    sourceUrl,
    title
  } = data;

  const link = sourceUrl?.url;
  const rootRouteName = navigation.getParam('rootRouteName', '');
  const headerTitle = navigation.getParam('title', '');

  // action to open source urls
  const openWebScreen = (webUrl) =>
    navigation.navigate({
      routeName: 'Web',
      params: {
        title: headerTitle,
        webUrl: !!webUrl && typeof webUrl === 'string' ? webUrl : link,
        rootRouteName
      }
    });

  const logo = pointOfInterestData?.mediaContents?.find(
    (mediaContent) => mediaContent.itemType === 'logo'
  ).sourceUrl?.url;

  const operatingCompany = pointOfInterestData?.operatingCompany;
  const contact = payload?.contact;
  const expirationDate = payload?.expirationDate;

  return (
    <View>
      {/* the images from the first content block will be present in the main image carousel */}
      <ImageSection mediaContents={contentBlocks?.[0]?.mediaContents} />

      <WrapperWithOrientation>
        {!!title && !!link ? (
          <TitleContainer>
            <Touchable onPress={openWebScreen}>
              <Title accessibilityLabel={`${trimNewLines(title)} (Überschrift)`}>
                {trimNewLines(title)}
              </Title>
            </Touchable>
          </TitleContainer>
        ) : (
          !!title && (
            <TitleContainer>
              <Title accessibilityLabel={`${trimNewLines(title)} (Überschrift)`}>
                {trimNewLines(title)}
              </Title>
            </TitleContainer>
          )
        )}
        {device.platform === 'ios' && <TitleShadow />}
        {!!dataProvider?.name && (
          <Wrapper>
            <RegularText small>{dataProvider.name}</RegularText>
          </Wrapper>
        )}

        {typeof payload?.employmentType === 'string' && (
          <Wrapper>
            <WrapperWrap>
              <BoldText>{texts.job.employmentType}</BoldText>
              <RegularText>{payload.employmentType}</RegularText>
            </WrapperWrap>
          </Wrapper>
        )}

        {!!publishedAt && (
          <Wrapper>
            <WrapperRow>
              <BoldText>{texts.job.publishedAt}</BoldText>
              <RegularText>{momentFormat(publishedAt)}</RegularText>
            </WrapperRow>
          </Wrapper>
        )}

        {!!expirationDate && (
          <Wrapper>
            <WrapperRow>
              <BoldText>{texts.job.expirationDate}</BoldText>
              <RegularText>{momentFormat(expirationDate)}</RegularText>
            </WrapperRow>
          </Wrapper>
        )}

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

        {isContact(contact) && <InfoCard contact={contact} />}

        {!!operatingCompany && (
          <>
            <TitleContainer>
              <Title>{texts.pointOfInterest.operatingCompany}</Title>
            </TitleContainer>
            {!!logo && <Logo source={{ uri: logo }} />}
            <Wrapper>
              <InfoCard
                name={operatingCompany.name}
                address={operatingCompany.address}
                contact={operatingCompany.contact}
                webUrls={operatingCompany.contact.webUrls}
                openWebScreen={openWebScreen}
              />
            </Wrapper>
          </>
        )}
      </WrapperWithOrientation>
    </View>
  );
};

Offer.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired
};
