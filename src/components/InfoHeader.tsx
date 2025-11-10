import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Overlay } from 'react-native-elements';

import { Icon, IconUrl, colors, consts, normalize } from './../config';
import { useStaticContent } from './../hooks';
import { HeadlineText, RegularText } from './Text';
import { Wrapper, WrapperHorizontal } from './Wrapper';

export const LOGIN_MODAL = 'loginModal';

const { a11yLabel } = consts;

interface DataItem {
  backgroundColor?: string;
  description: string;
  iconName?: string;
  title: string;
}

type Props = {
  route: any;
  style: ViewStyle;
};

/* eslint-disable complexity */
export const InfoHeader = ({ route, style }: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const title = route.params?.title || route.params?.screenTitle || '';

  const [modalData, setModalData] = useState<DataItem | null>(null);

  const { data: contentData, loading: contentLoading } = useStaticContent<DataItem[]>({
    refreshTimeKey: 'publicJsonFile-infoModal',
    name: 'infoModal',
    type: 'json'
  });

  useEffect(() => {
    if (contentData?.length) {
      for (let i = 0; i < contentData.length; i++) {
        const item: DataItem = contentData[i];

        if (item[title]) {
          setModalData(item[title]);
        }
      }
    }
  }, [contentData]);

  if (contentLoading || !modalData) {
    return null;
  }
  const {
    backgroundColor = colors.lighterPrimary,
    description,
    iconName = 'info-circle'
  } = modalData;

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsVisible(!isVisible)}
        accessibilityLabel={a11yLabel.informationIcon}
        accessibilityHint={a11yLabel.informationHint}
      >
        <IconUrl iconName={iconName} color={colors.darkText} style={style} />
      </TouchableOpacity>

      <Overlay
        animationType="fade"
        isVisible={isVisible}
        onBackdropPress={() => setIsVisible(false)}
        overlayStyle={[styles.overlayWidth, { backgroundColor }]}
        statusBarTranslucent
        supportedOrientations={['portrait', 'landscape']}
      >
        <ScrollView style={[styles.containerRadius, { backgroundColor }]}>
          <>
            <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.closeButton}>
              <Icon.Close color={colors.lighterPrimary} size={normalize(16)} />
            </TouchableOpacity>

            {!!title && (
              <Wrapper style={styles.smallPaddingBottom}>
                <WrapperHorizontal>
                  <HeadlineText center big>
                    {title}
                  </HeadlineText>
                </WrapperHorizontal>
              </Wrapper>
            )}

            {!!description && (
              <Wrapper noPaddingTop>
                <WrapperHorizontal>
                  <RegularText big>{description}</RegularText>
                </WrapperHorizontal>
              </Wrapper>
            )}
          </>
        </ScrollView>
      </Overlay>
    </>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
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
  headlineText: {
    fontSize: normalize(14),
    fontWeight: '700',
    lineHeight: normalize(16)
  },
  smallPaddingBottom: {
    paddingBottom: normalize(8)
  }
});
