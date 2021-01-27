import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { AgendaItemData } from '../../types';
import { BoldText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import { ConsultationPreview, FilePreview, MeetingPreview } from './previews';
import { DateSection, KeywordSection, WebRepresentation } from './sections';
import { OParlPreviewSection } from './sections';

type Props = {
  data: AgendaItemData;
  navigation: NavigationScreenProp<never>;
};

const agendaItemTexts = texts.oparl.agendaItem;

export const AgendaItem = ({ data, navigation }: Props) => {
  const {
    auxilaryFile,
    consultation,
    end,
    keyword,
    meeting,
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
    <Wrapper>
      <LineEntry left={agendaItemTexts.name} right={name} />
      {!!meeting && (
        <>
          <BoldText>{agendaItemTexts.meeting}</BoldText>
          <MeetingPreview data={meeting} navigation={navigation} />
        </>
      )}
      <LineEntry left={agendaItemTexts.number} right={number} />
      <DateSection endDate={end} startDate={start} withTime />
      {isPublic !== undefined && (
        <LineEntry
          left={agendaItemTexts.public}
          right={isPublic ? agendaItemTexts.isPublic : agendaItemTexts.isNotPublic}
        />
      )}
      {!!consultation && (
        <>
          <BoldText>{agendaItemTexts.consultation}</BoldText>
          <ConsultationPreview data={consultation} navigation={navigation} />
        </>
      )}
      <OParlPreviewSection
        data={auxilaryFile}
        header={agendaItemTexts.auxiliaryFile}
        navigation={navigation}
      />
      <LineEntry left={agendaItemTexts.result} right={result} />
      {!!resolutionFile && (
        <>
          <BoldText>{agendaItemTexts.resolutionFile}</BoldText>
          <FilePreview data={resolutionFile} navigation={navigation} />
        </>
      )}
      {!!resolutionText?.length && (
        <>
          <BoldText>{agendaItemTexts.resolutionText}</BoldText>
          <RegularText>{resolutionText}</RegularText>
        </>
      )}
      <KeywordSection keyword={keyword} />
      <WebRepresentation
        name={name?.length ? name : agendaItemTexts.agendaItem}
        navigation={navigation}
        web={web}
      />
    </Wrapper>
  );
};
