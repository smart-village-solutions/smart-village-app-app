import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native';

import {
  DefaultKeyboardAvoidingView,
  DefectReportCreateForm,
  DefectReportLocationForm,
  HtmlView,
  LoadingContainer,
  SafeAreaViewFlex,
  Wrapper,
  WrapperWithOrientation
} from '../../components';
import { colors } from '../../config';
import { useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';

/* eslint-disable complexity */
export const DefectReportFormScreen = ({
  navigation,
  route
}: {
  navigation: StackNavigationProp<any>;
  route: any;
}) => {
  const { isConnected } = useContext(NetworkContext);
  const [refreshing, setRefreshing] = useState(false);
  const [isLocationSelect, setIsLocationSelect] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<Location.LocationObjectCoords>();

  const name = isLocationSelect ? 'defectReportLocationForm' : 'defectReportCreateForm';

  const {
    data: html,
    loading: loadingHtml,
    refetch: refetchHtml
  } = useStaticContent<string>({
    name: name,
    type: 'html',
    skip: !name
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) {
      await refetchHtml?.();
    }
    setRefreshing(false);
  }, [isConnected, refetchHtml]);

  if (loadingHtml) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const Component = isLocationSelect ? DefectReportLocationForm : DefectReportCreateForm;

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.accent]}
              tintColor={colors.accent}
            />
          }
        >
          <WrapperWithOrientation>
            {!!html && (
              <Wrapper>
                {/* @ts-expect-error HtmlView uses memo in js, which is not inferred correctly */}
                <HtmlView html={html} />
              </Wrapper>
            )}

            <Component
              {...{ navigation, route, setIsLocationSelect, selectedPosition, setSelectedPosition }}
            />
          </WrapperWithOrientation>
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */
