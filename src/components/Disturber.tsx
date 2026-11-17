import { DrawerNavigationProp } from 'expo-router/drawer';
import React, { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Icon, normalize, texts } from '../config';
import {
  addToStore,
  findClosestItem,
  isActive,
  readFromStore,
  resolveThemeOverrides
} from '../helpers';
import { useHomeRefresh, useStaticContent } from '../hooks';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../hooks/useTheme';

import { Button } from './Button';
import { ImagesCarousel } from './ImagesCarousel';
import { HeadlineText, RegularText } from './Text';
import { Wrapper, WrapperHorizontal } from './Wrapper';

type Props = {
  navigation: DrawerNavigationProp<Record<string, object | undefined>>;
  publicJsonFile: string;
};

interface DateRange {
  dateEnd: string;
  dateStart: string;
}

interface DisturberPicture {
  aspectRatio?: { HEIGHT: number; WIDTH: number };
  dark?: Partial<DisturberPicture>;
  params?: { title?: string; [key: string]: unknown };
  routeName?: string;
  uri: string;
}

interface DataItem {
  dark?: Partial<DataItem>;
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
    dark?: { picture?: Partial<DisturberPicture> };
    picture: DisturberPicture;
  }[];
  showButtonToClose?: boolean;
  title: string;
}

// eslint-disable-next-line complexity
export const Disturber = ({ navigation, publicJsonFile }: Props) => {
  const { colors, mode } = useTheme();

  const styles = useThemeStyles(createStyles);
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

  const themedItem = useMemo(() => resolveThemeOverrides(closestItem, mode), [closestItem, mode]);

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

  if (!isVisible || !themedItem) return null;

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
  } = themedItem;

  const showButton = !!button && !!button.title && !!button.navigationTo && !!button.params;
  const showContent = !!headline || !!title || !!description || showButton;
  const textOnlyCloseButtonPadding =
    !pictures?.length && showButtonToClose && !headline
      ? styles.contentBelowCloseButton
      : undefined;

  return (
    <Wrapper>
      <View style={[styles.containerRadius, { backgroundColor }]}>
        {!!closestItem && (
          <>
            {showButtonToClose && (
              <TouchableOpacity
                accessibilityLabel={texts.accessibilityLabels.actions.close}
                onPress={setDisturberComplete}
                style={styles.closeButton}
              >
                <Icon.Close color={colors.text} size={normalize(16)} />
              </TouchableOpacity>
            )}

            {!!pictures?.length && (
              <View
                style={[
                  styles.carouselContainer,
                  !showContent && styles.carouselContainerWithoutContent
                ]}
              >
                <ImagesCarousel
                  aspectRatio={aspectRatio || { HEIGHT: 0.7, WIDTH: 1 }}
                  autoplayInterval={autoplayInterval}
                  data={pictures}
                  isDisturber
                  navigation={navigation}
                  refreshTimeKey={`publicJsonFile-${publicJsonFile}`}
                />
              </View>
            )}

            {!!headline && (
              <Wrapper>
                <WrapperHorizontal>
                  <HeadlineText center uppercase style={styles.headlineText}>
                    {headline}
                  </HeadlineText>
                </WrapperHorizontal>
              </Wrapper>
            )}

            {!!title && (
              <Wrapper noPaddingTop={!!headline} style={textOnlyCloseButtonPadding}>
                <WrapperHorizontal>
                  <HeadlineText center big>
                    {title}
                  </HeadlineText>
                </WrapperHorizontal>
              </Wrapper>
            )}

            {!!description && (
              <Wrapper
                noPaddingTop={!!headline || !!title}
                style={!title ? textOnlyCloseButtonPadding : undefined}
              >
                <WrapperHorizontal>
                  <RegularText center big>
                    {description}
                  </RegularText>
                </WrapperHorizontal>
              </Wrapper>
            )}

            {showButton && (
              <Wrapper
                noPaddingTop={!!headline || !!title || !!description}
                style={!title && !description ? textOnlyCloseButtonPadding : undefined}
              >
                <WrapperHorizontal>
                  <Button
                    big
                    title={button.title}
                    onPress={() => {
                      navigation.navigate(button.navigationTo, button.params);
                    }}
                  />
                </WrapperHorizontal>
              </Wrapper>
            )}
          </>
        )}
      </View>
    </Wrapper>
  );
};

const createStyles = (colors) => ({
  carouselContainer: {
    borderTopLeftRadius: normalize(8),
    borderTopRightRadius: normalize(8),
    overflow: 'hidden'
  },
  carouselContainerWithoutContent: {
    borderBottomLeftRadius: normalize(8),
    borderBottomRightRadius: normalize(8)
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 25,
    height: normalize(32),
    justifyContent: 'center',
    position: 'absolute',
    right: normalize(16),
    top: normalize(16),
    width: normalize(32),
    zIndex: 1
  },

  containerRadius: {
    borderRadius: normalize(8)
  },

  contentBelowCloseButton: {
    // Keep the first text below the close control when there is no image or headline.
    paddingTop: normalize(16) + normalize(32)
  },

  headlineText: {
    fontSize: normalize(14),
    fontWeight: '700',
    lineHeight: normalize(16)
  }
});
