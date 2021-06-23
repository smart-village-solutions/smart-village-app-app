import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';

import { Touchable } from '../Touchable';
import { WrapperHorizontal } from '../Wrapper';
import { BoldText } from '../Text';

import {
  IndexFilterElement,
  IndexFilterElementBorder,
  IndexFilterWrapper
} from './IndexFilterElement';

export const IndexFilterWrapperAndList = ({ filter, selectedFilter, setFilter }) => (
  <IndexFilterWrapper>
    <FlatList
      keyExtractor={(item, index) => `index${index}-id${item.id}`}
      data={filter}
      renderItem={({ item }) => (
        <Touchable
          onPress={() => {
            // only trigger onPress if a new selection is made
            if (selectedFilter.id === item.id) return;

            const updatedFilter = filter.map((entry) => {
              if (entry.id === item.id) {
                entry.selected = true;
              } else {
                entry.selected = false;
              }

              return entry;
            });

            setFilter(updatedFilter);
          }}
        >
          <WrapperHorizontal big>
            <IndexFilterElement>
              <BoldText small>{item.title}</BoldText>
              {item.selected && <IndexFilterElementBorder />}
            </IndexFilterElement>
          </WrapperHorizontal>
        </Touchable>
      )}
      showsHorizontalScrollIndicator={false}
      horizontal
      alwaysBounceHorizontal={false}
    />
  </IndexFilterWrapper>
);

IndexFilterWrapperAndList.propTypes = {
  filter: PropTypes.array.isRequired,
  selectedFilter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired
};
