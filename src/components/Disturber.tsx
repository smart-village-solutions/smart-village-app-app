import { DrawerNavigationProp } from '@react-navigation/drawer';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Icon, colors, normalize } from '../config';
import { addToStore, findClosestItem, isActive, readFromStore } from '../helpers';
import { useHomeRefresh, useStaticContent } from '../hooks';

import { Button } from './Button';
import { ImagesCarousel } from './ImagesCarousel';
import { HeadlineText, RegularText } from './Text';
import { Wrapper, WrapperHorizontal } from './Wrapper';

type Props = {
  navigation: DrawerNavigationProp<any>;
  publicJsonFile: string;
};

interface DateRange {
  dateEnd: string;
  dateStart: string;
}

interface DataItem {
  aspectRatio?: { HEIGHT: number; WIDTH: number };
  autoplayInterval?: number;
  backgroundColor?: string;
  button: {
    navigationTo: string;
    params: { title?: string; webUrl: string };
    title?: string;
  };
  headline?: string;
  dates: DateRange[];
  description: string;
  id: number;
  pictures?: {
    navigationTo: string;
    params: { title?: string; webUrl: string };
    uri: string;
  }[];
  showButtonToClose?: boolean;
  title: string;
}

// eslint-disable-next-line complexity
export const Disturber = ({ navigation, publicJsonFile }: Props) => {
  const [isVisible, setIsVisible] = useState(false);

  const { data, refetch } = useStaticContent<DataItem[]>({
    refreshTimeKey: `publicJsonFile-${publicJsonFile}`,
    name: publicJsonFile,
    type: 'json'
  });

  useHomeRefresh(refetch);

  // find the closest item to the current date/time
  const closestItem: DataItem | null = findClosestItem(
    data?.filter((item) => item && isActive(item)) || []
  );

  const setDisturberComplete = () => {
    setIsVisible(false);
    !!closestItem && addToStore(publicJsonFile, closestItem.id.toString());
  };

  useEffect(() => {
    const disturberStatus = async () => {
      try {
        const disturberComplete = await readFromStore(publicJsonFile);

        if (closestItem?.id && closestItem.id.toString() !== disturberComplete) {
          setIsVisible(true);
        }
      } catch (e) {
        setIsVisible(false);

        console.error(e);
      }
    };

    disturberStatus();
  }, [closestItem]);

  if (!isVisible || !closestItem) return null;

  const {
    aspectRatio,
    autoplayInterval,
    backgroundColor,
    button,
    description,
    headline,
    pictures,
    showButtonToClose = true,
    title
  } = closestItem;

  const showButton = !!button && !!button.title && !!button.navigationTo && !!button.params;

  return (
    <Wrapper style={styles.wrapperPadding}>
      <View style={[styles.containerRadius, { backgroundColor }]}>
        {!!closestItem && (
          <>
            {showButtonToClose && (
              <TouchableOpacity onPress={setDisturberComplete} style={styles.closeButton}>
                <Icon.Close color={colors.lighterPrimary} size={normalize(16)} />
              </TouchableOpacity>
            )}

            {pictures?.length ? (
              <View style={styles.carouselContainer}>
                <ImagesCarousel
                  aspectRatio={aspectRatio || { HEIGHT: 0.7, WIDTH: 1 }}
                  autoplayInterval={autoplayInterval}
                  data={pictures}
                  isDisturber
                  navigation={navigation}
                  refreshTimeKey={`publicJsonFile-${publicJsonFile}`}
                />
              </View>
            ) : (
              <View style={styles.withoutImageMarginTop} />
            )}

            <Wrapper style={styles.smallPaddingBottom}>
              <WrapperHorizontal>
                {!!headline && (
                  <HeadlineText center uppercase style={styles.headlineText}>
                    {headline}
                  </HeadlineText>
                )}
              </WrapperHorizontal>
            </Wrapper>

            <Wrapper noPaddingTop>
              <WrapperHorizontal>
                {!!title && (
                  <HeadlineText center big>
                    {title}
                  </HeadlineText>
                )}
              </WrapperHorizontal>
            </Wrapper>

            <Wrapper noPaddingTop>
              <WrapperHorizontal>
                {!!description && (
                  <RegularText center big>
                    {description}
                  </RegularText>
                )}
              </WrapperHorizontal>
            </Wrapper>

            <Wrapper>
              <WrapperHorizontal>
                {showButton && (
                  <Button
                    big
                    title={button.title}
                    onPress={() => {
                      navigation.navigate(button.navigationTo, button.params);
                    }}
                  />
                )}
              </WrapperHorizontal>
            </Wrapper>
          </>
        )}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    borderTopLeftRadius: normalize(8),
    borderTopRightRadius: normalize(8),
    overflow: 'hidden'
  },
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
  headlineText: {
    fontSize: normalize(14),
    fontWeight: '700',
    lineHeight: normalize(16)
  },
  withoutImageMarginTop: {
    marginTop: normalize(21)
  },
  smallPaddingBottom: {
    paddingBottom: normalize(8)
  },
  wrapperPadding: {
    padding: normalize(24)
  }
});
