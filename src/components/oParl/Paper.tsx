import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { momentFormat } from '../../helpers';
import {
  ConsultationPreviewData,
  FilePreviewData,
  LocationPreviewData,
  OrganizationPreviewData,
  PaperData,
  PaperPreviewData,
  PersonPreviewData
} from '../../types';
import { PreviewSection } from '../PreviewSection';
import { BoldText } from '../Text';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import {
  BodyPreview,
  ConsultationPreview,
  FilePreview,
  LocationPreview,
  OrganizationPreview,
  PaperPreview,
  PersonPreview
} from './previews';
import { KeywordSection, ModifiedSection, WebRepresentation } from './sections';

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

  const renderConsultationPreview = useCallback(
    (data: ConsultationPreviewData, key: number) => (
      <ConsultationPreview data={data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  const renderFilePreview = useCallback(
    (data: FilePreviewData, key: number) => (
      <FilePreview data={data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  const renderLocationPreview = useCallback(
    (data: LocationPreviewData, key: number) => (
      <LocationPreview data={data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  const renderOrganizationPreview = useCallback(
    (data: OrganizationPreviewData, key: number) => (
      <OrganizationPreview data={data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  const renderPaperPreview = useCallback(
    (data: PaperPreviewData, key: number) => (
      <PaperPreview data={data} key={key} navigation={navigation} />
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
      <LineEntry left={paperTexts.name} right={name} />
      <LineEntry left={paperTexts.reference} right={reference} />
      <LineEntry left={paperTexts.paperType} right={paperType} />
      <LineEntry
        left={paperTexts.date}
        right={date ? momentFormat(date.valueOf(), undefined, 'x') : undefined}
      />
      <PreviewSection
        data={consultation}
        header={paperTexts.consultation}
        renderItem={renderConsultationPreview}
      />
      <PreviewSection
        data={relatedPaper}
        header={paperTexts.relatedPaper}
        renderItem={renderPaperPreview}
      />
      <PreviewSection
        data={subordinatedPaper}
        header={paperTexts.subOrdinatedPaper}
        renderItem={renderPaperPreview}
      />
      <PreviewSection
        data={superordinatedPaper}
        header={paperTexts.superOrdinatedPaper}
        renderItem={renderPaperPreview}
      />
      {!!mainFile && (
        <>
          <BoldText>{paperTexts.mainFile}</BoldText>
          <FilePreview data={mainFile} navigation={navigation} />
        </>
      )}
      <PreviewSection
        data={auxiliaryFile}
        header={paperTexts.auxiliaryFile}
        renderItem={renderFilePreview}
      />
      <PreviewSection
        data={underDirectionOf}
        header={paperTexts.underDirectionOf}
        renderItem={renderOrganizationPreview}
      />
      <PreviewSection
        data={originatorPerson}
        header={paperTexts.originatorPerson}
        renderItem={renderPersonPreview}
      />
      <PreviewSection
        data={originatorOrganization}
        header={paperTexts.originatorOrganization}
        renderItem={renderOrganizationPreview}
      />
      <PreviewSection
        data={location}
        header={paperTexts.location}
        renderItem={renderLocationPreview}
      />
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
