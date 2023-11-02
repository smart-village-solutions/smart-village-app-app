import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { Divider, normalize } from 'react-native-elements';

import { SettingsContext } from '../../../SettingsProvider';
import { colors } from '../../../config';
import { BoldText, RegularText } from '../../Text';
import { Wrapper, WrapperRow } from '../../Wrapper';

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
  const { subtitleStyle = {}, textContainer = {}, titleStyle = {} } = sueProgress;

  return (
    <Wrapper>
      <WrapperRow spaceBetween>
        <CircularProgress
          value={(100 * currentProgress) / progress.length}
          activeStrokeColor={colors.primary}
          inActiveStrokeColor={colors.primary + '10'}
          progressValueColor={colors.darkText}
          radius={normalize(30)}
          showProgressValue={false}
          title={`${currentProgress} / ${progress.length}`}
          titleColor={colors.darkText}
          titleStyle={{ fontSize: normalize(12) }}
        />

        {progress?.map(
          (item, index) =>
            index === currentProgress - 1 && (
              <View style={[styles.textContainer, !!textContainer && textContainer]}>
                <BoldText style={!!titleStyle && titleStyle}>{item.title}</BoldText>
                <RegularText small style={!!subtitleStyle && subtitleStyle}>
                  {item.subtitle}
                </RegularText>
              </View>
            )
        )}
      </WrapperRow>
      <Divider style={styles.divider} />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  divider: {
    marginVertical: normalize(14)
  },
  textContainer: {
    width: '80%'
  }
});
