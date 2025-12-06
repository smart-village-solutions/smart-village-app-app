import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native';

import {
  DefaultKeyboardAvoidingView,
  DefectReportCreateForm,
  DefectReportLocationForm,
  HtmlView,
  LoadingContainer,
  SafeAreaViewFlex,
  Wrapper
} from '../../components';
import { colors } from '../../config';
import { useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { GET_CATEGORIES } from '../../queries/categories';
import { SettingsContext } from '../../SettingsProvider';

/* eslint-disable complexity */
/**
 * Guides users through the defect report workflow, toggling between map/location selection and
 * the form while reloading HTML content and categories on demand.
 */
export const DefectReportFormScreen = ({
  navigation,
  route
}: {
  navigation: StackNavigationProp<any>;
  route: any;
}) => {
  const { isConnected } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const [refreshing, setRefreshing] = useState(false);
  const [isLocationSelect, setIsLocationSelect] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<Location.LocationObjectCoords>();

  const name = isLocationSelect ? 'defectReportLocationForm' : 'defectReportCreateForm';
  const categoryId = globalSettings?.settings?.defectReports?.categoryId;

  const {
    data: html,
    loading: loadingHtml,
    refetch: refetchHtml
  } = useStaticContent<string>({
    name: name,
    type: 'html',
    skip: !name
  });

  const {
    data: dataCategories,
    loading: loadingCategories,
    refetch: refetchCategories
  } = useQuery(GET_CATEGORIES, {
    variables: { ids: [categoryId] },
    skip: !categoryId
  });

  /**
   * Refetches static HTML and category data when the user performs a pull-to-refresh gesture.
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) {
      await refetchHtml?.();
      await refetchCategories?.();
    }
    setRefreshing(false);
  }, [isConnected, refetchHtml]);

  if (loadingHtml || loadingCategories) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  const Component = isLocationSelect ? DefectReportLocationForm : DefectReportCreateForm;

  const categoryNameDropdownData =
    dataCategories?.categories?.[0]?.children?.map((category) => ({
      id: category.id,
      name: category.name,
      value: category.name
    })) || [];

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.refreshControl]}
              tintColor={colors.refreshControl}
            />
          }
        >
          {!!html && (
            <Wrapper>
              {/* @ts-expect-error HtmlView uses memo in js, which is not inferred correctly */}
              <HtmlView html={html} />
            </Wrapper>
          )}

          <Component
            {...{
              navigation,
              route,
              setIsLocationSelect,
              selectedPosition,
              setSelectedPosition,
              categoryNameDropdownData
            }}
          />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */
