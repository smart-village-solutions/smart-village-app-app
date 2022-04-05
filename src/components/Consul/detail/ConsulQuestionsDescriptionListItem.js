import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';

import { BoldText } from '../../Text';
import { HtmlView } from '../../HtmlView';
import { useOpenWebScreen } from '../../../hooks';
import { Wrapper } from '../../Wrapper';

export const ConsulQuestionsDescriptionListItem = ({ item }) => {
  const { questionAnswers, title } = item.item;

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
  item: PropTypes.object.isRequired
};
