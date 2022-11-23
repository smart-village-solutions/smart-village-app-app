import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native';

import {
  BoldText,
  DefaultKeyboardAvoidingView,
  HtmlView,
  LoadingContainer,
  NoticeboardCreateForm,
  NoticeboardMessageForm,
  RegularText,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  TitleShadow,
  Wrapper,
  WrapperRow,
  WrapperWithOrientation
} from '../../components';
import { colors, consts, device, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';

const a11yText = consts.a11yLabel;

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
        <ActivityIndicator color={colors.accent} />
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
              colors={[colors.accent]}
              tintColor={colors.accent}
            />
          }
        >
          <WrapperWithOrientation>
            {!!details?.contentBlocks?.[0]?.title && (
              <>
                <TitleContainer>
                  <Title
                    accessibilityLabel={`(${texts.noticeboard.noticeboard}) ${a11yText.heading}`}
                  >
                    {details.contentBlocks[0].title}
                  </Title>
                </TitleContainer>
                {device.platform === 'ios' && <TitleShadow />}
              </>
            )}

            {!!html && (
              <Wrapper>
                {/* @ts-expect-error HtmlView uses memo in js, which is not inferred correctly */}
                <HtmlView html={html} />
              </Wrapper>
            )}

            {!!details?.dates?.[0] && (
              <Wrapper>
                {!!details?.dates?.[0]?.dateStart && (
                  <WrapperRow>
                    <BoldText>{texts.noticeboard.publicationDate}: </BoldText>
                    <RegularText>{momentFormat(details.dates[0].dateStart)}</RegularText>
                  </WrapperRow>
                )}
                {!!details?.dates?.[0]?.dateEnd && (
                  <WrapperRow>
                    <BoldText>{texts.noticeboard.expiryDate}: </BoldText>
                    <RegularText>{momentFormat(details.dates[0].dateEnd)}</RegularText>
                  </WrapperRow>
                )}
              </Wrapper>
            )}

            <Component {...{ data: details, navigation, route }} />
          </WrapperWithOrientation>
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */
