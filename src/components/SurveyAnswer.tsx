import React, { SetStateAction, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../config';
import { getAnswerLabel } from '../helpers';
import { useSurveyLanguages } from '../hooks';
import { ResponseOption } from '../types';

import { Radiobutton } from './Radiobutton';
import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';
import { Wrapper, WrapperRow } from './Wrapper';

type Props = {
  archived?: boolean;
  faded: boolean;
  index: number;
  isMultilingual?: boolean;
  isMultiSelect?: boolean;
  responseOption: ResponseOption;
  selected: boolean;
  setSelection: React.Dispatch<SetStateAction<string[]>>;
};

export const SurveyAnswer = ({
  archived,
  faded,
  index,
  isMultilingual,
  isMultiSelect,
  responseOption,
  selected,
  setSelection
}: Props) => {
  const languages = useSurveyLanguages(isMultilingual);

  const { id } = responseOption;
  const onPress = useCallback(() => {
    setSelection((selection) => {
      if (selection.includes(id)) {
        // if it is single selection, then we don't need to change anything if it is selected already
        // otherwise remove it from the selection -> toggle behaviour
        return isMultiSelect ? selection.filter((value) => value !== id) : selection;
      } else {
        // if we have multiselection simply add the id to the selected ids, otherwise set it as the only selection
        return isMultiSelect ? [...selection, id] : [id];
      }
    });
  }, [id, setSelection]);

  const fadeStyle = { opacity: faded ? 0.5 : 1 };

  return (
    <Touchable disabled={archived} onPress={onPress}>
      <Wrapper style={[styles.noPaddingBottom, fadeStyle]}>
        <View style={styles.border}>
          <WrapperRow>
            <Wrapper style={styles.radioButtonContainer}>
              <Radiobutton selected={selected} />
            </Wrapper>
            <Wrapper style={styles.answerContainer}>
              <BoldText>{getAnswerLabel('de', index)}</BoldText>
              <RegularText>{responseOption.title[languages[0]]}</RegularText>
              {!!isMultilingual && !!responseOption.title[languages[1]] && (
                <>
                  <BoldText italic>{getAnswerLabel('pl', index)}</BoldText>
                  <RegularText italic>{responseOption.title[languages[1]]}</RegularText>
                </>
              )}
            </Wrapper>
          </WrapperRow>
        </View>
      </Wrapper>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  answerContainer: {
    flex: 1
  },
  border: {
    borderColor: colors.darkText,
    borderWidth: 1
  },
  noPaddingBottom: {
    paddingBottom: 0
  },
  radioButtonContainer: {
    justifyContent: 'center'
  }
});
