import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';

import { useOpenWebScreen } from '../../../hooks';
import { HtmlView } from '../../HtmlView';
import { BoldText } from '../../Text';
import { Wrapper } from '../../Wrapper';

export const ConsulQuestionsDescriptionListItem = ({ questionDescriptionItem }) => {
  const { questionAnswers, title } = questionDescriptionItem;

  const openWebScreen = useOpenWebScreen(undefined);

  return (
    <>
      <BoldText>- {title}</BoldText>
      <Wrapper>
        {questionAnswers.map((item, index) => (
          <View key={index}>
            <BoldText small>{item.title}</BoldText>
            <HtmlView html={item.description} openWebScreen={openWebScreen} />
          </View>
        ))}
      </Wrapper>
    </>
  );
};

ConsulQuestionsDescriptionListItem.propTypes = {
  questionDescriptionItem: PropTypes.object.isRequired
};
