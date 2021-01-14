/* eslint-disable complexity */
import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { texts } from '../../config';

import { AgendaItemData, FilePreviewData } from '../../types';
import { PreviewSection } from '../PreviewSection';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';
import { ConsultationPreview, FilePreview, MeetingPreview } from './previews';
import { DateSection, KeywordSection, WebRepresentation } from './sections';

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

  const renderFilePreview = useCallback(
    (item: FilePreviewData, key: number) => (
      <FilePreview {...item} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  return (
    <Wrapper>
      {!!name?.length && (
        <WrapperRow>
          <BoldText>{agendaItemTexts.name}</BoldText>
          <RegularText>{name}</RegularText>
        </WrapperRow>
      )}
      {!!meeting && (
        <>
          <BoldText>{agendaItemTexts.meeting}</BoldText>
          <MeetingPreview {...meeting} navigation={navigation} />
        </>
      )}
      {!!number?.length && (
        <WrapperRow>
          <BoldText>{agendaItemTexts.number}</BoldText>
          <RegularText>{number}</RegularText>
        </WrapperRow>
      )}
      <DateSection endDate={end} startDate={start} withTime />
      {typeof isPublic !== undefined && (
        <WrapperRow>
          <BoldText>{agendaItemTexts.public}</BoldText>
          <RegularText>
            {isPublic ? agendaItemTexts.isPublic : agendaItemTexts.isNotPublic}
          </RegularText>
        </WrapperRow>
      )}
      {!!consultation && (
        <>
          <ConsultationPreview {...consultation} navigation={navigation} />
        </>
      )}
      {!!auxilaryFile?.length && (
        <PreviewSection
          data={auxilaryFile}
          header={<BoldText>{agendaItemTexts.auxiliaryFile}</BoldText>}
          renderItem={renderFilePreview}
        />
      )}
      {!!result?.length && (
        <WrapperRow>
          <BoldText>{agendaItemTexts.result}</BoldText>
          <RegularText>{result}</RegularText>
        </WrapperRow>
      )}
      {!!resolutionFile && (
        <>
          <BoldText>{agendaItemTexts.resolutionFile}</BoldText>
          <FilePreview {...resolutionFile} navigation={navigation} />
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
