import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { Divider, normalize } from 'react-native-elements';

import { ConfigurationsContext } from '../../../ConfigurationsProvider';
import { colors, texts } from '../../../config';
import { BoldText, RegularText } from '../../Text';
import { Wrapper, WrapperRow } from '../../Wrapper';

type TProgress = {
  title: string;
  subtitle: string;
}[];

export const SueReportProgress = ({
  progress,
  currentProgress,
  isFullscreenMap
}: {
  progress: TProgress;
  currentProgress: number;
  isFullscreenMap: boolean;
}) => {
  const { appDesignSystem = {} } = useContext(ConfigurationsContext);
  const { sueProgress = {} } = appDesignSystem;
  const { subtitleStyle = {}, textContainer = {}, titleStyle = {} } = sueProgress;

  return (
    <Wrapper style={[styles.noPaddingBottom, isFullscreenMap && styles.wrapperHidden]}>
      <WrapperRow spaceBetween>
        <View accessibilityElementsHidden>
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
        </View>

        {progress?.map(
          (item, index) =>
            index === currentProgress - 1 && (
              <View
                key={`progress-${currentProgress}`}
                style={[styles.textContainer, !!textContainer && textContainer]}
              >
                <BoldText
                  accessibilityLabel={`${texts.components.sueReportProgress(
                    currentProgress,
                    progress.length
                  )} (${item.title})`}
                  style={!!titleStyle && titleStyle}
                >
                  {item.title}
                </BoldText>
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
    marginTop: normalize(14)
  },
  noPaddingBottom: {
    paddingBottom: 0
  },
  textContainer: {
    width: '80%'
  },
  wrapperHidden: {
    display: 'none'
  }
});
