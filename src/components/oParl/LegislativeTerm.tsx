import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { LegislativeTermData } from '../../types';
import { BoldText } from '../Text';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import { BodyPreview } from './previews';
import { DateSection, KeywordSection, WebRepresentation } from './sections';

type Props = {
  data: LegislativeTermData;
  navigation: NavigationScreenProp<never>;
};

const { legislativeTerm } = texts.oparl;

export const LegislativeTerm = ({ data, navigation }: Props) => {
  const { body, endDate, keyword, name, startDate, web } = data;

  return (
    <Wrapper>
      <LineEntry left={legislativeTerm.name} right={name} />
      <DateSection endDate={endDate} startDate={startDate} />
      {!!body && (
        <>
          <BoldText>{legislativeTerm.partOfBody}</BoldText>
          <BodyPreview data={body} navigation={navigation} />
        </>
      )}
      <KeywordSection keyword={keyword} />
      <WebRepresentation name={name ?? legislativeTerm.title} navigation={navigation} web={web} />
    </Wrapper>
  );
};
