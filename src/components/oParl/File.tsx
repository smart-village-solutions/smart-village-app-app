/* eslint-disable complexity */
import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { formatSize, momentFormat } from '../../helpers';
import {
  AgendaItemPreviewData,
  FileData,
  FilePreviewData,
  MeetingPreviewData,
  OParlObjectType
} from '../../types';
import { PreviewSection } from '../PreviewSection';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';
import { AgendaItemPreview, FilePreview, MeetingPreview } from './previews';
import { LicenseSection, WebRepresentation } from './sections';

type Props = {
  data: FileData;
  navigation: NavigationScreenProp<never>;
};

const { file: fileTexts } = texts.oparl;

export const File = ({ data, navigation }: Props) => {
  const {
    accessUrl,
    agendaItem,
    date,
    derivativeFile,
    downloadUrl,
    externalServiceUrl,
    fileLicense,
    fileName,
    masterFile,
    meeting,
    mimeType,
    name,
    sha1Checksum,
    size,
    text,
    web
  } = data;

  // TODO Types of renderPreview functions
  const renderFilePreview = useCallback(
    (data: FilePreviewData, key: number) => (
      <FilePreview {...data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  const renderAgendaItemPreview = useCallback(
    (data: AgendaItemPreviewData, key: number) => (
      <AgendaItemPreview {...data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  const renderMeetingPreview = useCallback(
    (data: MeetingPreviewData, key: number) => (
      <MeetingPreview {...data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  return (
    <Wrapper>
      {!!name && (
        <WrapperRow>
          <BoldText>{texts.oparl.name}</BoldText>
        </WrapperRow>
      )}
      {!!mimeType && (
        <WrapperRow>
          <BoldText>{fileTexts.mimeType}</BoldText>
          <RegularText>{mimeType}</RegularText>
        </WrapperRow>
      )}
      {!!size && (
        <WrapperRow>
          <BoldText>{fileTexts.size}</BoldText>
          <RegularText>{formatSize(size)}</RegularText>
        </WrapperRow>
      )}
      <WrapperRow>
        <BoldText>{fileTexts.accessUrl}</BoldText>
        <RegularText selectable>{accessUrl}</RegularText>
      </WrapperRow>
      {!!downloadUrl && (
        <WrapperRow>
          <BoldText>{fileTexts.downloadUrl}</BoldText>
          <RegularText selectable>{downloadUrl}</RegularText>
        </WrapperRow>
      )}
      {!!externalServiceUrl && (
        <WrapperRow>
          <BoldText>{fileTexts.externalServiceUrl}</BoldText>
          <RegularText selectable>{externalServiceUrl}</RegularText>
        </WrapperRow>
      )}
      {!!masterFile && (
        <FilePreview
          type={OParlObjectType.File}
          id={masterFile.id}
          accessUrl={masterFile.accessUrl}
          fileName={masterFile.fileName}
          mimeType={masterFile.mimeType}
          name={masterFile.name}
          navigation={navigation}
          size={masterFile.size}
        />
      )}
      {!!derivativeFile?.length && (
        <PreviewSection
          data={derivativeFile}
          header={<BoldText>{fileTexts.derivativeFile}</BoldText>}
          renderItem={renderFilePreview}
        />
      )}
      {!!meeting?.length && (
        <PreviewSection
          data={meeting}
          header={<BoldText>{fileTexts.meetings}</BoldText>}
          renderItem={renderMeetingPreview}
        />
      )}
      {!!agendaItem?.length && (
        <PreviewSection
          data={agendaItem}
          header={<BoldText>{fileTexts.agendaItems}</BoldText>}
          renderItem={renderAgendaItemPreview}
        />
      )}
      <LicenseSection license={fileLicense} />
      {!!date && (
        <WrapperRow>
          <BoldText>{fileTexts.date}</BoldText>
          <RegularText>{momentFormat(date.valueOf(), 'DD.MM.YYYY', 'x')}</RegularText>
        </WrapperRow>
      )}
      {!!sha1Checksum && (
        <WrapperRow>
          <BoldText>{fileTexts.sha1Checksum}</BoldText>
          <RegularText>{text}</RegularText>
        </WrapperRow>
      )}
      <WebRepresentation name={name || fileName || accessUrl} navigation={navigation} web={web} />
      {!!text && (
        <>
          <BoldText>{fileTexts.text}</BoldText>
          <RegularText>{text}</RegularText>
        </>
      )}
    </Wrapper>
  );
};
