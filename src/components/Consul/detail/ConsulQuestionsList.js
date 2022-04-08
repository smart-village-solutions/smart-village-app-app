import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';

import { Wrapper } from '../../Wrapper';

import { ConsulQuestionsListItem } from './ConsulQuestionsListItem';
import { ConsulQuestionsDescriptionListItem } from './ConsulQuestionsDescriptionListItem';

export const ConsulQuestionsList = ({ data, onRefresh }) => {
  return (
    <Wrapper>
      <FlatList
        data={data}
        renderItem={(item, index) => (
          <ConsulQuestionsListItem item={item} index={index} onRefresh={onRefresh} />
        )}
      />

      <FlatList
        data={data}
        renderItem={(item, index) => (
          <ConsulQuestionsDescriptionListItem item={item} index={index} />
        )}
      />
    </Wrapper>
  );
};

ConsulQuestionsList.propTypes = {
  data: PropTypes.array,
  onRefresh: PropTypes.func
};
