import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';

import { consts, texts } from '../config';

import { IndexFilterElement, IndexFilterWrapper } from './IndexFilterElement';
import { RegularText } from './Text';
import { Touchable } from './Touchable';
import { WrapperHorizontal } from './Wrapper';

const { a11yLabel } = consts;

export const IndexFilterWrapperAndList = ({ filter, setFilter }) => {
  const selectedFilter = filter.find((entry) => entry.selected);

  return (
    <IndexFilterWrapper>
      <FlatList
        keyExtractor={(item, index) => `index${index}-id${item.id}`}
        data={filter}
        renderItem={({ item }) => (
          <Touchable
            accessibilityLabel={`(${item.title}) ${a11yLabel.tabs} (${
              item.selected
                ? texts.accessibilityLabels.tabs.active
                : texts.accessibilityLabels.tabs.inactive
            })`}
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
