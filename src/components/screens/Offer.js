import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';

import { texts } from '../../config';
import { getGenericItemMatomoName, matomoTrackingString, momentFormat } from '../../helpers';
import { useMatomoTrackScreenView, useOpenWebScreen } from '../../hooks';
import { GenericType } from '../../types';
import { DataProviderButton } from '../DataProviderButton';
import { ImageSection } from '../ImageSection';
import { InfoCard } from '../infoCard';
import { Logo } from '../Logo';
import { SectionHeader } from '../SectionHeader';
import { StorySection } from '../StorySection';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow, WrapperWrap } from '../Wrapper';

import { OpeningTimesCard } from './OpeningTimesCard';
import { OperatingCompany } from './OperatingCompany';

const isImage = (mediaContent) => mediaContent.contentType === 'image';

// eslint-disable-next-line complexity
export const Offer = ({ data, route }) => {
  const {
    categories,
    companies,
    contacts,
    contentBlocks,
    dataProvider,
    dates,
    genericType,
    mediaContents,
    payload,
    publicationDate,
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
  const dataProviderLogo = dataProvider?.logo?.url;

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle, link, rootRouteName);

  const logo = mediaContents?.find((mediaContent) => mediaContent.contentType === 'logo')?.sourceUrl
    ?.url;

  const operatingCompany = companies?.[0];
  const contact = contacts?.[0];

  const businessAccount = dataProvider?.dataType === 'business_account';

  return (
    <View>
      {/* the images from the first content block will be present in the main image carousel */}
      <ImageSection mediaContents={mediaContents?.filter(isImage)} />

      {!!title && <SectionHeader title={title} onPress={link ? openWebScreen : undefined} />}
      {!!dataProviderLogo && (
        <Wrapper>
          <Logo source={{ uri: dataProviderLogo }} />
        </Wrapper>
      )}

      {!!categories?.length && (
        <Wrapper>
          <InfoCard category={categories[0]} openWebScreen={openWebScreen} />
        </Wrapper>
      )}

      {typeof payload?.employmentType === 'string' && payload?.employmentType?.length && (
        <Wrapper>
          <WrapperWrap>
            <BoldText>{texts.job.employmentType}</BoldText>
            <RegularText>{payload.employmentType}</RegularText>
          </WrapperWrap>
        </Wrapper>
      )}

      {!!publicationDate && genericType !== GenericType.Deadline && (
        <Wrapper>
          <WrapperRow>
            <BoldText>{texts.job.publishedAt}</BoldText>
            <RegularText>{momentFormat(publicationDate)}</RegularText>
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

      {!!dates && !!dates.length && (
        <View>
          <SectionHeader title={texts.eventRecord.appointments} />
          <OpeningTimesCard
            openingHours={dates.map((date) => ({ ...date, useYear: date?.useYear ?? true }))}
          />
        </View>
      )}

      {!!contact && (
        <Wrapper>
          <InfoCard contact={contact} openWebScreen={openWebScreen} />
        </Wrapper>
      )}

      <OperatingCompany
        title={texts.pointOfInterest.operatingCompany}
        logo={logo}
        operatingCompany={operatingCompany}
        openWebScreen={openWebScreen}
      />
      {!!businessAccount && <DataProviderButton dataProvider={dataProvider} />}
    </View>
  );
};

Offer.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
