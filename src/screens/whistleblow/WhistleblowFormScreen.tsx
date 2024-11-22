import { StackNavigationProp } from '@react-navigation/stack';
import { setStringAsync } from 'expo-clipboard';
import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import {
  DefaultKeyboardAvoidingView,
  HtmlView,
  LoadingContainer,
  RegularText,
  SafeAreaViewFlex,
  WhistleblowReportForm,
  Wrapper,
  WrapperRow
} from '../../components';
import { colors, Icon, normalize } from '../../config';
import { useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';

export const WhistleblowFormScreen = ({
  navigation,
  route
}: {
  navigation: StackNavigationProp<any>;
  route: any;
}) => {
  const { isConnected } = useContext(NetworkContext);
  const [refreshing, setRefreshing] = useState(false);
  const [reportCode, setReportCode] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const name = route?.params?.name ?? '';

  const {
    data: html,
    loading: loadingHtml,
    refetch: refetchHtml
  } = useStaticContent<string>({
    name: reportCode ? `${name}ReportCode` : name,
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

  const copyToClipboard = async () => {
    try {
      await setStringAsync(reportCode);
      setIsCopied((previousValue) => !previousValue);

      setTimeout(() => {
        setIsCopied((previousValue) => !previousValue);
      }, 2500);
    } catch (error) {
      console.error(error);
    }
  };

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

          {reportCode ? (
            <Wrapper>
              <WrapperRow center>
                <RegularText style={styles.reportCode}>{reportCode}</RegularText>
                <TouchableOpacity onPress={copyToClipboard} disabled={isCopied}>
                  {isCopied ? (
                    <Icon.Check color={colors.darkText} />
                  ) : (
                    <Icon.Copy color={colors.darkText} />
                  )}
                </TouchableOpacity>
              </WrapperRow>
            </Wrapper>
          ) : (
            <WhistleblowReportForm navigation={navigation} setReportCode={setReportCode} />
          )}
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  reportCode: {
    marginRight: normalize(8),
    marginTop: normalize(2)
  }
});
