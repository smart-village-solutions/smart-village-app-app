import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { texts } from '../../config';
import { AgendaItemData } from '../../types';
import { Wrapper, WrapperHorizontal } from '../Wrapper';

import { Row, SimpleRow } from './Row';
import {
  DateSection,
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: AgendaItemData;
  navigation: StackNavigationProp<any>;
};

const agendaItemTexts = texts.oparl.agendaItem;

const leftWidth = 140;

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
      <WrapperHorizontal>
        <Row left={agendaItemTexts.name} right={name} leftWidth={leftWidth} fullText />
        <Row left={agendaItemTexts.number} right={number} leftWidth={leftWidth} />
        {isPublic !== undefined && (
          <Row
            left={agendaItemTexts.public}
            right={isPublic ? agendaItemTexts.isPublic : agendaItemTexts.isNotPublic}
            leftWidth={leftWidth}
          />
        )}
        <Row left={agendaItemTexts.result} right={result} leftWidth={leftWidth} fullText />
        <Row
          left={agendaItemTexts.resolutionText}
          right={resolutionText}
          leftWidth={leftWidth}
          fullText
        />
        <DateSection endDate={end} startDate={start} topDivider={false} leftWidth={leftWidth} />
      </WrapperHorizontal>
      <OParlPreviewSection
        data={meeting}
        header={agendaItemTexts.meeting}
        navigation={navigation}
      />
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
        <SimpleRow left={agendaItemTexts.license} right={license} />
        <WebRepresentation
          name={name || agendaItemTexts.agendaItem}
          navigation={navigation}
          web={web}
        />
        <ModifiedSection created={created} modified={modified} deleted={deleted} />
      </Wrapper>
    </>
  );
};
