import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ListRenderItem, ScrollView, StyleSheet, View } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { BoldText, Image, RegularText, SafeAreaViewFlex, Wrapper } from '../components';
import { colors, device, normalize, texts } from '../config';
import { useStaticContent } from '../hooks';
import { parseIntroSlides } from '../jsonValidation';
import { AppIntroSlide } from '../types';

const keyExtractor = (slide: AppIntroSlide) => slide.title + slide.text;

const SliderButton = ({ label }: { label: string }) => {
  return (
    <View style={styles.sliderButton}>
      <BoldText>{label.toUpperCase()}</BoldText>
    </View>
  );
};

type Props = {
  setOnboardingComplete: () => void;
};

const renderSlide: ListRenderItem<AppIntroSlide> = ({ item }) => {
  return (
    <ScrollView>
      <Image
        source={{ uri: item.image }}
        containerStyle={styles.imageContainer}
        resizeMode="contain"
      />
      <Wrapper style={styles.noPaddingBottom}>
        <BoldText big center>
          {item.title.toUpperCase()}
        </BoldText>
      </Wrapper>
      <Wrapper>
        <RegularText center>{item.text}</RegularText>
      </Wrapper>
    </ScrollView>
  );
};

export const AppIntroScreen = ({ setOnboardingComplete }: Props) => {
  const {
    data: slides,
    error,
    loading
  } = useStaticContent({
    name: 'appIntroSlides',
    type: 'json',
    parseFromJson: parseIntroSlides,
    fetchPolicy: 'network-only'
  });

  useEffect(() => {
    if (error || (!loading && !slides?.length)) {
      setOnboardingComplete();
    }
  }, [error, loading, slides?.length]);

  if (error || loading || !slides?.length) {
    return null;
  }

  return (
    <SafeAreaViewFlex style={styles.background}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <AppIntroSlider<AppIntroSlide>
        activeDotStyle={styles.activeDot}
        data={slides}
        dotClickEnabled={false}
        dotStyle={styles.inactiveDot}
        keyExtractor={keyExtractor}
        onDone={setOnboardingComplete}
        onSlideChange={(_, index) => {
          slides[index]?.onLeaveSlide?.(true);
        }}
        renderDoneButton={() => <SliderButton label={texts.appIntro.continue} />}
        renderItem={renderSlide}
        renderNextButton={() => <SliderButton label={texts.appIntro.continue} />}
        scrollEnabled={false}
        style={device.platform === 'android' && { paddingTop: getStatusBarHeight() }}
      />
    </SafeAreaViewFlex>
  );
};

const INACTIVE_DOT_SIZE = normalize(4);
const ACTIVE_DOT_SIZE = INACTIVE_DOT_SIZE * 2;

const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: colors.darkText,
    borderRadius: normalize(ACTIVE_DOT_SIZE) / 2,
    height: ACTIVE_DOT_SIZE,
    width: ACTIVE_DOT_SIZE
  },
  background: {
    backgroundColor: colors.surface
  },
  imageContainer: {
    width: '100%'
  },
  inactiveDot: {
    backgroundColor: colors.darkText,
    borderRadius: normalize(INACTIVE_DOT_SIZE) / 2,
    height: INACTIVE_DOT_SIZE,
    width: INACTIVE_DOT_SIZE
  },
  noPaddingBottom: {
    paddingBottom: 0
  },
  sliderButton: {
    borderBottomColor: colors.darkText,
    borderBottomWidth: 1,
    marginVertical: 12 // no normalization here as the dots position does not use normalization either
  }
});
