/* eslint-disable complexity */
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';

import { SettingsContext } from '../../../SettingsProvider';
import { device, normalize } from '../../../config';
import { ScreenName } from '../../../types';
import { Image } from '../../Image';
import { BoldText, RegularText } from '../../Text';
import { Wrapper } from '../../Wrapper';
import { Button } from '../../Button';

export const SueReportDone = ({
  isDone,
  isLoading,
  navigation
}: {
  isDone: boolean;
  isLoading: boolean;
  navigation: any;
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { appDesignSystem = {} } = globalSettings;
  const { sueReportScreen = {} } = appDesignSystem;
  const { reportSendDone = {}, reportSendLoading = {} } = sueReportScreen;
  const { title: loadingTitle = '', subtitle: loadingSubtitle = '' } = reportSendLoading;
  const { title: doneTitle = '', subtitle: doneSubtitle = '' } = reportSendDone;

  const title = isDone ? doneTitle : loadingTitle;
  const subtitle = isDone ? doneSubtitle : loadingSubtitle;

  return (
    <>
      <Wrapper>
        <BoldText center>{title}</BoldText>
      </Wrapper>
      <Wrapper>
        <RegularText center>{subtitle}</RegularText>
      </Wrapper>

      <Wrapper>
        <Image
          source={require('../../../../assets/lottie/SUE/cleaning.gif')}
          containerStyle={styles.image}
        />
      </Wrapper>

      {!isLoading && isDone && (
        <Wrapper>
          <Button
            title="Zur Meldungsliste"
            invert
            notFullWidth
            onPress={() => navigation.navigate(ScreenName.SueList)}
          />
        </Wrapper>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  image: {
    height: normalize(50),
    width: device.width,
    alignSelf: 'center'
  }
});
