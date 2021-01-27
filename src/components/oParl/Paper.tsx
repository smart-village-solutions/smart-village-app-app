import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { momentFormat } from '../../helpers';
import { PaperData } from '../../types';
import { BoldText } from '../Text';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import { BodyPreview, FilePreview } from './previews';
import {
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: PaperData;
  navigation: NavigationScreenProp<never>;
};

const paperTexts = texts.oparl.paper;

export const Paper = ({ data, navigation }: Props) => {
  const {
    auxiliaryFile,
    body,
    consultation,
    created,
    date,
    deleted,
    keyword,
    location,
    mainFile,
    modified,
    name,
    originatorOrganization,
    originatorPerson,
    paperType,
    reference,
    relatedPaper,
    subordinatedPaper,
    superordinatedPaper,
    underDirectionOf,
    web
  } = data;

  return (
    <Wrapper>
      <LineEntry left={paperTexts.name} right={name} />
      <LineEntry left={paperTexts.reference} right={reference} />
      <LineEntry left={paperTexts.paperType} right={paperType} />
      <LineEntry
        left={paperTexts.date}
        right={date ? momentFormat(date.valueOf(), undefined, 'x') : undefined}
      />
      <OParlPreviewSection
        data={consultation}
        header={paperTexts.consultation}
        navigation={navigation}
        additionalProps={{ withAgendaItem: true }}
      />
      <OParlPreviewSection
        data={relatedPaper}
        header={paperTexts.relatedPaper}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={subordinatedPaper}
        header={paperTexts.subOrdinatedPaper}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={superordinatedPaper}
        header={paperTexts.superOrdinatedPaper}
        navigation={navigation}
      />
      {!!mainFile && (
        <>
          <BoldText>{paperTexts.mainFile}</BoldText>
          <FilePreview data={mainFile} navigation={navigation} />
        </>
      )}
      <OParlPreviewSection
        data={auxiliaryFile}
        header={paperTexts.auxiliaryFile}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={underDirectionOf}
        header={paperTexts.underDirectionOf}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={originatorPerson}
        header={paperTexts.originatorPerson}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={originatorOrganization}
        header={paperTexts.originatorOrganization}
        navigation={navigation}
      />
      <OParlPreviewSection data={location} header={paperTexts.location} navigation={navigation} />
      {!!body && (
        <>
          <BoldText>{paperTexts.body}</BoldText>
          <BodyPreview data={body} navigation={navigation} />
        </>
      )}
      <KeywordSection keyword={keyword} />
      <WebRepresentation name={name || paperTexts.paper} navigation={navigation} web={web} />
      <ModifiedSection created={created} deleted={deleted} modified={modified} />
    </Wrapper>
  );
};
