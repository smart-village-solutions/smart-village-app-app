import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { formatSize, momentFormat } from '../../helpers';
import { AgendaItemPreviewData, FileData, FilePreviewData, MeetingPreviewData } from '../../types';
import { PreviewSection } from '../PreviewSection';
import { BoldText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import { AgendaItemPreview, FilePreview, MeetingPreview } from './previews';
import { WebRepresentation } from './sections';

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
      <FilePreview data={data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  const renderAgendaItemPreview = useCallback(
    (data: AgendaItemPreviewData, key: number) => (
      <AgendaItemPreview data={data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  const renderMeetingPreview = useCallback(
    (data: MeetingPreviewData, key: number) => (
      <MeetingPreview data={data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  return (
    <Wrapper>
      <LineEntry left={fileTexts.name} right={name} />
      <LineEntry left={fileTexts.mimeType} right={mimeType} />
      <LineEntry left={fileTexts.size} right={size ? formatSize(size) : undefined} />
      <LineEntry left={fileTexts.accessUrl} right={accessUrl} />
      {/* TODO: URLs? */}
      <LineEntry left={fileTexts.downloadUrl} right={downloadUrl} />
      <LineEntry left={fileTexts.externalServiceUrl} right={externalServiceUrl} />
      {!!masterFile && <FilePreview data={masterFile} navigation={navigation} />}
      {!!derivativeFile?.length && (
        <PreviewSection
          data={derivativeFile}
          header={fileTexts.derivativeFile}
          renderItem={renderFilePreview}
        />
      )}
      {!!meeting?.length && (
        <PreviewSection
          data={meeting}
          header={fileTexts.meetings}
          renderItem={renderMeetingPreview}
        />
      )}
      {!!agendaItem?.length && (
        <PreviewSection
          data={agendaItem}
          header={fileTexts.agendaItems}
          renderItem={renderAgendaItemPreview}
        />
      )}
      <LineEntry left={fileTexts.license} right={fileLicense} selectable />
      <LineEntry
        left={fileTexts.date}
        right={date ? momentFormat(date.valueOf(), 'DD.MM.YYYY', 'x') : undefined}
      />
      <LineEntry left={fileTexts.sha1Checksum} right={sha1Checksum} />
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
