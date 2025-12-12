/* eslint-disable complexity */
import moment from 'moment';
import React, { useContext, useRef, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Rating } from 'react-native-elements';

import appJson from '../../../../app.json';
import { ConfigurationsContext } from '../../../ConfigurationsProvider';
import { colors, device, normalize, texts } from '../../../config';
import { useKeyboardHeight } from '../../../hooks';
import { QUERY_TYPES, createQuery } from '../../../queries';
import { ScreenName } from '../../../types';
import { Button } from '../../Button';
import { DefaultKeyboardAvoidingView } from '../../DefaultKeyboardAvoidingView';
import { Image } from '../../Image';
import { BoldText, RegularText } from '../../Text';
import { Wrapper } from '../../Wrapper';
import { Input } from '../../form';

type TNewContent = {
  message: string;
  rating: number;
};

export const SueReportSend = ({
  isDone,
  isLoading,
  navigation
}: {
  isDone: boolean;
  isLoading: boolean;
  navigation: any;
}) => {
  const { sueConfig = {} } = useContext(ConfigurationsContext);
  const { sueReportScreen = {} } = sueConfig;
  const {
    defaultRating = 0,
    feedbackFormTexts = texts.sue.report.sendReportDone,
    reportSendDone = {},
    reportSendLoading = {},
    showFeedbackSection: feedbackSection
  } = sueReportScreen;
  const { title: loadingTitle = '', subtitle: loadingSubtitle = '' } = reportSendLoading;
  const { title: doneTitle = '', subtitle: doneSubtitle = '' } = reportSendDone;
  const { feedbackHeader, ratingTitle, messageTitle, messagePlaceholder } = feedbackFormTexts;
  const [showFeedbackSection, setShowFeedbackSection] = useState(feedbackSection);
  const [rating, setRating] = useState(defaultRating);

  const keyboardHeight = useKeyboardHeight();
  const scrollViewRef = useRef(null);

  const { control, reset, handleSubmit, getValues } = useForm({
    defaultValues: {
      message: '',
      rating
    }
  });

  const title = isDone ? doneTitle : loadingTitle;
  const subtitle = isDone ? doneSubtitle : loadingSubtitle;

  const [createAppUserContent, { loading }] = useMutation(
    createQuery(QUERY_TYPES.APP_USER_CONTENT)
  );

  const onSubmit = async (createAppUserContentNewData: TNewContent) => {
    Keyboard.dismiss();

    const formData = {
      dataType: 'json',
      dataSource: 'form',
      content: JSON.stringify({
        action: 'notify_and_destroy',
        appVersion: appJson.expo.version,
        created_At: moment().format('YYYY-MM-DD HH:mm:ss'),
        ...createAppUserContentNewData
      })
    };

    try {
      await createAppUserContent({ variables: formData });

      Alert.alert(texts.feedbackScreen.alert.title, texts.feedbackScreen.alert.message, [
        {
          onPress: () => {
            reset();
            setShowFeedbackSection(false);
          }
        }
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DefaultKeyboardAvoidingView>
      <ScrollView keyboardShouldPersistTaps="handled" ref={scrollViewRef}>
        <Wrapper>
          <BoldText big center>
            {title}
          </BoldText>
        </Wrapper>
        <Wrapper>
          <RegularText center>{subtitle}</RegularText>
        </Wrapper>

        <Wrapper>
          <Image
            source={require('../../../../assets/lottie/SUE/cleaning.gif')}
            style={styles.image}
            resizeMode="contain"
          />
        </Wrapper>

        {!isLoading && isDone && (
          <Wrapper>
            <Button
              invert
              notFullWidth
              onPress={() => navigation.navigate(ScreenName.SueList)}
              title={texts.sue.report.sendReportDone.toEntryList}
            />

            {showFeedbackSection && (
              <>
                <Divider />

                <View style={styles.feedbackContainer}>
                  <View style={styles.headerContainer}>
                    <BoldText>{feedbackHeader}</BoldText>
                  </View>

                  <View style={styles.ratingContainer}>
                    <RegularText small style={styles.labelText}>
                      {ratingTitle}
                    </RegularText>

                    <Controller
                      name="rating"
                      render={({ field: { onChange, value } }) => (
                        <Rating
                          imageSize={normalize(24)}
                          onFinishRating={(value: number) => {
                            onChange(value);
                            setRating(value);
                          }}
                          ratingColor={colors.primary}
                          startingValue={value}
                          style={styles.rating}
                          tintColor={colors.lighterPrimary}
                          type="custom"
                        />
                      )}
                      control={control}
                    />
                  </View>

                  <View style={styles.headerContainer}>
                    <RegularText small style={styles.labelText}>
                      {messageTitle}
                    </RegularText>

                    <Input
                      control={control}
                      inputContainerStyle={styles.inputContainer}
                      inputStyle={styles.textArea}
                      multiline
                      name="message"
                      onFocus={() =>
                        scrollViewRef.current?.scrollTo({ x: 0, y: 250, animated: true })
                      }
                      placeholder={messagePlaceholder}
                      textAlignVertical="top"
                    />
                  </View>

                  <Button
                    disabled={loading || rating === 0}
                    onPress={handleSubmit(onSubmit)}
                    title={
                      loading
                        ? texts.feedbackScreen.sendButton.disabled
                        : texts.sue.report.sendReportDone.sendButton
                    }
                  />
                </View>

                {device.platform === 'android' && (
                  <View style={{ height: normalize(keyboardHeight) * 0.8 }} />
                )}
              </>
            )}
          </Wrapper>
        )}
      </ScrollView>
    </DefaultKeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  feedbackContainer: {
    backgroundColor: colors.lighterPrimary,
    borderRadius: normalize(8),
    flex: 1,
    marginTop: normalize(24),
    padding: normalize(24)
  },
  headerContainer: {
    marginBottom: normalize(24)
  },
  image: {
    alignSelf: 'center',
    height: normalize(50),
    width: '100%'
  },
  inputContainer: {
    borderColor: colors.transparent
  },
  labelText: {
    marginBottom: normalize(8)
  },
  rating: {
    alignSelf: 'flex-start'
  },
  ratingContainer: {
    marginBottom: normalize(8)
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: normalize(8),
    height: normalize(168)
  }
});
