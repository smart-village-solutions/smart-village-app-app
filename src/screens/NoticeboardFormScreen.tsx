import { StackNavigationProp } from '@react-navigation/stack';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';
import React, { useCallback, useContext, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Control, Controller, DeepMap, FieldValues, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import {
  BoldText,
  Button,
  Checkbox,
  DateTimeInput,
  HtmlView,
  Input,
  LoadingContainer,
  RegularText,
  Title,
  TitleContainer,
  TitleShadow,
  Touchable,
  Wrapper,
  WrapperRow
} from '../components';
import { colors, consts, device, texts } from '../config';
import { momentFormat } from '../helpers';
import { useStaticContent } from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { CREATE_GENERIC_ITEM } from '../queries/genericItem';
import { NoticeboardType } from '../types';

const a11yText = consts.a11yLabel;

type NoticeboardFormScreenDataType = {
  contentBlocks: [{ body: string; title: string }];
  createdAt?: string;
  dates: [{ dateEnd: string; dateStart: string }];
  title: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
/* eslint-disable complexity */
export const NoticeboardFormScreen = ({
  data,
  navigation,
  route
}: {
  data: NoticeboardFormScreenDataType;
  navigation: StackNavigationProp<any>;
  route: any;
}) => {
  const { isConnected } = useContext(NetworkContext);
  const [refreshing, setRefreshing] = useState(false);

  const consentForDataProcessingTex = route?.params?.consentForDataProcessingText ?? '';
  const genericType = route?.params?.genericType ?? '';
  const name = route?.params?.name ?? '';
  const newEntryForm = route?.params?.newEntryForm ?? false;

  const {
    data: dataHtml,
    loading: loadingHtml,
    refetch: refetchHtml
  } = useStaticContent<string>({
    name: name,
    type: 'html',
    skip: !name
  });

  const html = dataHtml || data?.contentBlocks?.[0]?.body;

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

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.accent]}
          tintColor={colors.accent}
        />
      }
    >
      {!!data?.contentBlocks?.[0]?.title && (
        <>
          <TitleContainer>
            <Title accessibilityLabel={`(${texts.noticeboard.noticeboard}) ${a11yText.heading}`}>
              {data.contentBlocks[0].title}
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

      {!!data?.dates?.[0]?.dateStart && (
        <Wrapper>
          <WrapperRow>
            <BoldText>{texts.noticeboard.publicationDate}: </BoldText>
            <RegularText>{momentFormat(data.dates[0].dateStart)}</RegularText>
          </WrapperRow>
        </Wrapper>
      )}

      {!!data?.dates?.[0]?.dateEnd && (
        <Wrapper>
          <WrapperRow>
            <BoldText>{texts.noticeboard.expiryDate}: </BoldText>
            <RegularText>{momentFormat(data.dates[0].dateEnd)}</RegularText>
          </WrapperRow>
        </Wrapper>
      )}

    </ScrollView>
  );
};
/* eslint-enable complexity */
