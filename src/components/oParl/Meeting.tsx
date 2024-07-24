import { StackNavigationProp } from '@react-navigation/stack';
import { isNumber } from 'lodash';
import React from 'react';

import { texts } from '../../config';
import { MeetingData } from '../../types';
import { BoldText } from '../Text';
import { Wrapper, WrapperHorizontal, WrapperRow } from '../Wrapper';

import { FormattedLocation } from './previews';
import { Row, SimpleRow } from './Row';
import {
  DateSection,
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: MeetingData;
  navigation: StackNavigationProp<any>;
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

  const sortedAgendaItems = agendaItem
    ? [...agendaItem].sort((a, b) => {
        if (isNumber(a.order) && isNumber(b.order)) return a.order - b.order;
        return 0;
      })
    : undefined;

  const formattedLocation = location && <FormattedLocation location={location} />;

  return (
    <>
      {cancelled && (
        <WrapperRow center>
          <Wrapper>
            <BoldText>{meetingTexts.cancelled}</BoldText>
          </Wrapper>
        </WrapperRow>
      )}
      <WrapperHorizontal>
        <Row left={meetingTexts.name} right={name} fullText topDivider />
        <DateSection endDate={end} startDate={start} topDivider={!name} />
        <Row
          left={meetingTexts.location}
          right={formattedLocation}
          onPress={() => {
            navigation.push('OParlDetail', {
              type: location?.type,
              id: location?.id,
              title: texts.oparl.location.location
            });
          }}
        />
        <Row left={meetingTexts.meetingState} right={meetingState} />
      </WrapperHorizontal>
      <OParlPreviewSection
        data={sortedAgendaItems}
        header={meetingTexts.agendaItem}
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
      <Wrapper>
        <KeywordSection keyword={keyword} />
        <SimpleRow left={meetingTexts.license} right={license} />
        <WebRepresentation name={name || meetingTexts.meeting} navigation={navigation} web={web} />
        <ModifiedSection created={created} deleted={deleted} modified={modified} />
      </Wrapper>
    </>
  );
};
