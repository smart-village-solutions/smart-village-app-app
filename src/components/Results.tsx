import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, normalize, texts } from '../config';
import { combineLanguages, getAnswerLabel } from '../helpers';
import { useSurveyLanguages } from '../hooks';
import { ResponseOption } from '../types';

import { AccessibilityContext } from '../AccessibilityProvider';
import { SectionHeader } from './SectionHeader';
import { BoldText } from './Text';
import { Wrapper, WrapperHorizontal, WrapperRow } from './Wrapper';

type Props = {
  isMultilingual?: boolean;
  responseOptions: ResponseOption[];
  selectedOptions: string[];
};

type SingleProps = {
  isMultilingual?: boolean;
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

const SingleResult = ({ isMultilingual, option, selected, totalCount }: SingleProps) => {
  const { isReduceTransparencyEnabled } = useContext(AccessibilityContext);

  const percentString = getPercent(option.votesCount, totalCount);
  const width = percentString === '0%' ? barBorderRadius * 2 : percentString;
  return (
    <WrapperRow spaceBetween style={styles.container}>
      <View style={styles.labelContainer}>
        <BoldText small>{getAnswerLabel('de', option.index)}</BoldText>
        {!!isMultilingual && <BoldText small>{getAnswerLabel('pl', option.index)}</BoldText>}
      </View>
      <WrapperHorizontal style={styles.barContainer}>
        <View
          style={[
            styles.baseBarStyle,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              opacity: isReduceTransparencyEnabled || selected ? 1 : 0.5,
              backgroundColor:
                isReduceTransparencyEnabled && !selected ? colors.surface : colors.primary,
              width
            }
          ]}
        />
      </WrapperHorizontal>
      <View style={[styles.countContainer, { top: isMultilingual ? normalize(7) : normalize(3) }]}>
        <BoldText>{getCountLabel(option.votesCount, totalCount)}</BoldText>
      </View>
    </WrapperRow>
  );
};

export const Results = ({ isMultilingual, responseOptions, selectedOptions }: Props) => {
  const languages = useSurveyLanguages(isMultilingual);
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
    <Wrapper style={styles.noHorizontalPadding}>
      {!!title && <SectionHeader title={title} />}
      <Wrapper>
        {sortedOptions.map((option) => (
          <SingleResult
            key={option.id}
            isMultilingual={isMultilingual}
            option={option}
            selected={selectedOptions.includes(option.id)}
            totalCount={totalCount}
          />
        ))}
      </Wrapper>
    </Wrapper>
  );
};

const barBorderRadius = 4;

const styles = StyleSheet.create({
  barContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  baseBarStyle: {
    borderColor: colors.primary,
    borderRadius: 4,
    borderWidth: 1,
    height: normalize(26)
  },
  container: {
    marginBottom: normalize(12)
  },
  countContainer: {
    position: 'absolute',
    right: 0
  },
  labelContainer: {
    justifyContent: 'center',
    width: 100 // this fixes the width of the left labels, so that all bars start at a common line
  },
  noHorizontalPadding: {
    paddingLeft: 0,
    paddingRight: 0
  }
});
