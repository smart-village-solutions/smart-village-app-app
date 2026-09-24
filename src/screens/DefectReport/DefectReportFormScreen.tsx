import { StackNavigationProp } from 'expo-router/js-stack';
import * as Location from 'expo-location';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, Keyboard, RefreshControl } from 'react-native';
import { KeyboardAwareScrollView, KeyboardProvider } from 'react-native-keyboard-controller';
import type { KeyboardAwareScrollViewRef } from 'react-native-keyboard-controller';

import {
  DefectReportCreateForm,
  DefectReportLocationForm,
  HtmlView,
  LoadingContainer,
  ReadAloudContent,
  SafeAreaViewFlex,
  Wrapper
} from '../../components';
import { buildDefectReportCategoryOptions } from '../../helpers/defectReportCategoryOptions';
import { graphqlFetchPolicy } from '../../helpers/graphqlHelper';
import { useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { GET_CATEGORIES } from '../../queries/categories';
import { useReadAloudScrollContentContainerStyle } from '../../ReadAloudAvailabilityProvider';
import { SettingsContext } from '../../SettingsProvider';
import { useTheme } from '../../hooks/useTheme';

/* eslint-disable complexity */
export const DefectReportFormScreen = ({
  navigation,
  route
}: {
  navigation: StackNavigationProp<Record<string, object | undefined>>;
  route: { params?: { consentForDataProcessingText?: string } };
}) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { colors } = useTheme();
  const { globalSettings } = useContext(SettingsContext);
  const scrollContentContainerStyle = useReadAloudScrollContentContainerStyle();
  const [refreshing, setRefreshing] = useState(false);
  const [isLocationSelect, setIsLocationSelect] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Location.LocationObjectCoords>();
  const [isCategorySearchFocused, setIsCategorySearchFocused] = useState(false);
  const scrollViewRef = useRef<KeyboardAwareScrollViewRef>(null);
  const categoryTop = useRef<number | null>(null);

  const scrollCategoryBelowHeader = useCallback(() => {
    if (categoryTop.current !== null) {
      scrollViewRef.current?.scrollTo({ y: Math.max(0, categoryTop.current - 8), animated: true });
    }
  }, []);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', scrollCategoryBelowHeader);
    return () => subscription.remove();
  }, [scrollCategoryBelowHeader]);

  const onCategorySearchFocus = useCallback(
    (y: number) => {
      categoryTop.current = y;
      setIsCategorySearchFocused(true);
      scrollCategoryBelowHeader();
    },
    [scrollCategoryBelowHeader]
  );

  const onCategorySearchBlur = useCallback(() => {
    categoryTop.current = null;
    setIsCategorySearchFocused(false);
  }, []);

  const name = isLocationSelect ? 'defectReportLocationForm' : 'defectReportCreateForm';
  const categoryId = globalSettings?.settings?.defectReports?.categoryId;
  const withoutLocation = globalSettings?.settings?.defectReports?.withoutLocation === true;

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
    fetchPolicy: graphqlFetchPolicy({ isConnected, isMainserverUp }),
    skip: !categoryId
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) {
      await refetchHtml?.();
      await refetchCategories?.();
    }
    setRefreshing(false);
  }, [isConnected, refetchCategories, refetchHtml]);

  if (loadingHtml || loadingCategories) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  const Component = isLocationSelect ? DefectReportLocationForm : DefectReportCreateForm;

  const categoryNameDropdownData = buildDefectReportCategoryOptions(
    dataCategories?.categories?.[0]?.children
  );

  return (
    <SafeAreaViewFlex>
      <KeyboardProvider>
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          bottomOffset={isCategorySearchFocused ? 8 : 120}
          contentContainerStyle={scrollContentContainerStyle}
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
              <ReadAloudContent content={html} contentId="defect-report-intro-content" />
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
              showMap,
              setShowMap,
              withoutLocation,
              categoryNameDropdownData,
              onCategorySearchBlur,
              onCategorySearchFocus
            }}
          />
        </KeyboardAwareScrollView>
      </KeyboardProvider>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */
