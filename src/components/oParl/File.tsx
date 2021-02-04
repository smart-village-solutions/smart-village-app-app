import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { formatSize, momentFormat } from '../../helpers';
import { FileData } from '../../types';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import { ModifiedSection, OParlPreviewSection, WebRepresentation } from './sections';

type Props = {
  data: FileData;
  navigation: NavigationScreenProp<never>;
};

const fileTexts = texts.oparl.file;

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
    <Wrapper>
      <LineEntry left={fileTexts.name} right={name} />
      <LineEntry left={fileTexts.mimeType} right={mimeType} />
      <LineEntry left={fileTexts.size} right={size ? formatSize(size) : undefined} />
      <LineEntry left={fileTexts.accessUrl} right={accessUrl} selectable />
      {/* TODO: URLs? */}
      <LineEntry left={fileTexts.downloadUrl} right={downloadUrl} selectable />
      <LineEntry left={fileTexts.externalServiceUrl} right={externalServiceUrl} selectable />
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
      <LineEntry
        left={fileTexts.date}
        right={date ? momentFormat(date.valueOf(), 'DD.MM.YYYY', 'x') : undefined}
      />
      <LineEntry left={fileTexts.sha1Checksum} right={sha1Checksum} />
      <LineEntry left={fileTexts.sha512Checksum} right={sha512Checksum} />
      <LineEntry fullText left={fileTexts.text} right={text} />
      <LineEntry left={fileTexts.fileLicense} right={fileLicense} selectable />
      <LineEntry left={fileTexts.license} right={license} />
      <WebRepresentation name={name || fileName || accessUrl} navigation={navigation} web={web} />
      <ModifiedSection created={created} modified={modified} deleted={deleted} />
    </Wrapper>
  );
};
