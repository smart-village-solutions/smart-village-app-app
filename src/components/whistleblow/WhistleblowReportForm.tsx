import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, StyleSheet } from 'react-native';

import { Button, Input, LoadingModal, RegularText, Touchable, Wrapper } from '../../components';
import { colors, consts, texts } from '../../config';
import { Globaleaks } from '../../helpers';
import { SettingsContext } from '../../SettingsProvider';

const { EMAIL_REGEX } = consts;

type WhistleblowReportData = {
  body: string;
  email: string;
  file: string;
  title: string;
};

export const WhistleblowReportForm = ({
  navigation,
  setReportCode
}: {
  navigation: StackNavigationProp<any>;
  setReportCode: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { whistleblow = {} } = globalSettings;
  const { globaleaks: globaleaksConfig = {} } = whistleblow;
  const { endpoint, form: formConfig = {} } = globaleaksConfig;
  const { contextId, answers: answersConfig = {}, receivers, identityProvided, score } = formConfig;

  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm({
    defaultValues: {
      body: '',
      email: '',
      // file: '',
      title: ''
    }
  });
  const globaleaks = new Globaleaks(endpoint);

  const onSubmit = async (whistleblowReportData: WhistleblowReportData) => {
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const body = {
        context_id: contextId,
        answers: {
          [answersConfig.email.id]: [
            {
              required_status: answersConfig.email.reportStatus,
              value: whistleblowReportData.email
            }
          ],
          [answersConfig.title.id]: [
            {
              required_status: answersConfig.title.reportStatus,
              value: whistleblowReportData.title
            }
          ],
          [answersConfig.body.id]: [
            {
              required_status: answersConfig.body.reportStatus,
              value: whistleblowReportData.body
            }
          ]
        },
        identity_provided: identityProvided,
        receivers,
        score
      };

      // Globaleaks flow
      const receipt = await globaleaks.report(body);
      setReportCode(receipt);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="email"
          label={`${texts.whistleblow.inputMail}`}
          placeholder={texts.whistleblow.inputMail}
          keyboardType="email-address"
          autoCapitalize="none"
          validate
          rules={{
            pattern: {
              value: EMAIL_REGEX,
              message: `${texts.whistleblow.inputMail}${texts.whistleblow.invalidMail}`
            }
          }}
          errorMessage={errors.email && errors.email.message}
          control={control}
          disabled={isLoading}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="title"
          label={`${texts.whistleblow.inputTitle} *`}
          placeholder={texts.whistleblow.inputTitle}
          validate
          rules={{
            required: `${texts.whistleblow.inputTitle} ${texts.whistleblow.inputErrorText}`
          }}
          errorMessage={errors.title && errors.title.message}
          control={control}
          disabled={isLoading}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="body"
          label={`${texts.whistleblow.inputDescription} *`}
          placeholder={texts.whistleblow.inputDescription}
          validate
          multiline
          rules={{
            required: `${texts.whistleblow.inputDescription} ${texts.whistleblow.inputErrorText}`
          }}
          errorMessage={errors.body && errors.body.message}
          control={control}
          disabled={isLoading}
        />
      </Wrapper>

      {/* <Wrapper style={styles.noPaddingTop}>
        <Input
          name="file"
          label={texts.whistleblow.inputFile}
          placeholder={texts.whistleblow.inputFile}
          validate
          errorMessage={errors.file && errors.file.message}
          control={control}
        />
      </Wrapper> */}

      <Wrapper style={styles.noPaddingTop}>
        <Button
          onPress={handleSubmit(onSubmit)}
          title={texts.whistleblow.send}
          disabled={isLoading}
        />

        <Touchable onPress={() => (isLoading ? null : navigation.goBack())}>
          <RegularText primary center>
            {texts.whistleblow.abort}
          </RegularText>
        </Touchable>
      </Wrapper>

      <LoadingModal loading={isLoading} />
    </>
  );
};

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  },
  checkboxContainerStyle: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0
  },
  checkboxTextStyle: {
    color: colors.darkText,
    fontWeight: 'normal'
  }
});
