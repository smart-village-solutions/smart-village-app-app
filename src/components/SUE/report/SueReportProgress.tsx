import React, { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Divider, normalize } from 'react-native-elements';

import { SettingsContext } from '../../../SettingsProvider';
import { BoldText, RegularText } from '../../Text';
import { Wrapper, WrapperRow } from '../../Wrapper';
import { colors } from '../../../config';

type TProgress = {
  title: string;
  subtitle: string;
}[];

export const SueReportProgress = ({
  progress,
  currentProgress
}: {
  progress: TProgress;
  currentProgress: number;
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { appDesignSystem = {} } = globalSettings;
  const { sueProgress = {} } = appDesignSystem;
  const {
    containerStyle = {},
    subtitleStyle = {},
    textContainer = {},
    titleStyle = {}
  } = sueProgress;

  return progress?.map(
    (item, index) =>
      index === currentProgress - 1 && (
        <Wrapper key={index}>
          <WrapperRow spaceBetween>
            <View style={[styles.progressContainer, !!containerStyle && containerStyle]}>
              <Text>
                {currentProgress} / {progress.length}
              </Text>
            </View>
            <View style={[styles.textContainer, !!textContainer && textContainer]}>
              <BoldText style={!!titleStyle && titleStyle}>{item.title}</BoldText>
              <RegularText small style={!!subtitleStyle && subtitleStyle}>
                {item.subtitle}
              </RegularText>
            </View>
          </WrapperRow>
          <Divider style={styles.divider} />
        </Wrapper>
      )
  );
};

const styles = StyleSheet.create({
  divider: {
    marginVertical: normalize(14)
  },
  textContainer: {
    width: '80%'
  },
  progressContainer: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: normalize(30),
    borderWidth: normalize(6),
    height: normalize(60),
    justifyContent: 'center',
    width: normalize(60)
  }
});
