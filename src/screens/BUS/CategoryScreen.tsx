import React from 'react';
import { RefreshControl } from 'react-native';

import { DefaultKeyboardAvoidingView } from '../../components/DefaultKeyboardAvoidingView';
import { LifeSituationsList } from '../../components/BUS/LifeSituationsList';
import { SafeAreaViewFlex } from '../../components/SafeAreaViewFlex';
import { colors } from '../../config';
import { useBusCategoryChildren, useBusServices, useMatomoTrackScreenView } from '../../hooks';
import type { BusCategory } from '../../types';

type CategoryRouteParams = {
  areaId?: string | number;
  category?: BusCategory;
  isRootCategory?: boolean;
  title?: string;
};

type CategoryScreenProps = {
  navigation: {
    push: (screen: string, params: Record<string, unknown>) => void;
  };
  route: {
    params?: CategoryRouteParams;
  };
};

const hasValidCategoryId = (category?: BusCategory) =>
  category?.id !== null && category?.id !== undefined && `${category.id}`.trim().length > 0;

export const CategoryScreen = ({ navigation, route }: CategoryScreenProps) => {
  const areaId = route?.params?.areaId;
  const category = route?.params?.category;
  const isRootCategory = route?.params?.isRootCategory ?? false;
  const {
    data = [],
    isError = false,
    isFetching = false,
    isLoading = false,
    refetch
  } = useBusCategoryChildren(category?.id, areaId);
  const { data: services = [], isLoading: isServicesLoading = false } = useBusServices(areaId);
  const childCategories = isError ? [] : data;

  useMatomoTrackScreenView(`BUS/${category?.name || 'Lebenslagen'}`);

  if (!hasValidCategoryId(category)) {
    return null;
  }

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <LifeSituationsList
          navigation={navigation}
          areaId={areaId}
          category={category}
          childCategories={childCategories}
          isError={isError}
          isLoading={isLoading}
          isRootCategory={isRootCategory}
          isServicesLoading={isServicesLoading}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              colors={[colors.refreshControl]}
              tintColor={colors.refreshControl}
            />
          }
          services={services}
        />
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
