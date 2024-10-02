import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { texts } from '../../config';
import { formatSize, momentFormat, openLink } from '../../helpers';
import { FileData } from '../../types';
import { SectionHeader } from '../SectionHeader';
import { Wrapper, WrapperHorizontal, WrapperVertical } from '../Wrapper';

import { Row, SimpleRow } from './Row';
import {
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';
import { StyleSheet } from 'react-native';

type Props = {
  data: FileData;
  navigation: StackNavigationProp<any>;
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
      <WrapperHorizontal>
        <Row left={fileTexts.name} right={name} fullText leftWidth={leftWidth} />
        <Row left={fileTexts.fileName} right={fileName} leftWidth={leftWidth} />
        <Row left={fileTexts.mimeType} right={mimeType} leftWidth={leftWidth} />
        <Row
          left={fileTexts.size}
          right={size ? formatSize(size) : undefined}
          leftWidth={leftWidth}
        />
        <Row
          left={fileTexts.date}
          right={date ? momentFormat(date, 'DD.MM.YYYY', 'x') : undefined}
          leftWidth={leftWidth}
        />
        <Row left={fileTexts.fileLicense} right={fileLicense} leftWidth={leftWidth} />
        <Row left={fileTexts.text} right={text} fullText leftWidth={leftWidth} />
      </WrapperHorizontal>
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
      <WrapperVertical>
        <SectionHeader title={fileTexts.urls} />
        {!!(accessUrl || downloadUrl || externalServiceUrl) && (
          <WrapperHorizontal>
            <SimpleRow
              left={fileTexts.accessUrl}
              right={accessUrl !== downloadUrl ? accessUrl : undefined}
              onPress={() => openLink(accessUrl)}
              selectable
              fullText
            />
            <SimpleRow
              left={fileTexts.downloadUrl}
              right={downloadUrl}
              onPress={() => openLink(downloadUrl)}
              selectable
              fullText
            />
            <SimpleRow
              left={fileTexts.externalServiceUrl}
              right={externalServiceUrl}
              onPress={() => openLink(externalServiceUrl)}
              selectable
              fullText
            />
          </WrapperHorizontal>
        )}
      </WrapperVertical>
      <Wrapper style={styles.noPaddingTop}>
        <SimpleRow left={fileTexts.sha1Checksum} right={sha1Checksum} fullText />
        <SimpleRow left={fileTexts.sha512Checksum} right={sha512Checksum} fullText />
        <KeywordSection keyword={keyword} />
        <SimpleRow left={fileTexts.license} right={license} />
        <WebRepresentation name={name || fileTexts.file} navigation={navigation} web={web} />
        <ModifiedSection created={created} deleted={deleted} modified={modified} />
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});
