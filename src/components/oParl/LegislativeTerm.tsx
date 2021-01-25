import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { LegislativeTermData } from '../../types';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import { DateSection, KeywordSection, WebRepresentation } from './sections';

type Props = {
  data: LegislativeTermData;
  navigation: NavigationScreenProp<never>;
};

const { legislativeTerm } = texts.oparl;

export const LegislativeTerm = ({ data, navigation }: Props) => {
  const { body, endDate, keyword, name, startDate, web } = data;

  const onPressBody = useCallback(
    () => body && navigation.push('OParlDetail', { id: body.id, title: body.name }),
    [navigation, body]
  );

  return (
    <Wrapper>
      <LineEntry left={legislativeTerm.name} right={name} />
      <DateSection endDate={endDate} startDate={startDate} />
      <LineEntry
        left={legislativeTerm.partOfBody}
        lineThrough={body?.deleted}
        onPress={onPressBody}
        right={body?.name}
      />
      <KeywordSection keyword={keyword} />
      <WebRepresentation name={name ?? legislativeTerm.title} navigation={navigation} web={web} />
    </Wrapper>
  );
};
