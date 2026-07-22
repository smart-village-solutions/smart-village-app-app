import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';

import { texts } from '../../../config';
import { RegularText } from '../../Text';
import { Wrapper } from '../../Wrapper';
import { useThemeStyles } from '../../../hooks/useThemeStyles';

import { ConsulQuestionsDescriptionListItem } from './ConsulQuestionsDescriptionListItem';
import { ConsulQuestionsListItem } from './ConsulQuestionsListItem';

export const ConsulQuestionsList = ({ data, refetch, token, disabled, resultsReadyToBeShown }) => {
  const styles = useThemeStyles(createStyles);
  const [isUserAnswer, setIsUserAnswer] = useState(false);

  useEffect(() => {
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      if (element.answersGivenByCurrentUser.length > 0) {
        setIsUserAnswer(true);
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
            disabled={disabled}
            index={index}
            questionItem={item}
            refetch={refetch}
            resultsReadyToBeShown={resultsReadyToBeShown}
            token={token}
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

const createStyles = (colors) => ({
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
  resultsReadyToBeShown: PropTypes.bool,
  token: PropTypes.string
};
