import React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { texts } from '../../config';
import { MeetingData } from '../../types';
import { BoldText } from '../Text';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import {
  DateSection,
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

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
    license,
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

  return (
    <Wrapper>
      {cancelled && <BoldText>{meetingTexts.cancelled}</BoldText>}
      <LineEntry left={meetingTexts.name} right={name} />
      <LineEntry left={meetingTexts.meetingState} right={meetingState} />
      <DateSection endDate={end} startDate={start} withTime />
      <OParlPreviewSection
        data={agendaItem}
        header={meetingTexts.agendaItem}
        navigation={navigation}
        additionalProps={{ withNumberAndTime: true }}
      />
      <OParlPreviewSection data={location} header={meetingTexts.location} navigation={navigation} />
      <OParlPreviewSection
        data={invitation}
        header={meetingTexts.invitation}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={resultsProtocol}
        header={meetingTexts.resultsProtocol}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={verbatimProtocol}
        header={meetingTexts.verbatimProtocol}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={auxiliaryFile}
        header={meetingTexts.auxiliaryFile}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={organization}
        header={meetingTexts.organization}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={participant}
        header={meetingTexts.participant}
        navigation={navigation}
      />
      <KeywordSection keyword={keyword} />
      <LineEntry left={meetingTexts.license} right={license} />
      <WebRepresentation
        name={name?.length ? name : meetingTexts.meeting}
        navigation={navigation}
        web={web}
      />
      <ModifiedSection created={created} deleted={deleted} modified={modified} />
    </Wrapper>
  );
};
