import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { colors, texts } from '../../../config';
import { RegularText } from '../../Text';
import { Wrapper } from '../../Wrapper';

import { ConsulQuestionsDescriptionListItem } from './ConsulQuestionsDescriptionListItem';
import { ConsulQuestionsListItem } from './ConsulQuestionsListItem';

export const ConsulQuestionsList = ({ data, refetch, token, disabled }) => {
  const [isUserAnswer, setIsAnswerUser] = useState(false);

  useEffect(() => {
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      if (element.answersGivenByCurrentUser.length > 0) {
        setIsAnswerUser(true);
        break;
      }
    }
  }, []);

  return (
    <Wrapper>
      {(isUserAnswer || !disabled) && (
        <View style={!disabled ? styles.pollUserAnswerContainer : styles.pollEndeContainer}>
          <RegularText lightest small>
            {!disabled ? texts.consul.pollFinished : texts.consul.pollUserAnswer}
          </RegularText>
        </View>
      )}

      <FlatList
        data={data}
        renderItem={({ item, index }) => (
          <ConsulQuestionsListItem
            questionItem={item}
            index={index}
            refetch={refetch}
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

ConsulQuestionsList.propTypes = {
  data: PropTypes.array,
  disabled: PropTypes.bool,
  refetch: PropTypes.func,
  token: PropTypes.string
};
