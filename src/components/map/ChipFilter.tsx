import { ApolloQueryResult } from 'apollo-client';
import _sortBy from 'lodash/sortBy';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { IconUrl, colors, normalize } from '../../config';
import { QUERY_TYPES, getQuery } from '../../queries';
import { BoldText } from '../Text';

type Props = {
  pointsOfInterest?: { category: { id: string | number; iconName: string; name: string } }[];
  queryVariables: {
    category?: string;
    categoryId?: string | number;
    categoryIds?: string[] | number[];
    dataProvider?: string;
  };
  refetch: (variables?: {
    limit: undefined;
    category?: string;
    categoryId?: string | number;
    categoryIds?: string[] | number[];
    dataProvider?: string;
  }) => Promise<ApolloQueryResult<any>>;
};

const keyExtractor = (
  item: { id: string | number; iconName: string; name: string },
  index: number
) => `index${index}-id${item.id}`;

export const ChipFilter = ({ queryVariables, refetch }: Props) => {
  const [categoryIds, setCategoryIds] = useState<string[]>(
    queryVariables.categoryIds?.map((item) => item.toString()) || []
  );

  const { data, loading } = useQuery(getQuery(QUERY_TYPES.CATEGORIES_FILTER), {
    variables: {
      ids: queryVariables.categoryIds
    }
  });

  const filter = _sortBy(
    data?.categories.filter((item: { iconName: string }) => !!item.iconName),
    'name'
  );

  useEffect(() => {
    refetch({ limit: undefined, categoryIds });
  }, [categoryIds]);

  const onPress = (item: { id: string | number }, isActive: boolean) => {
    // exclude an active pressed items id from category ids.
    // include an inactive pressed items id in category ids.
    // as result there could be multiple active and inactive items ids in category ids.
    setCategoryIds(
      isActive
        ? categoryIds.filter((id) => id !== item.id.toString())
        : [...categoryIds, item.id.toString()]
    );
  };

  if (loading) return null;

  return (
    <View style={styles.filterContainer}>
      <FlatList
        data={filter}
        horizontal
        keyExtractor={keyExtractor}
        renderItem={({ item, index }) => {
          const isActive = categoryIds.includes(item.id.toString());

          return (
            <TouchableOpacity onPress={() => onPress(item, isActive)} activeOpacity={0.8}>
              {/* TODO: Chip from RNE? https://reactnativeelements.com/docs/3.4.2/chip */}
              <View
                style={[
                  styles.chip,
                  isActive && styles.chipActive,
                  index === filter?.length - 1 && styles.lastChip
                ]}
              >
                {!!item.iconName && <IconUrl iconName={item.iconName} />}
                <BoldText small style={styles.category}>
                  {item.name}
                </BoldText>
              </View>
            </TouchableOpacity>
          );
        }}
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
  chipActive: {
    backgroundColor: colors.secondary
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
