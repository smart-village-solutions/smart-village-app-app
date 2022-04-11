import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useMutation } from 'react-apollo';

import { colors, normalize } from '../../../config';
import { BoldText, RegularText } from '../../Text';
import { PROVIDE_ANSWER_TO_POLL_QUESTION } from '../../../queries/Consul';
import { ConsulClient } from '../../../ConsulClient';
import { LoadingSpinner } from '../../LoadingSpinner';
import { Touchable } from '../../Touchable';

export const ConsulQuestionsListItem = ({ item, onRefresh, token }) => {
  const [loading, setLoading] = useState(false);
  const { questionAnswers, title, answersGivenByCurrentUser, id } = item.item;

  // GraphQL
  const [provideAnswerToPollQuestion] = useMutation(PROVIDE_ANSWER_TO_POLL_QUESTION, {
    client: ConsulClient
  });

  const onAnswer = async (answer) => {
    setLoading(true);
    await provideAnswerToPollQuestion({
      variables: {
        pollQuestionId: id,
        token: token,
        answer: answer
      }
    })
      .then(() => {
        onRefresh();
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  return (
    <View style={styles.container}>
      <BoldText style={styles.tagText}>{title}</BoldText>

      {questionAnswers.map((item, index) => (
        <Touchable
          disabled={loading}
          onPress={() => onAnswer(item.title)}
          key={index}
          style={[
            styles.answerContainer,
            answersGivenByCurrentUser[0] &&
              answersGivenByCurrentUser[0].answer === item.title &&
              styles.selectedContainer
          ]}
        >
          <RegularText
            lightest={
              answersGivenByCurrentUser[0] && answersGivenByCurrentUser[0].answer === item.title
            }
          >
            {item.title}
          </RegularText>
        </Touchable>
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
  selectedContainer: {
    borderColor: colors.primary,
    borderWidth: 1,
    backgroundColor: colors.lighterPrimary
  }
});

ConsulQuestionsListItem.propTypes = {
  item: PropTypes.object.isRequired,
  onRefresh: PropTypes.func,
  token: PropTypes.string
};