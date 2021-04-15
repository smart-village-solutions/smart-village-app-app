import { isNumber } from 'lodash';
import React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { texts } from '../../config';
import { LocationPreviewData, MeetingData } from '../../types';
import { SectionHeader } from '../SectionHeader';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperHorizontal, WrapperRow } from '../Wrapper';
import { Line, LineEntry } from './LineEntry';
import { DateSection, KeywordSection, ModifiedSection, OParlPreviewSection } from './sections';

type Props = {
  data: MeetingData;
  navigation: NavigationScreenProp<never>;
};

const meetingTexts = texts.oparl.meeting;

const FormattedLocation = ({ location }: { location?: LocationPreviewData }) => {
  if (location) {
    return (
      <>
        <RegularText>{location.streetAddress}</RegularText>
        <RegularText>
          {(location.postalCode ? location.postalCode + ' ' : '') + (location.locality ?? '')}
        </RegularText>
        {!!location.room && (
          <>
            <RegularText />
            <RegularText>{location.room}</RegularText>
          </>
        )}
      </>
    );
  }
  return null;
};

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
    verbatimProtocol
  } = data;

  const sortedAgendaItems = agendaItem
    ? [...agendaItem].sort((a, b) => {
        if (isNumber(a.order) && isNumber(b.order)) return a.order - b.order;
        if (a.number?.length && b.number?.length) {
          return a.number < b.number ? -1 : 1;
        }
        return 0;
      })
    : undefined;

  return (
    <>
      <SectionHeader title={name ?? meetingTexts.meeting} />
      {cancelled && (
        <WrapperRow center>
          <Wrapper>
            <BoldText>{meetingTexts.cancelled}</BoldText>
          </Wrapper>
        </WrapperRow>
      )}
      <DateSection endDate={end} startDate={start} />
      <Line
        left={meetingTexts.location}
        right={<FormattedLocation location={location} />}
        onPress={() => {
          navigation.push('OParlDetail', { type: location?.type, id: location?.id });
        }}
      />
      <Line left={meetingTexts.meetingState} right={meetingState} />
      <OParlPreviewSection
        data={sortedAgendaItems}
        header={meetingTexts.agendaItem}
        navigation={navigation}
        additionalProps={{ withNumberAndTime: true }}
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
      <WrapperHorizontal>
        <KeywordSection keyword={keyword} />
        <LineEntry left={meetingTexts.license} right={license} />
        {/* <WebRepresentation
          name={name?.length ? name : meetingTexts.meeting}
          navigation={navigation}
          web={web}
        /> */}
        <ModifiedSection created={created} deleted={deleted} modified={modified} />
      </WrapperHorizontal>
    </>
  );
};
