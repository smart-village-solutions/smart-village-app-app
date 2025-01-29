import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard } from 'react-native';

import { SettingsContext } from '../../SettingsProvider';
import { Button, Input, LoadingModal, RegularText, Touchable, Wrapper } from '../../components';
import { texts } from '../../config';
import { Globaleaks } from '../../helpers';
import { Report } from '../../screens';

type WhistleblowCodeData = {
  reportCode: string;
};

export const WhistleblowReportCode = ({
  navigation,
  setReport
}: {
  navigation: StackNavigationProp<any>;
  setReport: React.Dispatch<React.SetStateAction<Report | undefined>>;
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { whistleblow = {} } = globalSettings;
  const { globaleaks: globaleaksConfig = {} } = whistleblow;
  const { endpoint } = globaleaksConfig;

  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm({
    defaultValues: {
      reportCode: ''
    }
  });
  const globaleaks = new Globaleaks(endpoint);

  const onSubmit = async (whistleblowCodeData: WhistleblowCodeData) => {
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const report = await globaleaks.show(whistleblowCodeData.reportCode);
      setReport(report);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Wrapper noPaddingTop>
        <Input
          name="reportCode"
          label={`${texts.whistleblow.inputCode}`}
          placeholder={texts.whistleblow.inputCode}
          autoCapitalize="none"
          validate
          rules={{
            required: `${texts.whistleblow.inputCode} ${texts.whistleblow.inputErrorText}`
          }}
          errorMessage={errors.reportCode && errors.reportCode.message}
          control={control}
          disabled={isLoading}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Button
          onPress={handleSubmit(onSubmit)}
          title={texts.whistleblow.sendCode}
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
