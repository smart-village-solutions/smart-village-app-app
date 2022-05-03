import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, normalize } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import { PROVIDE_ANSWER_TO_POLL_QUESTION } from '../../../queries/consul';
import { LoadingSpinner } from '../../LoadingSpinner';
import { BoldText, RegularText } from '../../Text';

export const ConsulQuestionsListItem = ({ questionItem, onRefresh, token, disabled }) => {
  const [loading, setLoading] = useState(false);

  const { questionAnswers, title, answersGivenByCurrentUser, id } = questionItem;

  const [provideAnswerToPollQuestion] = useMutation(PROVIDE_ANSWER_TO_POLL_QUESTION, {
    client: ConsulClient
  });

  const onAnswer = async (answer) => {
    setLoading(true);

    try {
      await provideAnswerToPollQuestion({
        variables: {
          pollQuestionId: id,
          token: token,
          answer: answer
        }
      });
      onRefresh();
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <BoldText style={styles.tagText}>{title}</BoldText>

      {questionAnswers.map((item, index) => (
        <TouchableOpacity
          disabled={loading || !disabled}
          onPress={() => onAnswer(item.title)}
          key={index}
          style={[
            styles.answerContainer,
            answersGivenByCurrentUser[0] &&
              answersGivenByCurrentUser[0].answer === item.title &&
              styles.selectedContainer,
            !disabled &&
              answersGivenByCurrentUser[0] &&
              answersGivenByCurrentUser[0].answer !== item.title &&
              styles.disabledAnswerContainer
          ]}
        >
          <RegularText placeholder={!disabled}>{item.title}</RegularText>
        </TouchableOpacity>
      ))}
      {loading && <LoadingSpinner loading />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.borderRgba,
    marginVertical: normalize(10),
    padding: normalize(10)
  },
  answerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: colors.darkText,
    marginVertical: normalize(10),
    paddingVertical: normalize(10)
  },
  disabledAnswerContainer: {
    borderWidth: 0.3
  },
  selectedContainer: {
    borderColor: colors.lighterPrimary,
    borderWidth: 2
  }
});

ConsulQuestionsListItem.propTypes = {
  questionItem: PropTypes.object.isRequired,
  onRefresh: PropTypes.func,
  token: PropTypes.string,
  disabled: PropTypes.bool
};
