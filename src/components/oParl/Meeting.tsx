import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import {
  AgendaItemPreviewData,
  FilePreviewData,
  MeetingData,
  OrganizationPreviewData,
  PersonPreviewData
} from '../../types';
import { PreviewSection } from '../PreviewSection';
import { BoldText } from '../Text';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import {
  AgendaItemPreview,
  FilePreview,
  LocationPreview,
  OrganizationPreview,
  PersonPreview
} from './previews';
import { DateSection, KeywordSection, ModifiedSection, WebRepresentation } from './sections';

type Props = {
  data: MeetingData;
  navigation: NavigationScreenProp<never>;
};

const meetingTexts = texts.oparl.meeting;

export const Meeting = ({ data, navigation }: Props) => {
  const {
    agendaItem,
    auxiliaryFile,
    cancelled,
    created,
    deleted,
    end,
    invitation,
    keyword,
    location,
    meetingState,
    modified,
    name,
    organization,
    participant,
    resultsProtocol,
    start,
    verbatimProtocol,
    web
  } = data;

  const renderAgendaItemPreview = useCallback(
    (data: AgendaItemPreviewData, key: number) => (
      <AgendaItemPreview data={data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  const renderFilePreview = useCallback(
    (data: FilePreviewData, key: number) => (
      <FilePreview data={data} key={key} navigation={navigation} />
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
    <Wrapper>
      {cancelled && <BoldText>{meetingTexts.cancelled}</BoldText>}
      <LineEntry left={meetingTexts.name} right={name} />
      <LineEntry left={meetingTexts.meetingState} right={meetingState} />
      <DateSection endDate={end} startDate={start} withTime />
      <PreviewSection
        data={agendaItem}
        header={meetingTexts.agendaItem}
        renderItem={renderAgendaItemPreview}
      />
      {!!location && (
        <>
          <BoldText>{meetingTexts.location}</BoldText>
          <LocationPreview data={location} navigation={navigation} />
        </>
      )}
      {!!invitation && (
        <>
          <BoldText>{meetingTexts.invitation}</BoldText>
          <FilePreview data={invitation} navigation={navigation} />
        </>
      )}
      {!!resultsProtocol && (
        <>
          <BoldText>{meetingTexts.resultsProtocol}</BoldText>
          <FilePreview data={resultsProtocol} navigation={navigation} />
        </>
      )}
      {!!verbatimProtocol && (
        <>
          <BoldText>{meetingTexts.verbatimProtocol}</BoldText>
          <FilePreview data={verbatimProtocol} navigation={navigation} />
        </>
      )}
      <PreviewSection
        data={auxiliaryFile}
        header={meetingTexts.auxiliaryFile}
        renderItem={renderFilePreview}
      />
      <PreviewSection
        data={organization}
        header={meetingTexts.organization}
        renderItem={renderOrganizationPreview}
      />
      <PreviewSection
        data={participant}
        header={meetingTexts.participant}
        renderItem={renderPersonPreview}
      />
      <KeywordSection keyword={keyword} />
      <WebRepresentation
        name={name?.length ? name : meetingTexts.meeting}
        navigation={navigation}
        web={web}
      />
      <ModifiedSection created={created} deleted={deleted} modified={modified} />
    </Wrapper>
  );
};
