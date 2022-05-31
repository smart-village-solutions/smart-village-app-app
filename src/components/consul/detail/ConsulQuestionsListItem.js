import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, normalize } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import { PROVIDE_ANSWER_TO_POLL_QUESTION } from '../../../queries/consul';
import { LoadingSpinner } from '../../LoadingSpinner';
import { BoldText, RegularText } from '../../Text';

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const ConsulQuestionsListItem = ({
  disabled,
  questionItem,
  refetch,
  resultsReadyToBeShown,
  token
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const { answersGivenByCurrentUser, id, questionAnswers, title } = questionItem;

  const [provideAnswerToPollQuestion] = useMutation(PROVIDE_ANSWER_TO_POLL_QUESTION, {
    client: ConsulClient
  });

  const totalVotesArray = questionAnswers.map(({ totalVotesPercentage }) => {
    return totalVotesPercentage;
  });
  const highestVote = Math.max(...totalVotesArray);

  const onAnswer = async (answer) => {
    setIsLoading(true);

    try {
      await provideAnswerToPollQuestion({
        variables: {
          pollQuestionId: id,
          token,
          answer
        }
      });
      refetch();
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <BoldText style={styles.tagText}>{title}</BoldText>

      {questionAnswers.map((item, index) => (
        <TouchableOpacity
          disabled={isLoading || !disabled}
          onPress={() => onAnswer(item.title)}
          key={index}
          style={[
            styles.answerContainer,
            (resultsReadyToBeShown && highestVote === item.totalVotesPercentage) ||
            (!resultsReadyToBeShown && answersGivenByCurrentUser?.[0]?.answer === item.title)
              ? styles.selectedContainer
              : null,
            !resultsReadyToBeShown &&
              !disabled &&
              answersGivenByCurrentUser?.[0]?.answer === item.title &&
              styles.disabledAnswerContainer
          ]}
        >
          <RegularText placeholder={!disabled}>{item.title}</RegularText>

          {!!resultsReadyToBeShown && (
            <RegularText placeholder={!disabled}>
              {item.totalVotes} - {parseFloat(item.totalVotesPercentage).toFixed(2)} %
            </RegularText>
          )}
        </TouchableOpacity>
      ))}
      {isLoading && <LoadingSpinner loading />}
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  answerContainer: {
    alignItems: 'center',
    borderColor: colors.darkText,
    borderWidth: 0.5,
    justifyContent: 'center',
    marginVertical: normalize(10),
    paddingVertical: normalize(10)
  },
  container: {
    borderColor: colors.borderRgba,
    borderWidth: 1,
    marginVertical: normalize(10),
    padding: normalize(10)
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
  disabled: PropTypes.bool,
  questionItem: PropTypes.object.isRequired,
  refetch: PropTypes.func,
  resultsReadyToBeShown: PropTypes.bool,
  token: PropTypes.string
};
