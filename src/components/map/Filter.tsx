import _sortBy from 'lodash/sortBy';
import _uniqBy from 'lodash/uniqBy';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import { colors, normalize } from '../../config';
import { BoldText } from '../Text';

import { MapIcon } from './Map';

type Props = {
  pointsOfInterest?: { category: { iconName: string; name: string } }[];
};

export const Filter = ({ pointsOfInterest }: Props) => {
  const filter = _sortBy(
    _uniqBy(
      pointsOfInterest?.map((item) => item.category),
      'name'
    ),
    'name'
  );

  return (
    <View style={styles.filterContainer}>
      <FlatList
        data={filter}
        horizontal
        keyExtractor={(item) => item.name}
        renderItem={({ item, index }) => (
          <View style={[styles.chip, index === filter?.length - 1 && styles.lastChip]}>
            <MapIcon iconName={item.iconName} iconSize={normalize(24)} />
            <BoldText small style={styles.category}>
              {item.name}
            </BoldText>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  category: {
    marginLeft: normalize(4)
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    flexDirection: 'row',
    marginBottom: normalize(4),
    marginLeft: normalize(6),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(4),
    // shadow:
    elevation: 2,
    shadowColor: colors.shadowRgba,
    shadowOffset: {
      height: 3,
      width: 0
    },
    shadowOpacity: 0.5,
    shadowRadius: 3
  },
  filterContainer: {
    position: 'absolute',
    top: normalize(16),
    width: '100%',
    zIndex: 1
  },
  lastChip: {
    marginRight: normalize(16)
  },
  list: {
    paddingLeft: normalize(10)
  }
});
