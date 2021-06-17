import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../config';
import { useSurveyLanguages } from '../hooks';
import { ResponseOption } from '../types';
import { Radiobutton } from './Radiobutton';
import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';
import { Wrapper, WrapperRow } from './Wrapper';

type Props = {
  faded: boolean;
  index: number;
  responseOption: ResponseOption;
  selected: boolean;
  setSelection: (id: string) => void;
};

export const SurveyAnswer = ({ faded, index, responseOption, selected, setSelection }: Props) => {
  const languages = useSurveyLanguages();

  const { id } = responseOption;
  const onPress = useCallback(() => setSelection(id), [id, setSelection]);

  const fadeStyle = { opacity: faded ? 0.5 : 1 };

  return (
    <Touchable onPress={onPress}>
      <Wrapper style={[styles.noPaddingBottom, fadeStyle]}>
        <View style={styles.border}>
          <WrapperRow>
            <Wrapper style={styles.radioButtonContainer}>
              <Radiobutton selected={selected} />
            </Wrapper>
            <Wrapper>
              <BoldText>Antwort {String.fromCharCode(65 + index)}:</BoldText>
              <RegularText>{responseOption.title[languages[0]]}</RegularText>
              <BoldText italic>Odpowiedź {String.fromCharCode(65 + index)}:</BoldText>
              <RegularText italic>{responseOption.title[languages[0]]}</RegularText>
            </Wrapper>
          </WrapperRow>
        </View>
      </Wrapper>
    </Touchable>
  );
};

const styles = StyleSheet.create({
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
