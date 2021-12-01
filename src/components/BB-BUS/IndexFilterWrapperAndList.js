import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';

import { Touchable } from '../Touchable';
import { WrapperHorizontal } from '../Wrapper';
import { RegularText } from '../Text';

import { IndexFilterElement, IndexFilterWrapper } from './IndexFilterElement';

export const IndexFilterWrapperAndList = ({ filter, setFilter }) => {
  const selectedFilter = filter.find((entry) => entry.selected);

  return (
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
              <IndexFilterElement selected={item.selected}>
                <RegularText primary small>
                  {item.title}
                </RegularText>
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
};

IndexFilterWrapperAndList.propTypes = {
  filter: PropTypes.array.isRequired,
  setFilter: PropTypes.func.isRequired
};
