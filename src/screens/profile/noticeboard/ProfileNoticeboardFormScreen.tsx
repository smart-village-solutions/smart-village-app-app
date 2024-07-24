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
} from '../../../components';
import { colors } from '../../../config';
import { useStaticContent } from '../../../hooks';
import { NetworkContext } from '../../../NetworkProvider';

export const ProfileNoticeboardFormScreen = ({
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
          <Wrapper>{!!dataHtml && <HtmlView html={dataHtml} />}</Wrapper>

          <Component {...{ data: details, navigation, route }} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
