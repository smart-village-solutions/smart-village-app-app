import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, normalize } from '../../../config';
import { BoldText, RegularText } from '../../Text';

export const ConsulQuestionsListItem = ({ item, onRefresh }) => {
  const { questionAnswers, title, answersGivenByCurrentUser } = item.item;

  return (
    <View style={styles.container}>
      <BoldText style={styles.tagText}>{title}</BoldText>

      {questionAnswers.map((item, index) => (
        <View
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
        </View>
      ))}
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
  onRefresh: PropTypes.func
};
