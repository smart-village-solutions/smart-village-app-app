import React, { SetStateAction, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, normalize } from '../../config';
import { getAnswerLabel } from '../../helpers';
import { imageWidth } from '../../helpers/imageHelper';
import { useSurveyLanguages } from '../../hooks';
import { ResponseOption } from '../../types';
import { Radiobutton } from '../Radiobutton';
import { BoldText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow } from '../Wrapper';

import { SurveyText } from './SurveyText';

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

// image width minus the width of the radiobutton and its wrapper
const answerWidth = imageWidth() - (3 * normalize(14) + normalize(24));

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
              <Radiobutton selected={selected} onPress={onPress} />
            </Wrapper>
            <Wrapper style={styles.answerContainer}>
              <BoldText>{getAnswerLabel('de', index)}</BoldText>
              <SurveyText content={responseOption.title[languages[0]]} width={answerWidth} />
              {!!isMultilingual && !!responseOption.title[languages[1]] && (
                <>
                  <BoldText italic>{getAnswerLabel('pl', index)}</BoldText>
                  <SurveyText
                    content={responseOption.title[languages[1]]}
                    italic
                    width={answerWidth}
                  />
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
