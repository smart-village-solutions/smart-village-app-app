import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, normalize, texts } from '../config';
import { combineLanguages, getAnswerLabel } from '../helpers';
import { useSurveyLanguages } from '../hooks';
import { SectionHeader } from './SectionHeader';
import { ResponseOption } from '../types';
import { BoldText } from './Text';
import { Wrapper, WrapperHorizontal, WrapperRow } from './Wrapper';

type Props = { responseOptions: ResponseOption[]; selectedOption: string };
type SingleProps = {
  option: ResponseOption & { index: number };
  selected: boolean;
  totalCount: number;
};

const getPercent = (partial: number, total: number) => {
  if (!total) {
    return '0%';
  }
  return `${((100 * partial) / total).toFixed(0)}%`;
};

const getCountLabel = (partial: number, total: number) => {
  return `${partial} / ${getPercent(partial, total)}`;
};

const SingleResult = ({ option, selected, totalCount }: SingleProps) => {
  const percentString = getPercent(option.votesCount, totalCount);
  const width = percentString === '0%' ? barBorderRadius * 2 : percentString;
  return (
    <WrapperRow spaceBetween style={styles.container}>
      <View style={styles.labelContainer}>
        <BoldText small>{getAnswerLabel('de', option.index)}</BoldText>
        <BoldText small>{getAnswerLabel('pl', option.index)}</BoldText>
      </View>
      <WrapperHorizontal style={styles.barContainer}>
        <View
          style={[
            styles.baseBarStyle,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              opacity: selected ? 1 : 0.5,
              width
            }
          ]}
        />
      </WrapperHorizontal>
      <View style={styles.countContainer}>
        <BoldText>{getCountLabel(option.votesCount, totalCount)}</BoldText>
      </View>
    </WrapperRow>
  );
};

export const Results = ({ responseOptions, selectedOption }: Props) => {
  const languages = useSurveyLanguages();
  const sortedOptions = responseOptions
    .map((option, index) => ({ ...option, index }))
    // deepcode ignore NoZeroReturnedInSort: The callback provided to sort does return 0 implicitly if the compared values are equal.
    .sort((a, b) => -a.votesCount + b.votesCount);

  const totalCount = responseOptions.reduce(
    (prev, currentOption) => prev + currentOption.votesCount,
    0
  );

  const title = combineLanguages(languages, texts.survey.result);

  return (
    <>
      {!!title && <SectionHeader title={title} />}
      <Wrapper>
        {sortedOptions.map((option) => (
          <SingleResult
            key={option.id}
            option={option}
            selected={selectedOption === option.id}
            totalCount={totalCount}
          />
        ))}
      </Wrapper>
    </>
  );
};

const barBorderRadius = 4;

const styles = StyleSheet.create({
  barContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  baseBarStyle: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    height: normalize(26)
  },
  container: {
    marginBottom: normalize(12)
  },
  countContainer: {
    position: 'absolute',
    right: 0,
    top: normalize(7)
  },
  labelContainer: {
    width: 100 // this fixes the width of the left labels, so that all bars start at a common line
  }
});
