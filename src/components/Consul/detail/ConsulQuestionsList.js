import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';

import { Wrapper } from '../../Wrapper';
import { RegularText } from '../../Text';
import { colors, texts } from '../../../config';

import { ConsulQuestionsListItem } from './ConsulQuestionsListItem';
import { ConsulQuestionsDescriptionListItem } from './ConsulQuestionsDescriptionListItem';

const text = texts.consul;

export const ConsulQuestionsList = ({ data, onRefresh, token, disabled }) => {
  const [userAnswer, setAnswerUser] = useState(false);
  useEffect(() => {
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      if (element.answersGivenByCurrentUser.length > 0) {
        setAnswerUser(true);
        break;
      }
    }
  }, []);

  return (
    <Wrapper>
      {(userAnswer || !disabled) && (
        <View style={!disabled ? styles.pollUserAnswerContainer : styles.pollEndeContainer}>
          <RegularText lightest small>
            {!disabled ? text.pollFinished : text.pollUserAnswer}
          </RegularText>
        </View>
      )}

      <FlatList
        data={data}
        renderItem={({ item, index }) => (
          <ConsulQuestionsListItem
            questionItem={item}
            index={index}
            onRefresh={onRefresh}
            token={token}
            disabled={disabled}
          />
        )}
      />

      <FlatList
        data={data}
        renderItem={({ item, index }) => (
          <ConsulQuestionsDescriptionListItem questionDescriptionItem={item} index={index} />
        )}
      />
    </Wrapper>
  );
};

ConsulQuestionsList.propTypes = {
  data: PropTypes.array,
  onRefresh: PropTypes.func,
  token: PropTypes.string,
  disabled: PropTypes.bool
};

const styles = StyleSheet.create({
  pollEndeContainer: {
    backgroundColor: colors.lighterPrimary,
    padding: 5
  },
  pollUserAnswerContainer: {
    backgroundColor: colors.error,
    padding: 5
  }
});
