import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { AgendaItemData } from '../../types';
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
  data: AgendaItemData;
  navigation: NavigationScreenProp<never>;
};

const agendaItemTexts = texts.oparl.agendaItem;

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
    order,
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
      <OParlPreviewSection
        data={meeting}
        header={agendaItemTexts.meeting}
        navigation={navigation}
      />
      <LineEntry left={agendaItemTexts.number} right={number} />
      <LineEntry left={agendaItemTexts.order} right={order} />
      <DateSection endDate={end} startDate={start} withTime />
      {isPublic !== undefined && (
        <LineEntry
          left={agendaItemTexts.public}
          right={isPublic ? agendaItemTexts.isPublic : agendaItemTexts.isNotPublic}
        />
      )}
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
      <LineEntry left={agendaItemTexts.result} right={result} />
      <OParlPreviewSection
        data={resolutionFile}
        header={agendaItemTexts.resolutionFile}
        navigation={navigation}
      />
      <LineEntry fullText left={agendaItemTexts.resolutionText} right={resolutionText} />
      <KeywordSection keyword={keyword} />
      <LineEntry left={agendaItemTexts.license} right={license} />
      <WebRepresentation
        name={name?.length ? name : agendaItemTexts.agendaItem}
        navigation={navigation}
        web={web}
      />
      <ModifiedSection created={created} modified={modified} deleted={deleted} />
    </Wrapper>
  );
};
