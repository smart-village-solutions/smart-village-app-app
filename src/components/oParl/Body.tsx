import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { momentFormat } from '../../helpers';
import {
  BodyData,
  LegislativeTermPreviewData,
  MeetingPreviewData,
  OrganizationPreviewData,
  PaperPreviewData,
  PersonPreviewData
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
  PaperPreview,
  PersonPreview
} from './previews';
import { SystemPreview } from './previews/SystemPreview';
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
    person,
    rgs,
    shortName,
    system,
    web,
    website
  } = data;

  const onPressLicense = useCallback(() => navigation.push('Web', { webUrl: license }), [
    navigation,
    license
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
    (data: LegislativeTermPreviewData, key: number) => (
      <LegislativeTermPreview data={data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  const renderMeetingPreview = useCallback(
    (data: MeetingPreviewData, key: number) => (
      <MeetingPreview data={data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  const renderPaperPreview = useCallback(
    (data: PaperPreviewData, key: number) => (
      <PaperPreview data={data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  const renderOrganizationPreview = useCallback(
    (data: OrganizationPreviewData, key: number) => (
      <OrganizationPreview data={data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  const renderPersonPreview = useCallback(
    (data: PersonPreviewData, key: number) => (
      <PersonPreview data={data} key={key} navigation={navigation} />
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
        header={bodyTexts.legislativeTerm}
        renderItem={renderLegislativeTermPreview}
      />
      <PreviewSection data={meeting} header={bodyTexts.meeting} renderItem={renderMeetingPreview} />
      <PreviewSection data={paper} header={bodyTexts.paper} renderItem={renderPaperPreview} />
      <PreviewSection
        data={organization}
        header={bodyTexts.organization}
        renderItem={renderOrganizationPreview}
      />
      <PreviewSection data={person} header={bodyTexts.person} renderItem={renderPersonPreview} />
      {/*
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
      {!!system && (
        <>
          <BoldText>{bodyTexts.system}</BoldText>
          <SystemPreview data={system} navigation={navigation} />
        </>
      )}
      <LineEntry
        fullText
        left={bodyTexts.oparlSince}
        right={oparlSince && momentFormat(oparlSince.valueOf(), undefined, 'x')}
      />
      <PreviewSection
        data={equivalent}
        renderItem={renderEquivalentItem}
        header={bodyTexts.equivalent}
      />
      <KeywordSection keyword={keyword} />
      <WebRepresentation name={name ?? bodyTexts.body} navigation={navigation} web={web} />
      <ModifiedSection created={created} deleted={deleted} modified={modified} />
    </WrapperHorizontal>
  );
};
