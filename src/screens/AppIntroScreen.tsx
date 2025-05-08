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
import { getStatusBarHeight } from 'react-native-status-bar-height';

import {
  BoldText,
  Checkbox,
  Image,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperVertical
} from '../components';
import { colors, device, Icon, normalize, texts } from '../config';
import { Initializer } from '../helpers';
import { useStaticContent } from '../hooks';
import { parseIntroSlides } from '../jsonValidation';
import { QUERY_TYPES } from '../queries';
import { AppIntroSlide } from '../types';

import { HtmlScreen } from './HtmlScreen';

const keyExtractor = (slide: AppIntroSlide, index: number) => `index${index}-text${slide.text}`;

const SliderButton = ({
  isLightestText = false,
  isPlaceholder = false,
  label,
  style
}: {
  isLightestText?: boolean;
  isPlaceholder?: boolean;
  label: string;
  style?: any;
}) => {
  return (
    <View style={[styles.sliderButtonContainer, style]}>
      <BoldText lightest={isLightestText} placeholder={isPlaceholder}>
        {label.toUpperCase()}
      </BoldText>
    </View>
  );
};

type NextButtonProps = {
  sliderRef: React.RefObject<any>;
  slides: AppIntroSlide[];
  hasAcceptedTerms: boolean;
  termsAndConditionsAlert: () => void;
  styles: {
    sliderButtonContainer: StyleProp<ViewStyle>;
    sliderButtonDisabled: StyleProp<ViewStyle>;
  };
  texts: {
    appIntro: {
      continue: string;
    };
  };
};

const NextButton = ({
  sliderRef,
  slides,
  hasAcceptedTerms,
  termsAndConditionsAlert,
  styles,
  texts
}: NextButtonProps) => {
  const currentSlideIndex = sliderRef.current?.state?.activeIndex ?? 0;
  const isTermsSlide =
    slides[currentSlideIndex]?.onLeaveSlideName === Initializer.TermsAndConditions;

  const buttonStyle =
    isTermsSlide && !hasAcceptedTerms
      ? [styles.sliderButtonContainer, styles.sliderButtonDisabled]
      : styles.sliderButtonContainer;

  const handlePress = () => {
    if (isTermsSlide && !hasAcceptedTerms) {
      termsAndConditionsAlert();
      return;
    }
    sliderRef.current?.goToSlide(currentSlideIndex + 1, true);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={buttonStyle}>
        <BoldText lightest={!(isTermsSlide && !hasAcceptedTerms)}>
          {texts.appIntro.continue.toUpperCase()}
        </BoldText>
      </View>
    </TouchableOpacity>
  );
};

export default NextButton;

const TermsAndConditionsSection = ({
  backgroundColor,
  contentName,
  setShowButtonTermsAndConditions
}: {
  backgroundColor?: string;
  contentName: string;
  setShowButtonTermsAndConditions: (value: boolean) => void;
}) => {
  const [hasAcceptedDataPrivacy, setHasAcceptedDataPrivacy] = useState(false);
  const [isModalVisibleDataPrivacy, setModalVisibleDataPrivacy] = useState(false);

  return (
    <View style={{ position: 'absolute', bottom: normalize(180), width: '100%' }}>
      <Wrapper>
        <Checkbox
          containerStyle={[styles.leftAligned, { backgroundColor }]}
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
    <BoldText big style={styles.leftAligned}>
      {item.title.toUpperCase()}
    </BoldText>
  );

  const TextComponent = () => (
    <WrapperVertical>
      <RegularText style={styles.leftAligned}>{item.text}</RegularText>
    </WrapperVertical>
  );

  const getPropertyOrder = (obj: AppIntroSlide) => {
    const propertyMap = {
      image: ImageComponent,
      title: TitleComponent,
      text: TextComponent
    };

    return Object.keys(obj)
      .filter((key) => key in propertyMap)
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
  const slider = useRef<AppIntroSlider>(null);

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

  const handleSkip = () => {
    // Only check for terms acceptance if there is a terms slide
    if (termsSlideIndex !== -1 && !hasAcceptedTerms && slider.current) {
      slider.current.goToSlide(termsSlideIndex, true);
      termsAndConditionsAlert();

      return;
    }

    setOnboardingComplete();
  };

  const handleSlideChange = (_, index) => {
    // Only check for terms acceptance if there is a terms slide
    if (termsSlideIndex !== -1 && index > termsSlideIndex && !hasAcceptedTerms) {
      slider.current?.goToSlide(termsSlideIndex, true);
      termsAndConditionsAlert();

      return;
    }

    slides?.[index]?.onLeaveSlide?.(true);
  };

  useEffect(() => {
    if (error || (!loading && !slides?.length)) {
      setOnboardingComplete();
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
        onDone={setOnboardingComplete}
        onSlideChange={handleSlideChange}
        renderDoneButton={() => <SliderButton label={texts.appIntro.continue} isLightestText />}
        renderItem={renderItem}
        onSkip={handleSkip}
        ref={slider}
        renderNextButton={() => (
          <NextButton
            sliderRef={slider}
            slides={slides}
            hasAcceptedTerms={hasAcceptedTerms}
            termsAndConditionsAlert={termsAndConditionsAlert}
            styles={styles}
            texts={texts}
          />
        )}
        renderSkipButton={() => (
          <SliderButton label={texts.appIntro.skip} style={styles.skipButton} />
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
    borderWidth: normalize(1),
    bottom: normalize(72)
  },
  sliderButtonContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: normalize(8),
    bottom: normalize(128),
    height: normalize(32),
    justifyContent: 'center',
    position: 'absolute',
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
