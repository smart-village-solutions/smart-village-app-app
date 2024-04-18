import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native';

import {
  DefaultKeyboardAvoidingView,
  HtmlView,
  LoadingContainer,
  NoticeboardCreateForm,
  NoticeboardMessageForm,
  SafeAreaViewFlex,
  Wrapper
} from '../../components';
import { colors } from '../../config';
import { useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';

/* eslint-disable complexity */
export const NoticeboardFormScreen = ({
  navigation,
  route
}: {
  navigation: StackNavigationProp<any>;
  route: any;
}) => {
  const { isConnected } = useContext(NetworkContext);
  const [refreshing, setRefreshing] = useState(false);

  const name = route?.params?.name ?? '';
  const isNewEntryForm = route?.params?.isNewEntryForm ?? false;
  const details = route?.params?.details ?? {};

  const {
    data: dataHtml,
    loading: loadingHtml,
    refetch: refetchHtml
  } = useStaticContent<string>({
    name: name,
    type: 'html',
    skip: !name
  });

  const html = dataHtml || details?.contentBlocks?.[0]?.body;

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
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  const Component = isNewEntryForm ? NoticeboardCreateForm : NoticeboardMessageForm;

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

          <Component {...{ data: details, navigation, route }} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */
