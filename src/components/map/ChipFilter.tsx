import { ApolloQueryResult } from 'apollo-client';
import _sortBy from 'lodash/sortBy';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconUrl, consts, normalize } from '../../config';
import { QUERY_TYPES, getQuery } from '../../queries';
import { GET_MAP_POI_CATEGORIES } from '../../queries/categories';
import { BoldText } from '../Text';
import { useThemeStyles } from '../../hooks/useThemeStyles';

type FilterItem = {
  id: string | number;
  name: string;
  iconName?: string;
  icon?: React.ReactElement;
  selected?: boolean;
  onPress?: () => void;
};
type CategoryFilterItem = FilterItem & { pointsOfInterestTreeCount?: number | null };

type Props = {
  showAllPoiCategories?: boolean;
  selectedCategoryIds?: string[];
  onCategorySelectionChange?: (ids: string[]) => void;
  additionalFilters?: {
    id: string;
    name: string;
    selected: boolean;
    onPress: () => void;
    icon?: React.ReactElement;
  }[];
  pointsOfInterest?: { category: { id: string | number; iconName?: string; name: string } }[];
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

const keyExtractor = (item: FilterItem, index: number) => `index${index}-id${item.id}`;
const initialCategoryIds = (variables: Props['queryVariables']) =>
  variables.categoryIds?.map(String) ?? [];

const filterCategories = (
  categories: CategoryFilterItem[],
  showAll: boolean,
  initialIds?: string[] | number[]
) => {
  if (showAll)
    return categories.filter(
      (category) =>
        (category.pointsOfInterestTreeCount ?? 0) > 0 ||
        initialIds?.some((id) => String(id) === String(category.id))
    );
  return initialIds?.length ? categories : [];
};

export const ChipFilter = ({
  queryVariables,
  refetch,
  additionalFilters = [],
  showAllPoiCategories = false,
  selectedCategoryIds,
  onCategorySelectionChange
}: Props) => {
  const styles = useThemeStyles(createStyles);
  const [categoryIds, setCategoryIds] = useState<string[]>(() =>
    initialCategoryIds(queryVariables)
  );
  const activeCategoryIds = selectedCategoryIds ?? categoryIds;
  const safeAreaInsets = useSafeAreaInsets();

  const { data, loading } = useQuery<{ categories: CategoryFilterItem[] }>(
    showAllPoiCategories ? GET_MAP_POI_CATEGORIES : getQuery(QUERY_TYPES.CATEGORIES_FILTER),
    {
      skip: !showAllPoiCategories && !queryVariables.categoryIds?.length,
      variables: showAllPoiCategories ? {} : { ids: queryVariables.categoryIds }
    }
  );

  const categories = filterCategories(
    data?.categories || [],
    showAllPoiCategories,
    queryVariables.categoryIds
  );
  const filter: FilterItem[] = [
    ...additionalFilters,
    ..._sortBy(categories, [
      (category) =>
        showAllPoiCategories &&
        queryVariables.categoryIds?.some((id) => String(id) === String(category.id))
          ? 0
          : 1,
      'name'
    ])
  ];

  useEffect(() => {
    if (onCategorySelectionChange || !queryVariables.categoryIds?.length) return;
    refetch?.({ limit: undefined, categoryIds });
  }, [categoryIds, queryVariables.categoryIds?.length, refetch, onCategorySelectionChange]);

  const onPress = (item: { id: string | number }, isActive: boolean) => {
    // exclude an active pressed items id from category ids.
    // include an inactive pressed items id in category ids.
    // as result there could be multiple active and inactive items ids in category ids.
    const nextCategoryIds = isActive
      ? activeCategoryIds.filter((id) => id !== item.id.toString())
      : [...activeCategoryIds, item.id.toString()];
    if (onCategorySelectionChange) onCategorySelectionChange(nextCategoryIds);
    else setCategoryIds(nextCategoryIds);
  };

  if (loading && !additionalFilters.length) return null;

  const horizontalPadding = normalize(16);
  const contentPaddingLeft = horizontalPadding + safeAreaInsets.left;
  const contentPaddingRight = horizontalPadding + safeAreaInsets.right;

  return (
    <View style={styles.filterContainer}>
      <FlatList
        data={filter}
        horizontal
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingLeft: contentPaddingLeft,
          paddingRight: contentPaddingRight
        }}
        renderItem={({ item, index }) => {
          const external = typeof item.onPress === 'function';
          const isActive = external
            ? !!item.selected
            : activeCategoryIds.includes(item.id.toString());

          return (
            <TouchableOpacity
              accessibilityLabel={`${item.name} ${consts.a11yLabel.button}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => (external ? item.onPress?.() : onPress(item, isActive))}
              activeOpacity={0.8}
            >
              {/* TODO: Chip from RNE? https://reactnativeelements.com/docs/3.4.2/chip */}
              <View
                style={[
                  styles.chip,
                  isActive && styles.chipActive,
                  index === filter?.length - 1 && styles.lastChip
                ]}
              >
                {item.icon ??
                  (item.iconName?.trim() ? (
                    <IconUrl fallback={null} iconName={item.iconName} />
                  ) : null)}
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

const createStyles = (colors) => ({
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
    flexGrow: 0
  }
});
