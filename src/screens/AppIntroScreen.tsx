import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  ListRenderItem,
  Modal,
  ScrollView,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { BoldText, Checkbox, Image, RegularText, SafeAreaViewFlex, Wrapper } from '../components';
import { colors, consts, device, Icon, normalize, texts } from '../config';
import { addToStore, Initializer, readFromStore } from '../helpers';
import { useStaticContent } from '../hooks';
import { parseIntroSlides } from '../jsonValidation';
import {
  HAS_TERMS_AND_CONDITIONS_STORE_KEY,
  TERMS_AND_CONDITIONS_STORE_KEY
} from '../OnboardingManager';
import { QUERY_TYPES } from '../queries';
import { AppIntroSlide } from '../types';
import { AccessibilityContext } from '../AccessibilityProvider';

import { HtmlScreen } from './HtmlScreen';

const keyExtractor = (slide: AppIntroSlide, index: number) => `index${index}-text${slide.text}`;

type SliderButtonProps = {
  label: string;
  onPress: () => void;
  style: StyleProp<ViewStyle>;
  isDisabled?: boolean;
  isLightest?: boolean;
};

const SliderButton = ({
  label,
  onPress,
  style,
  isDisabled = false,
  isLightest = false
}: SliderButtonProps) => {
  const buttonStyle = isDisabled ? [style, styles.sliderButtonDisabled] : style;

  return (
    <TouchableOpacity
      accessibilityLabel={`${label} ${consts.a11yLabel.button}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={isDisabled ? undefined : onPress}
      style={buttonStyle}
    >
      <BoldText lightest={isLightest}>{label.toUpperCase()}</BoldText>
    </TouchableOpacity>
  );
};

const goToIntroSlide = (
  sliderRef: React.RefObject<any>,
  pageNum: number,
  triggerOnSlideChange = true,
  reduceMotion = false
) => {
  const slider = sliderRef.current;
  if (!slider) return;

  if (!reduceMotion) {
    slider.goToSlide(pageNum, triggerOnSlideChange);
    return;
  }

  const prevNum = slider.state?.activeIndex ?? 0;
  slider.setState({ activeIndex: pageNum });

  const width = slider.state?.width ?? 0;
  const rtlSafeIndex = slider._rtlSafeIndex ? slider._rtlSafeIndex(pageNum) : pageNum;

  slider.getListRef?.()?.scrollToOffset?.({
    animated: false,
    offset: rtlSafeIndex * width
  });

  if (triggerOnSlideChange && slider.props?.onSlideChange) {
    slider.props.onSlideChange(pageNum, prevNum);
  }
};

const TermsAndConditionsSection = ({
  backgroundColor,
  contentName,
  hasAcceptedTerms,
  onTermsAcceptanceChange,
  reduceMotion
}: {
  backgroundColor?: string;
  contentName?: string;
  hasAcceptedTerms: boolean;
  onTermsAcceptanceChange: (value: boolean) => void;
  reduceMotion: boolean;
}) => {
  const [hasAcceptedDataPrivacy, setHasAcceptedDataPrivacy] = useState(hasAcceptedTerms);
  const [isModalVisibleDataPrivacy, setModalVisibleDataPrivacy] = useState(false);

  useEffect(() => {
    setHasAcceptedDataPrivacy(hasAcceptedTerms);
  }, [hasAcceptedTerms]);

  return (
    <View style={{ position: 'absolute', bottom: normalize(180), width: '100%' }}>
      <Wrapper>
        <Checkbox
          containerStyle={{ backgroundColor }}
          boldTitle={false}
          center={false}
          checked={hasAcceptedDataPrivacy}
          checkedIcon={<Icon.SquareCheckFilled />}
          navigate={() => setModalVisibleDataPrivacy(true)}
          linkDescription={texts.profile.privacyCheckLink}
          onPress={() => {
            const nextValue = !hasAcceptedDataPrivacy;
            setHasAcceptedDataPrivacy(nextValue);
            onTermsAcceptanceChange(nextValue);
          }}
          title={texts.profile.privacyChecked}
          uncheckedIcon={<Icon.Square color={colors.placeholder} />}
        />
      </Wrapper>

      <Modal
        animationType={reduceMotion ? 'none' : 'slide'}
        onRequestClose={() => setModalVisibleDataPrivacy(false)}
        presentationStyle="pageSheet"
        visible={isModalVisibleDataPrivacy}
      >
        <SafeAreaView style={styles.flex}>
          <View style={styles.spacer}>
            <TouchableOpacity
              accessibilityLabel={consts.a11yLabel.closeIcon}
              accessibilityRole="button"
              onPress={() => setModalVisibleDataPrivacy(false)}
              style={styles.termsAndConditionsCloseButton}
            >
              <Icon.Close />
            </TouchableOpacity>
          </View>
          <HtmlScreen
            navigation={undefined}
            route={{
              params: {
                title: texts.profile.privacyCheckLink,
                query: QUERY_TYPES.PUBLIC_HTML_FILE,
                queryVariables: { name: contentName }
              }
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const termsAndConditionsAlert = () =>
  Alert.alert(
    texts.profile.termsAndConditionsAlertTitle,
    texts.profile.termsAndConditionsAlertMessage,
    [{ text: texts.profile.termsAndConditionsAlertOk }]
  );

type Props = {
  backgroundColor?: string;
  onlyTermsAndConditions?: boolean;
  setOnboardingComplete: () => void;
};

const renderSlide: ListRenderItem<AppIntroSlide> = ({
  backgroundColor,
  hasAcceptedTerms,
  item,
  onTermsAcceptanceChange,
  reduceMotion
}: {
  backgroundColor?: string;
  hasAcceptedTerms: boolean;
  item: AppIntroSlide;
  onTermsAcceptanceChange: (value: boolean) => void;
  reduceMotion: boolean;
}) => {
  const ImageComponent = () => (
    <Image
      source={{ uri: item.image }}
      containerStyle={styles.imageContainer}
      resizeMode="contain"
    />
  );

  const TitleComponent = () => (
    <Wrapper noPaddingBottom>
      <BoldText big style={styles.leftAligned}>
        {item.title.toUpperCase()}
      </BoldText>
    </Wrapper>
  );

  const TextComponent = () => (
    <Wrapper>
      <RegularText style={styles.leftAligned}>{item.text}</RegularText>
    </Wrapper>
  );

  const getPropertyOrder = (obj: AppIntroSlide) => {
    const propertyMap = {
      image: ImageComponent,
      title: TitleComponent,
      text: TextComponent
    };

    return Object.keys(obj)
      .filter((key) => !!obj[key] && key in propertyMap)
      .map((key) => ({ key, Component: propertyMap[key] }));
  };

  const orderOfProperties = getPropertyOrder(item);

  return (
    <ScrollView contentContainerStyle={styles.slideContainer}>
      {orderOfProperties.map(({ key, Component }) => (
        <Component key={key} />
      ))}

      {item.onLeaveSlideName === Initializer.TermsAndConditions && (
        <TermsAndConditionsSection
          backgroundColor={backgroundColor}
          contentName={item.contentName}
          hasAcceptedTerms={hasAcceptedTerms}
          onTermsAcceptanceChange={onTermsAcceptanceChange}
          reduceMotion={reduceMotion}
        />
      )}
    </ScrollView>
  );
};

export const AppIntroScreen = ({
  setOnboardingComplete,
  onlyTermsAndConditions,
  backgroundColor = colors.surface
}: Props) => {
  const { isReduceMotionEnabled } = useContext(AccessibilityContext);
  const [showDoneButtonTermsAndConditions, setShowDoneButtonTermsAndConditions] = useState(true);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const sliderRef = useRef<AppIntroSlider>(null);

  const { data, error, loading } = useStaticContent({
    name: 'appIntroSlides',
    type: 'json',
    parseFromJson: parseIntroSlides,
    fetchPolicy: 'network-only'
  });

  let slides = data;

  if (onlyTermsAndConditions) {
    slides =
      slides?.filter((slide) => slide.onLeaveSlideName === Initializer.TermsAndConditions) || [];
  }

  const termsSlideIndex = slides?.findIndex(
    (slide) => slide.onLeaveSlideName === Initializer.TermsAndConditions
  );

  const renderItem = ({ item }) =>
    renderSlide({
      backgroundColor,
      hasAcceptedTerms,
      item,
      onTermsAcceptanceChange: (value) => {
        setShowDoneButtonTermsAndConditions(value);
        setHasAcceptedTerms(value);
      },
      reduceMotion: isReduceMotionEnabled
    });

  useEffect(() => {
    const hydrateTermsStatus = async () => {
      const termsAndConditionsAccepted = await readFromStore(TERMS_AND_CONDITIONS_STORE_KEY);
      const accepted = termsAndConditionsAccepted === 'accepted';

      setHasAcceptedTerms(accepted);
      setShowDoneButtonTermsAndConditions(accepted);
    };

    hydrateTermsStatus();
  }, []);

  useEffect(() => {
    if (error || (!loading && !slides?.length)) {
      setOnboardingComplete();
    }

    // if there is a slide for terms and conditions, we need to store this information to know about
    // it in the settings screen
    if (slides?.find((slide) => slide.onLeaveSlideName === Initializer.TermsAndConditions)) {
      addToStore(HAS_TERMS_AND_CONDITIONS_STORE_KEY, true);
    }

    onlyTermsAndConditions && setShowDoneButtonTermsAndConditions(false);
  }, [error, loading, slides?.length]);

  if (error || loading || !slides?.length) {
    return null;
  }

  const isTermsSlide =
    slides?.[activeSlideIndex]?.onLeaveSlideName === Initializer.TermsAndConditions;
  const isPrimaryActionDisabled = isTermsSlide && !hasAcceptedTerms;
  const isLastSlide = activeSlideIndex === slides.length - 1;

  const handleNext = () => {
    if (isPrimaryActionDisabled) {
      termsAndConditionsAlert();
      return;
    }

    const currentSlide = slides[activeSlideIndex];

    if (currentSlide?.onLeaveSlide) {
      currentSlide.onLeaveSlide(true);
    }

    goToIntroSlide(sliderRef, activeSlideIndex + 1, true, isReduceMotionEnabled);
  };

  const handleSkip = () => {
    if (termsSlideIndex !== -1 && !hasAcceptedTerms && sliderRef.current) {
      goToIntroSlide(sliderRef, termsSlideIndex, true, isReduceMotionEnabled);
      termsAndConditionsAlert();
      return;
    }

    setOnboardingComplete();
  };

  const handleDone = () => {
    if (isPrimaryActionDisabled) {
      termsAndConditionsAlert();
      return;
    }

    setOnboardingComplete();
  };

  return (
    <SafeAreaViewFlex style={[styles.background, { backgroundColor }]} edges={['top', 'bottom']}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <AppIntroSlider<AppIntroSlide>
        activeDotStyle={onlyTermsAndConditions ? styles.hiddenDot : styles.activeDot}
        bottomButton
        data={slides}
        dotClickEnabled={false}
        dotStyle={onlyTermsAndConditions ? styles.hiddenDot : styles.inactiveDot}
        keyExtractor={keyExtractor}
        onSlideChange={(index) => setActiveSlideIndex(index)}
        renderDoneButton={() => (
          <SliderButton
            label={texts.appIntro.continue}
            onPress={handleDone}
            style={[
              styles.sliderButtonContainer,
              isPrimaryActionDisabled && styles.sliderButtonDisabled
            ]}
            isDisabled={isPrimaryActionDisabled}
            isLightest={!isPrimaryActionDisabled}
          />
        )}
        renderItem={renderItem}
        ref={sliderRef}
        renderNextButton={() => (
          <SliderButton
            label={texts.appIntro.continue}
            onPress={handleNext}
            style={[
              styles.sliderButtonContainer,
              isPrimaryActionDisabled && styles.sliderButtonDisabled
            ]}
            isDisabled={isPrimaryActionDisabled}
            isLightest={!isPrimaryActionDisabled}
          />
        )}
        renderSkipButton={() => (
          <SliderButton
            label={texts.appIntro.skip}
            onPress={handleSkip}
            style={[styles.sliderButtonContainer, styles.skipButton]}
          />
        )}
        scrollEnabled={false}
        showDoneButton={showDoneButtonTermsAndConditions && isLastSlide}
        showNextButton={!isLastSlide}
        showSkipButton={!isLastSlide}
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
    width: ACTIVE_DOT_SIZE * 2
  },
  background: {
    backgroundColor: colors.surface
  },
  leftAligned: {
    paddingHorizontal: normalize(40),
    textAlign: 'left'
  },
  flex: {
    flex: 1
  },
  hiddenDot: {
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
  skipButton: {
    backgroundColor: colors.transparent,
    borderColor: colors.borderRgba,
    borderWidth: normalize(1)
  },
  sliderButtonContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: normalize(8),
    height: normalize(32),
    justifyContent: 'center',
    marginBottom: normalize(16),
    width: normalize(144)
  },
  sliderButtonDisabled: {
    backgroundColor: colors.borderRgba
  },
  slideContainer: {
    flexGrow: 1,
    marginTop: normalize(40)
  },
  spacer: {
    height: normalize(40)
  },
  termsAndConditionsCloseButton: {
    justifyContent: 'center',
    height: normalize(40),
    position: 'absolute',
    right: 0,
    width: normalize(40)
  }
});
