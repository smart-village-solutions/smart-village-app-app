import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Overlay } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { consts, Icon, normalize } from '../config';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../hooks/useTheme';

import { Button } from './Button';
import { HeadlineText, RegularText } from './Text';
import { Wrapper, WrapperHorizontal } from './Wrapper';

type OtaUpdateBannerProps = {
  actionLabel: string;
  backgroundColor?: string;
  closeLabel: string;
  description: string;
  isReloading?: boolean;
  onDismiss: () => void;
  onPress: () => void;
  title: string;
  visible: boolean;
};

export const OtaUpdateBanner = ({
  actionLabel,
  backgroundColor: backgroundColorProp,
  closeLabel,
  description,
  isReloading = false,
  onDismiss,
  onPress,
  title,
  visible
}: OtaUpdateBannerProps) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const backgroundColor = backgroundColorProp || colors.surface;
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Overlay
      animationType="fade"
      isVisible={visible}
      onBackdropPress={onDismiss}
      overlayStyle={[
        styles.overlayWidth,
        styles.overlayPosition,
        { backgroundColor, top: insets.top + normalize(20) }
      ]}
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={[styles.containerRadius, { backgroundColor }]}>
        <TouchableOpacity
          accessibilityLabel={`${closeLabel} ${consts.a11yLabel.button}`}
          onPress={onDismiss}
          style={styles.closeButton}
          testID="ota-update-dismiss"
        >
          <Icon.Close color={backgroundColor} size={normalize(16)} />
        </TouchableOpacity>

        <Wrapper style={styles.smallPaddingBottom}>
          <WrapperHorizontal>
            <HeadlineText center>{title}</HeadlineText>
          </WrapperHorizontal>
        </Wrapper>

        <Wrapper noPaddingTop>
          <WrapperHorizontal>
            <RegularText center small>
              {description}
            </RegularText>
          </WrapperHorizontal>
        </Wrapper>

        <WrapperHorizontal>
          <Button
            invert
            small
            notFullWidth
            disabled={isReloading}
            onPress={onPress}
            title={actionLabel}
          />
        </WrapperHorizontal>
      </View>
    </Overlay>
  );
};

const createStyles = (colors) => ({
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.darkText,
    borderRadius: 25,
    height: normalize(32),
    justifyContent: 'center',
    opacity: 0.64,
    position: 'absolute',
    right: normalize(16),
    top: normalize(16),
    width: normalize(32),
    zIndex: 1
  },

  containerRadius: {
    borderRadius: normalize(8)
  },

  overlayWidth: {
    borderRadius: normalize(8),
    height: 'auto',
    maxHeight: '90%',
    padding: 0,
    width: '95%'
  },

  overlayPosition: {
    position: 'absolute'
  },

  smallPaddingBottom: {
    paddingBottom: normalize(8)
  }
});
