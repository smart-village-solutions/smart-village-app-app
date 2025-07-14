import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native';

import {
  BoldText,
  DefaultKeyboardAvoidingView,
  DocumentList,
  HtmlView,
  ImageSection,
  LoadingContainer,
  NoticeboardCreateForm,
  NoticeboardMessageForm,
  ProfileNoticeboardCreateForm,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperRow
} from '../../components';
import { colors, texts } from '../../config';
import { momentFormat } from '../../helpers';
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
  const isLoginRequired = route?.params?.isLoginRequired || false;
  const isNewEntryForm = route?.params?.isNewEntryForm ?? false;
  const details = route?.params?.details ?? {};
  const queryVariables = route?.params?.queryVariables ?? {};

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

  const images = details?.mediaContents?.filter((item) => item.contentType === 'image');

  const CreateFormComponent = isLoginRequired
    ? ProfileNoticeboardCreateForm
    : NoticeboardCreateForm;
  const Component = isNewEntryForm ? CreateFormComponent : NoticeboardMessageForm;

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
          {!!images?.length && <ImageSection mediaContents={images} />}

          <SectionHeader big title={details?.contentBlocks?.[0]?.title || details?.title} />

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

          {!!details?.mediaContents?.some((media) => media.contentType === 'application/pdf') && (
            <DocumentList
              documents={details.mediaContents.filter(
                (media) => media.contentType === 'application/pdf'
              )}
            />
          )}

          <Component {...{ data: details, navigation, route, queryVariables }} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */
