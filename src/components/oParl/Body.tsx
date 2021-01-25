import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { momentFormat } from '../../helpers';
import {
  BodyData,
  LegislativeTermPreviewData,
  MeetingPreviewData,
  OrganizationPreviewData,
  PaperPreviewData
} from '../../types';
import { PreviewSection } from '../PreviewSection';

import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { WrapperHorizontal } from '../Wrapper';
import { LineEntry } from './LineEntry';
import {
  LegislativeTermPreview,
  LocationPreview,
  MeetingPreview,
  OrganizationPreview,
  PaperPreview
} from './previews';
import { ContactSection, KeywordSection, ModifiedSection, WebRepresentation } from './sections';

type Props = {
  data: BodyData;
  navigation: NavigationScreenProp<never>;
};

const { body: bodyTexts } = texts.oparl;

export const Body = ({ data, navigation }: Props) => {
  const {
    ags,
    classification,
    contactEmail,
    contactName,
    created,
    deleted,
    equivalent,
    keyword,
    legislativeTerm,
    license,
    licenseValidSince,
    location,
    meeting,
    modified,
    name,
    oparlSince,
    organization,
    paper,
    // TODO: person,
    rgs,
    shortName,
    // TODO: system,
    web,
    website
  } = data;

  const onPressLicense = useCallback(() => navigation.push('Web', { webUrl: license }), [
    navigation,
    website
  ]);

  const onPressWebsite = useCallback(() => navigation.push('Web', { webUrl: website }), [
    navigation,
    website
  ]);

  const renderEquivalentItem = useCallback(
    (url, index) => (
      <Touchable
        key={index}
        onPress={() => navigation.push('Web', { webUrl: url, title: shortName ?? name })}
      >
        <RegularText numberOfLines={1} primary>
          {url}
        </RegularText>
      </Touchable>
    ),
    [name, navigation, shortName]
  );

  const renderLegislativeTermPreview = useCallback(
    (data: LegislativeTermPreviewData, index) => (
      <LegislativeTermPreview data={data} key={index} navigation={navigation} />
    ),
    [navigation]
  );

  const renderMeetingPreview = useCallback(
    (data: MeetingPreviewData, index) => (
      <MeetingPreview data={data} key={index} navigation={navigation} />
    ),
    [navigation]
  );

  const renderPaperPreview = useCallback(
    (data: PaperPreviewData, index) => (
      <PaperPreview data={data} key={index} navigation={navigation} />
    ),
    [navigation]
  );

  const renderOrganizationPreview = useCallback(
    (data: OrganizationPreviewData, index) => (
      <OrganizationPreview data={data} key={index} navigation={navigation} />
    ),
    [navigation]
  );

  return (
    <WrapperHorizontal>
      <LineEntry left={bodyTexts.name} right={shortName ? `${shortName} (${name})` : name} />
      {!!location && (
        <>
          <BoldText>{bodyTexts.location}</BoldText>
          <LocationPreview data={location} navigation={navigation} />
        </>
      )}
      <LineEntry left={bodyTexts.website} onPress={onPressWebsite} right={website} />
      <ContactSection contactEmail={contactEmail} contactName={contactName} />
      <PreviewSection
        data={legislativeTerm}
        header={<BoldText>{bodyTexts.legislativeTerm}</BoldText>}
        renderItem={renderLegislativeTermPreview}
      />
      <PreviewSection
        data={meeting}
        header={<BoldText>{bodyTexts.meeting}</BoldText>}
        renderItem={renderMeetingPreview}
      />
      <PreviewSection
        data={paper}
        header={<BoldText>{bodyTexts.paper}</BoldText>}
        renderItem={renderPaperPreview}
      />
      <PreviewSection
        data={organization}
        header={<BoldText>{bodyTexts.organization}</BoldText>}
        renderItem={renderOrganizationPreview}
      />
      {/*
        <PersonSection />
        <PaperSection />
      */}
      <LineEntry left={bodyTexts.classification} right={classification} />
      <LineEntry left={bodyTexts.license} onPress={onPressLicense} right={license} />
      <LineEntry
        left={bodyTexts.licenseValidSince}
        onPress={onPressLicense}
        right={
          license?.length && licenseValidSince
            ? momentFormat(licenseValidSince?.valueOf(), undefined, 'x')
            : undefined
        }
      />
      <LineEntry fullText left={bodyTexts.ags} right={ags} />
      <LineEntry fullText left={bodyTexts.rgs} right={rgs} />
      {/* <SystemPreview system={system} /> */}
      <LineEntry
        fullText
        left={bodyTexts.oparlSince}
        right={oparlSince && momentFormat(oparlSince.valueOf(), undefined, 'x')}
      />
      <KeywordSection keyword={keyword} />
      <PreviewSection
        data={equivalent}
        renderItem={renderEquivalentItem}
        header={<BoldText>{bodyTexts.equivalent}</BoldText>}
      />
      <WebRepresentation name={name} navigation={navigation} web={web} />
      <ModifiedSection created={created} deleted={deleted} modified={modified} />
    </WrapperHorizontal>
  );
};
