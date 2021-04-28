import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { formatSize, momentFormat } from '../../helpers';
import { FileData } from '../../types';
import { SectionHeader } from '../SectionHeader';
import { Wrapper, WrapperHorizontal } from '../Wrapper';
import { Line, LineEntry } from './LineEntry';
import {
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: FileData;
  navigation: NavigationScreenProp<never>;
};

const fileTexts = texts.oparl.file;

const leftWidth = 110;

export const File = ({ data, navigation }: Props) => {
  const {
    accessUrl,
    agendaItem,
    created,
    date,
    deleted,
    derivativeFile,
    downloadUrl,
    externalServiceUrl,
    fileLicense,
    keyword,
    fileName,
    license,
    masterFile,
    meeting,
    mimeType,
    modified,
    name,
    sha1Checksum,
    sha512Checksum,
    size,
    text,
    web
  } = data;

  return (
    <>
      <Line left={fileTexts.name} right={name} fullText leftWidth={leftWidth} />
      <Line left={fileTexts.fileName} right={fileName} leftWidth={leftWidth} />
      <Line left={fileTexts.mimeType} right={mimeType} leftWidth={leftWidth} />
      <Line
        left={fileTexts.size}
        right={size ? formatSize(size) : undefined}
        leftWidth={leftWidth}
      />
      <Line
        left={fileTexts.date}
        right={date ? momentFormat(date, 'DD.MM.YYYY', 'x') : undefined}
        leftWidth={leftWidth}
      />
      <Line left={fileTexts.fileLicense} right={fileLicense} leftWidth={leftWidth} />
      <Line left={fileTexts.text} right={text} fullText leftWidth={leftWidth} />

      <OParlPreviewSection
        data={masterFile}
        header={fileTexts.masterFile}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={derivativeFile}
        header={fileTexts.derivativeFile}
        navigation={navigation}
      />
      <OParlPreviewSection data={meeting} header={fileTexts.meetings} navigation={navigation} />
      <OParlPreviewSection
        data={agendaItem}
        header={fileTexts.agendaItems}
        navigation={navigation}
      />
      <SectionHeader title={fileTexts.urls} />
      {!!(accessUrl || downloadUrl || externalServiceUrl) && (
        <Wrapper>
          <LineEntry
            left={fileTexts.accessUrl}
            right={accessUrl !== downloadUrl ? accessUrl : undefined}
            selectable
            fullText
          />
          <LineEntry left={fileTexts.downloadUrl} right={downloadUrl} selectable fullText />
          <LineEntry
            left={fileTexts.externalServiceUrl}
            right={externalServiceUrl}
            selectable
            fullText
          />
          <LineEntry left={fileTexts.sha1Checksum} right={sha1Checksum} fullText />
          <LineEntry left={fileTexts.sha512Checksum} right={sha512Checksum} fullText />
        </Wrapper>
      )}
      <WrapperHorizontal>
        <KeywordSection keyword={keyword} />
        <LineEntry left={fileTexts.license} right={license} />
        <WebRepresentation
          name={name?.length ? name : fileTexts.file}
          navigation={navigation}
          web={web}
        />
        <ModifiedSection created={created} deleted={deleted} modified={modified} />
      </WrapperHorizontal>
    </>
  );
};
