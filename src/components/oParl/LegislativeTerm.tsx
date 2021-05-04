import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { LegislativeTermData } from '../../types';
import { WrapperHorizontal } from '../Wrapper';
import { Row, SimpleRow } from './Row';
import {
  DateSection,
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: LegislativeTermData;
  navigation: NavigationScreenProp<never>;
};

const legislativeTermTexts = texts.oparl.legislativeTerm;

const leftWidth = 120;

export const LegislativeTerm = ({ data, navigation }: Props) => {
  const {
    body,
    created,
    deleted,
    endDate,
    keyword,
    license,
    modified,
    name,
    startDate,
    web
  } = data;

  return (
    <>
      <Row left={legislativeTermTexts.name} right={name} leftWidth={leftWidth} fullText />
      <DateSection
        endDate={endDate}
        startDate={startDate}
        topDivider={false}
        leftWidth={leftWidth}
      />
      <OParlPreviewSection
        data={body}
        header={legislativeTermTexts.partOfBody}
        navigation={navigation}
      />
      <WrapperHorizontal>
        <KeywordSection keyword={keyword} />
        <SimpleRow left={legislativeTermTexts.license} right={license} />
        <WebRepresentation
          name={name || legislativeTermTexts.legislativeTerm}
          navigation={navigation}
          web={web}
        />
        <ModifiedSection created={created} deleted={deleted} modified={modified} />
      </WrapperHorizontal>
    </>
  );
};
