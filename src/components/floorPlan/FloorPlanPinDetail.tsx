import { NavigationProp } from '@react-navigation/native';
import React, { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../Button';
import { Modal } from '../Modal';
import { BoldText, HeadlineText, RegularText } from '../Text';
import { WrapperVertical } from '../Wrapper';
import { colors, normalize, texts } from '../../config';

import { FloorPlanPin } from './types';
import { canNavigateToLinkedContent, navigateToLinkedContent } from './utils';

type Props = {
  navigation?: NavigationProp<Record<string, object | undefined>>;
  onClose: () => void;
  pin?: FloorPlanPin;
};

export const FloorPlanPinDetail = memo(({ navigation, onClose, pin }: Props) => {
  const handleOpenLinkedContent = useCallback(() => {
    if (!pin) return;

    if (navigateToLinkedContent({ navigation, pin })) {
      onClose();
    }
  }, [navigation, onClose, pin]);

  return (
    <Modal
      isBackdropPress
      isListView={false}
      isVisible={!!pin}
      onModalVisible={onClose}
      overlayStyle={styles.overlay}
      closeButton={<Button small smallest={false} invert onPress={onClose} title={texts.close} />}
    >
      {!!pin && (
        <View>
          <HeadlineText small primary style={styles.title}>
            {pin.title}
          </HeadlineText>

          <RegularText style={styles.description}>
            {pin.description || texts.floorPlan.fallbackDescription}
          </RegularText>

          {!!pin.routeName && (
            <WrapperVertical noPaddingTop>
              <BoldText smallest uppercase style={styles.metaTitle}>
                {texts.floorPlan.linkedContent}
              </BoldText>
              <RegularText small placeholder>
                {pin.routeName}
              </RegularText>
            </WrapperVertical>
          )}

          {canNavigateToLinkedContent(pin) && (
            <Button
              small
              smallest={false}
              onPress={handleOpenLinkedContent}
              title={pin.buttonTitle || texts.floorPlan.openLinkedContent}
            />
          )}
        </View>
      )}
    </Modal>
  );
});

FloorPlanPinDetail.displayName = 'FloorPlanPinDetail';

const styles = StyleSheet.create({
  description: {
    marginBottom: normalize(16)
  },
  metaTitle: {
    color: colors.placeholder,
    marginBottom: normalize(4)
  },
  overlay: {
    padding: normalize(24)
  },
  title: {
    marginBottom: normalize(12)
  }
});
