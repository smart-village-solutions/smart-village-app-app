import { NavigationProp } from '@react-navigation/native';
import React, { memo, useCallback, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TextListItem } from '../TextListItem';
import { OrientationContext } from '../../OrientationProvider';
import { SettingsContext } from '../../SettingsProvider';
import { colors, device, Icon, normalize, texts } from '../../config';

import { FloorPlanPin } from './types';
import { canNavigateToLinkedContent, navigateToLinkedContent } from './utils';

type Props = {
  navigation?: NavigationProp<Record<string, object | undefined>>;
  pin?: FloorPlanPin;
};

export const FloorPlanPinPreview = memo(({ navigation, pin }: Props) => {
  const { orientation } = useContext(OrientationContext);
  const safeAreaInsets = useSafeAreaInsets();
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;

  const handlePress = useCallback(() => {
    if (!pin) return;

    navigateToLinkedContent({ navigation, pin });
  }, [navigation, pin]);

  if (!pin) return null;

  const canNavigate = canNavigateToLinkedContent(pin);
  const leftIcon = (
    <View style={[styles.iconContainer, styles.imageStyle]}>
      <Icon.PinFilled color={colors.darkerPrimary} />
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        stylesWithProps({
          deviceHeight: device.height,
          navigationType,
          orientation,
          safeAreaInsets
        }).position
      ]}
    >
      <TextListItem
        containerStyle={styles.textListItemContainer}
        item={{
          id: pin.id,
          bottomDivider: false,
          isHeadlineTitle: false,
          onPress: canNavigate ? handlePress : () => undefined,
          overtitle: texts.floorPlan.typeLabels[pin.type || 'info'],
          params: pin.params || {},
          routeName: pin.routeName || '',
          subtitle: pin.description || texts.floorPlan.fallbackDescription,
          title: pin.title,
          leftIcon
        }}
        imageContainerStyle={styles.imageRadius}
        imageStyle={styles.imageStyle}
        listItemStyle={styles.listItem}
        listsWithoutArrows
        navigation={navigation as never}
      />
    </View>
  );
});

FloorPlanPinPreview.displayName = 'FloorPlanPinPreview';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: normalize(8),
    left: '4%',
    position: 'absolute',
    right: '4%',
    width: '92%',
    elevation: 2,
    shadowColor: colors.shadowRgba,
    shadowOffset: {
      height: 5,
      width: 0
    },
    shadowOpacity: 0.5,
    shadowRadius: 3
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: colors.lighterPrimary,
    borderBottomLeftRadius: normalize(8),
    borderTopLeftRadius: normalize(8),
    justifyContent: 'center'
  },
  imageRadius: {
    borderBottomLeftRadius: normalize(12),
    borderTopLeftRadius: normalize(12)
  },
  imageStyle: {
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
    height: normalize(96),
    width: normalize(96)
  },
  listItem: {
    marginVertical: normalize(16)
  },
  textListItemContainer: {
    alignItems: 'flex-start',
    padding: 0,
    paddingVertical: 0
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this mirrors the map preview placement from LocationOverview */
const stylesWithProps = ({
  navigationType,
  orientation,
  safeAreaInsets,
  deviceHeight
}: {
  navigationType: string;
  orientation: string;
  safeAreaInsets: { left: number; right: number };
  deviceHeight: number;
}) =>
  StyleSheet.create({
    position: {
      bottom: navigationType === 'drawer' ? '8%' : '4%',
      left: orientation === 'landscape' ? safeAreaInsets.left + deviceHeight * 0.04 : '4%',
      right: orientation === 'landscape' ? safeAreaInsets.right + deviceHeight * 0.04 : '4%'
    }
  });
/* eslint-enable react-native/no-unused-styles */
