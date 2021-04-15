import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { AgendaItemData } from '../../types';
import { SectionHeader } from '../SectionHeader';
import { Wrapper } from '../Wrapper';
import { Line, LineEntry } from './LineEntry';
import {
  DateSection,
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: AgendaItemData;
  navigation: NavigationScreenProp<never>;
};

const agendaItemTexts = texts.oparl.agendaItem;

const leftWidth = 180;

export const AgendaItem = ({ data, navigation }: Props) => {
  const {
    auxilaryFile,
    created,
    consultation,
    deleted,
    end,
    keyword,
    license,
    meeting,
    modified,
    name,
    number,
    public: isPublic,
    resolutionFile,
    resolutionText,
    result,
    start,
    web
  } = data;

  return (
    <>
      <SectionHeader title={name?.length ? name : agendaItemTexts.agendaItem} />
      <Line left={agendaItemTexts.number} right={number} leftWidth={leftWidth} />
      {isPublic !== undefined && (
        <Line
          left={agendaItemTexts.public}
          right={isPublic ? agendaItemTexts.isPublic : agendaItemTexts.isNotPublic}
          leftWidth={leftWidth}
        />
      )}
      <Line left={agendaItemTexts.result} right={result} leftWidth={leftWidth} fullText />
      <Line
        left={agendaItemTexts.resolutionText}
        right={resolutionText}
        leftWidth={leftWidth}
        fullText
      />
      <OParlPreviewSection
        data={meeting}
        header={agendaItemTexts.meeting}
        navigation={navigation}
      />
      <DateSection endDate={end} startDate={start} />
      <OParlPreviewSection
        data={consultation}
        header={agendaItemTexts.consultation}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={auxilaryFile}
        header={agendaItemTexts.auxiliaryFile}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={resolutionFile}
        header={agendaItemTexts.resolutionFile}
        navigation={navigation}
      />
      <Wrapper>
        <KeywordSection keyword={keyword} />
        <LineEntry left={agendaItemTexts.license} right={license} />
        <WebRepresentation
          name={name?.length ? name : agendaItemTexts.agendaItem}
          navigation={navigation}
          web={web}
        />
        <ModifiedSection created={created} modified={modified} deleted={deleted} />
      </Wrapper>
    </>
  );
};
