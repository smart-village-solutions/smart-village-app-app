import React, { useCallback } from 'react';
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
  responseOption: ResponseOption;
  selected: boolean;
  setSelection: (id: string) => void;
};

export const SurveyAnswer = ({
  archived,
  faded,
  index,
  responseOption,
  selected,
  setSelection
}: Props) => {
  const languages = useSurveyLanguages();

  const { id } = responseOption;
  const onPress = useCallback(() => setSelection(id), [id, setSelection]);

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
              {!!responseOption.title[languages[1]] && (
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
