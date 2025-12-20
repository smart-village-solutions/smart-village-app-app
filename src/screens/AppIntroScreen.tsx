import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
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
import { colors, device, Icon, normalize, texts } from '../config';
import { addToStore, Initializer } from '../helpers';
import { useStaticContent } from '../hooks';
import { parseIntroSlides } from '../jsonValidation';
import { HAS_TERMS_AND_CONDITIONS_STORE_KEY } from '../OnboardingManager';
import { QUERY_TYPES } from '../queries';
import { AppIntroSlide } from '../types';

import { HtmlScreen } from './HtmlScreen';

const keyExtractor = (slide: AppIntroSlide, index: number) => `index${index}-text${slide.text}`;

type SliderButtonProps = {
  label: string;
  onPress: () => void;
  style: StyleProp<ViewStyle>;
  isDisabled?: boolean;
  isLightest?: boolean;
};

type ButtonProps = {
  hasAcceptedTerms: boolean;
  setOnboardingComplete?: () => void;
  sliderRef: React.RefObject<any>;
  slides: AppIntroSlide[];
  styles: {
    skipButton: StyleProp<ViewStyle>;
    sliderButtonContainer: StyleProp<ViewStyle>;
    sliderButtonDisabled: StyleProp<ViewStyle>;
  };
  termsAndConditionsAlert: () => void;
  termsSlideIndex?: number;
  texts: { appIntro: { continue: string; skip: string } };
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
    <TouchableOpacity onPress={onPress} style={buttonStyle}>
      <BoldText lightest={isLightest}>{label.toUpperCase()}</BoldText>
    </TouchableOpacity>
  );
};

const NextButton = ({
  hasAcceptedTerms,
  sliderRef,
  slides,
  styles,
  termsAndConditionsAlert,
  texts
}: ButtonProps) => {
  const currentSlideIndex = sliderRef.current?.state?.activeIndex ?? 0;
  const currentSlide = slides[currentSlideIndex];
  const isTermsSlide =
    slides[currentSlideIndex]?.onLeaveSlideName === Initializer.TermsAndConditions;

  const handlePress = () => {
    if (isTermsSlide && !hasAcceptedTerms) {
      termsAndConditionsAlert();
      return;
    }

    if (currentSlide.onLeaveSlide) {
      currentSlide.onLeaveSlide(true);
    }

    sliderRef.current?.goToSlide(currentSlideIndex + 1, true);
  };

  return (
    <SliderButton
      label={texts.appIntro.continue}
      onPress={handlePress}
      style={styles.sliderButtonContainer}
      isDisabled={isTermsSlide && !hasAcceptedTerms}
      isLightest={!(isTermsSlide && !hasAcceptedTerms)}
    />
  );
};

const SkipButton = ({
  hasAcceptedTerms,
  setOnboardingComplete,
  sliderRef,
  styles,
  termsAndConditionsAlert,
  termsSlideIndex,
  texts
}: ButtonProps) => {
  const handlePress = () => {
    if (termsSlideIndex !== -1 && !hasAcceptedTerms && sliderRef.current) {
      sliderRef.current?.goToSlide(termsSlideIndex, true);
      termsAndConditionsAlert();
      return;
    }

    setOnboardingComplete();
  };

  return (
    <SliderButton
      label={texts.appIntro.skip}
      onPress={handlePress}
      style={[styles.sliderButtonContainer, styles.skipButton]}
    />
  );
};

const DoneButton = ({
  hasAcceptedTerms,
  setOnboardingComplete,
  sliderRef,
  slides,
  styles,
  termsAndConditionsAlert,
  texts
}: ButtonProps) => {
  const handlePress = () => {
    const currentSlideIndex = sliderRef.current?.state?.activeIndex ?? 0;
    const isTermsSlide =
      slides[currentSlideIndex]?.onLeaveSlideName === Initializer.TermsAndConditions;

    if (isTermsSlide && !hasAcceptedTerms) {
      termsAndConditionsAlert();
      return;
    }

    setOnboardingComplete();
  };

  return (
    <SliderButton
      label={texts.appIntro.continue}
      onPress={handlePress}
      style={styles.sliderButtonContainer}
      isLightest
    />
  );
};

export default NextButton;

const TermsAndConditionsSection = ({
  backgroundColor,
  contentName,
  setShowButtonTermsAndConditions
}: {
  backgroundColor?: string;
  contentName?: string;
  setShowButtonTermsAndConditions: (value: boolean) => void;
}) => {
  const [hasAcceptedDataPrivacy, setHasAcceptedDataPrivacy] = useState(false);
  const [isModalVisibleDataPrivacy, setModalVisibleDataPrivacy] = useState(false);

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
            setHasAcceptedDataPrivacy(!hasAcceptedDataPrivacy);
            setShowButtonTermsAndConditions(!hasAcceptedDataPrivacy);
          }}
          title={texts.profile.privacyChecked}
          uncheckedIcon={<Icon.Square color={colors.placeholder} />}
        />
      </Wrapper>

      <Modal
        animationType="slide"
        onRequestClose={() => setModalVisibleDataPrivacy(false)}
        presentationStyle="pageSheet"
        visible={isModalVisibleDataPrivacy}
      >
        <SafeAreaView style={styles.flex}>
          <View style={styles.spacer}>
            <TouchableOpacity
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
  item,
  setShowButtonTermsAndConditions
}: {
  backgroundColor?: string;
  item: AppIntroSlide;
  setShowButtonTermsAndConditions: (value: boolean) => void;
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
          setShowButtonTermsAndConditions={setShowButtonTermsAndConditions}
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
  const [showDoneButtonTermsAndConditions, setShowDoneButtonTermsAndConditions] = useState(true);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
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
      item,
      setShowButtonTermsAndConditions: (value) => {
        setShowDoneButtonTermsAndConditions(value);
        setHasAcceptedTerms(value);
      }
    });

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

  return (
    <SafeAreaViewFlex style={[styles.background, { backgroundColor }]}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <AppIntroSlider<AppIntroSlide>
        activeDotStyle={onlyTermsAndConditions ? styles.hiddenDot : styles.activeDot}
        bottomButton
        data={slides}
        dotClickEnabled={false}
        dotStyle={onlyTermsAndConditions ? styles.hiddenDot : styles.inactiveDot}
        keyExtractor={keyExtractor}
        renderDoneButton={() => (
          <DoneButton
            hasAcceptedTerms={hasAcceptedTerms}
            setOnboardingComplete={setOnboardingComplete}
            sliderRef={sliderRef}
            slides={slides}
            styles={styles}
            termsAndConditionsAlert={termsAndConditionsAlert}
            texts={texts}
          />
        )}
        renderItem={renderItem}
        ref={sliderRef}
        renderNextButton={() => (
          <NextButton
            hasAcceptedTerms={hasAcceptedTerms}
            sliderRef={sliderRef}
            slides={slides}
            styles={styles}
            termsAndConditionsAlert={termsAndConditionsAlert}
            texts={texts}
          />
        )}
        renderSkipButton={() => (
          <SkipButton
            hasAcceptedTerms={hasAcceptedTerms}
            setOnboardingComplete={setOnboardingComplete}
            sliderRef={sliderRef}
            styles={styles}
            termsAndConditionsAlert={termsAndConditionsAlert}
            termsSlideIndex={termsSlideIndex}
            texts={texts}
          />
        )}
        scrollEnabled={false}
        showDoneButton={showDoneButtonTermsAndConditions}
        showSkipButton
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
