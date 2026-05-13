import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type RefreshControlProps } from 'react-native';

import { device, normalize, texts } from '../../config';
import { resolveBusCategoryServices } from '../../helpers/busListHelper';
import { shareMessage } from '../../helpers/BUS/shareHelper';
import type { AreaId, BusCategory, BusServiceListItem } from '../../types';
import { ScreenName } from '../../types/Navigation';
import { BackToTop } from '../BackToTop';
import { LoadingSpinner } from '../LoadingSpinner';
import { RegularText } from '../Text';

import { LifeSituationListItem } from './LifeSituationListItem';

const ITEM_TYPES = {
  CATEGORY: 'category',
  SERVICE: 'service'
} as const;

type CategoryListItem = {
  data: BusCategory;
  type: typeof ITEM_TYPES.CATEGORY;
};

type ServiceListItem = {
  data: BusServiceListItem;
  type: typeof ITEM_TYPES.SERVICE;
};

type LifeSituationEntry = CategoryListItem | ServiceListItem;

type BusNavigation = {
  push: (screen: ScreenName, params: Record<string, unknown>) => void;
};

type LifeSituationsListProps = {
  areaId?: AreaId;
  category?: BusCategory;
  childCategories?: BusCategory[];
  isError?: boolean;
  isLoading?: boolean;
  isRootCategory?: boolean;
  navigation: BusNavigation;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  services?: BusServiceListItem[];
};

const getSortPosition = (value?: string | number) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : Number.POSITIVE_INFINITY;
};
const hasCategoryListData = (childCategory?: BusCategory) =>
  childCategory?.id !== null &&
  childCategory?.id !== undefined &&
  !!`${childCategory?.name ?? ''}`.trim();

const shouldShowLoadingSpinner = ({
  hasListData,
  isLoading,
  isResolvingServices
}: {
  hasListData: boolean;
  isLoading: boolean;
  isResolvingServices: boolean;
}) => (isLoading || isResolvingServices) && !hasListData;

const getListData = ({
  category,
  childCategories = [],
  services = []
}: {
  category?: BusCategory;
  childCategories?: BusCategory[];
  services?: BusServiceListItem[];
}) => {
  const categories: CategoryListItem[] = childCategories
    .filter(hasCategoryListData)
    .sort((firstCategory, secondCategory) => {
      const positionDifference =
        getSortPosition(firstCategory.position) - getSortPosition(secondCategory.position);

      if (positionDifference !== 0) {
        return positionDifference;
      }

      return `${firstCategory.name ?? ''}`
        .trim()
        .toLowerCase()
        .localeCompare(`${secondCategory.name ?? ''}`.trim().toLowerCase());
    })
    .map((childCategory) => ({
      data: childCategory,
      type: ITEM_TYPES.CATEGORY
    }));
  const resolvedServices = resolveBusCategoryServices(category, services);
  const serviceItems: ServiceListItem[] = resolvedServices.map((service) => ({
    data: service,
    type: ITEM_TYPES.SERVICE
  }));

  return [...categories, ...serviceItems];
};

const isCategoryItem = (item: LifeSituationEntry): item is CategoryListItem =>
  item.type === ITEM_TYPES.CATEGORY;

export const LifeSituationsList = ({
  areaId,
  category,
  childCategories = [],
  isError = false,
  isLoading = false,
  isRootCategory = false,
  navigation,
  refreshControl,
  services = []
}: LifeSituationsListProps) => {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const listData = useMemo(
    () => getListData({ category, childCategories, services }),
    [category, childCategories, services]
  );
  const hasListData = !!listData.length;
  const emptyStateMessage = isError
    ? isRootCategory
      ? texts.bus.emptyStates.lifeSituationsRoot
      : texts.bus.emptyStates.lifeSituationsNested
    : texts.bus.emptyStates.lifeSituations;
  const shouldRenderLoadingSpinner = shouldShowLoadingSpinner({
    isLoading,
    isResolvingServices: false,
    hasListData
  });

  return (
    <ScrollView
      ref={scrollViewRef}
      onContentSizeChange={(_contentWidth, contentHeight) =>
        setShowBackToTop(contentHeight > device.height)
      }
      refreshControl={refreshControl}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.contentContainer}
      style={styles.list}
    >
      {shouldRenderLoadingSpinner ? <LoadingSpinner loading /> : null}

      {!isLoading && !hasListData ? (
        <View style={styles.emptyState}>
          <RegularText placeholder small center>
            {emptyStateMessage}
          </RegularText>
        </View>
      ) : null}

      {listData.map((item, index) => {
        const bottomDivider = index < listData.length - 1;

        if (isCategoryItem(item)) {
          const childCategory = item.data;

          return (
            <LifeSituationListItem
              key={`${item.type}-${childCategory?.id ?? index}`}
              bottomDivider={bottomDivider}
              imageUrl={childCategory?.image?.url ?? undefined}
              title={childCategory?.name ?? ''}
              subtitle={childCategory?.description ?? undefined}
              onPress={() =>
                navigation.push(ScreenName.BusCategory, {
                  areaId,
                  category: childCategory,
                  isRootCategory: false,
                  title: childCategory?.name ?? ''
                })
              }
            />
          );
        }

        const service = item.data;

        return (
          <LifeSituationListItem
            key={`${item.type}-${service?.id ?? index}`}
            bottomDivider={bottomDivider}
            title={service?.name ?? ''}
            onPress={() =>
              navigation.push(ScreenName.BusDetail, {
                areaId,
                title: service?.name ?? '',
                query: '',
                queryVariables: {},
                rootRouteName: 'BUS',
                shareContent: {
                  message: shareMessage(service)
                },
                data: service
              })
            }
          />
        );
      })}

      {showBackToTop && (
        <BackToTop
          onPress={() =>
            scrollViewRef.current?.scrollTo({
              x: 0,
              y: 0,
              animated: true
            })
          }
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: normalize(16)
  },
  list: {
    paddingHorizontal: normalize(16)
  }
});
