import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { LegislativeTermData } from '../../types';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import { DateSection, KeywordSection, OParlPreviewSection, WebRepresentation } from './sections';

type Props = {
  data: LegislativeTermData;
  navigation: NavigationScreenProp<never>;
};

const legislativeTermTexts = texts.oparl.legislativeTerm;

export const LegislativeTerm = ({ data, navigation }: Props) => {
  const { body, endDate, keyword, name, startDate, web } = data;

  return (
    <Wrapper>
      <LineEntry left={legislativeTermTexts.name} right={name} />
      <DateSection endDate={endDate} startDate={startDate} />
      <OParlPreviewSection
        data={body}
        header={legislativeTermTexts.partOfBody}
        navigation={navigation}
      />
      <KeywordSection keyword={keyword} />
      <WebRepresentation
        name={name ?? legislativeTermTexts.title}
        navigation={navigation}
        web={web}
      />
    </Wrapper>
  );
};
