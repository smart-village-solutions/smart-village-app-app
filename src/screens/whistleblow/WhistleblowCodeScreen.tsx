import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native';

import {
  DefaultKeyboardAvoidingView,
  HtmlView,
  Label,
  LoadingContainer,
  RegularText,
  SafeAreaViewFlex,
  WhistleblowReportCode,
  Wrapper
} from '../../components';
import { colors, texts } from '../../config';
import { useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { SettingsContext } from '../../SettingsProvider';

export type Report = {
  questionnaires: [
    {
      anwers: {
        [key: string]: [{ index: string; value: string }];
      };
    }
  ];
};

export const WhistleblowCodeScreen = ({
  navigation,
  route
}: {
  navigation: StackNavigationProp<any>;
  route: any;
}) => {
  const { isConnected } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { whistleblow = {} } = globalSettings;
  const { globaleaks: globaleaksConfig = {} } = whistleblow;
  const { form: formConfig = {}, editInfo } = globaleaksConfig;
  const { answers: answersConfig = {} } = formConfig;
  const [refreshing, setRefreshing] = useState(false);
  const [report, setReport] = useState<Report>();

  const name = route?.params?.name ?? '';

  const {
    data: html,
    loading: loadingHtml,
    refetch: refetchHtml
  } = useStaticContent<string>({
    name,
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

  const answers = report?.questionnaires?.[0]?.answers;

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
          {answers ? (
            <>
              {!!answers[answersConfig.email.id]?.[0]?.value && (
                <Wrapper>
                  <Label>{texts.whistleblow.inputMail}</Label>
                  <RegularText>{answers[answersConfig.email.id]?.[0]?.value}</RegularText>
                </Wrapper>
              )}
              {!!answers[answersConfig.title.id]?.[0]?.value && (
                <Wrapper>
                  <Label>{texts.whistleblow.inputTitle}</Label>
                  <RegularText>{answers[answersConfig.title.id]?.[0]?.value}</RegularText>
                </Wrapper>
              )}
              {!!answers[answersConfig.body.id]?.[0]?.value && (
                <Wrapper>
                  <Label>{texts.whistleblow.inputDescription}</Label>
                  <RegularText>{answers[answersConfig.body.id]?.[0]?.value}</RegularText>
                </Wrapper>
              )}

              {!!editInfo && (
                <Wrapper>
                  {/* @ts-expect-error HtmlView uses memo in js, which is not inferred correctly */}
                  <HtmlView html={editInfo} />
                </Wrapper>
              )}
            </>
          ) : (
            <>
              {!!html && (
                <Wrapper>
                  {/* @ts-expect-error HtmlView uses memo in js, which is not inferred correctly */}
                  <HtmlView html={html} />
                </Wrapper>
              )}
              <WhistleblowReportCode navigation={navigation} setReport={setReport} />
            </>
          )}
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
