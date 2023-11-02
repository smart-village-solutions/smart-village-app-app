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

export const SueReportDone = ({ navigation }: { navigation: any }) => {
  const { globalSettings } = useContext(SettingsContext);
  const { sections = {} } = globalSettings;
  const { reportEndScreen = {} } = sections;
  const { title = '', subTitle = '' } = reportEndScreen;

  return (
    <>
      <Wrapper>
        <BoldText center>{title}</BoldText>
      </Wrapper>
      <Wrapper>
        <RegularText center>{subTitle}</RegularText>
      </Wrapper>

      <Wrapper>
        <Image
          source={require('../../../../assets/lottie/SUE/cleaning.gif')}
          containerStyle={styles.image}
        />
      </Wrapper>

      <Wrapper>
        <Button
          title="Zur Meldungsliste"
          invert
          notFullWidth
          onPress={() => navigation.navigate(ScreenName.SueList)}
        />
      </Wrapper>
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
