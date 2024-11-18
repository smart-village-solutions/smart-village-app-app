import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ListRenderItem,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { BoldText, Checkbox, Image, RegularText, SafeAreaViewFlex, Wrapper } from '../components';
import { colors, device, Icon, normalize, texts } from '../config';
import { Initializer } from '../helpers';
import { useStaticContent } from '../hooks';
import { parseIntroSlides } from '../jsonValidation';
import { QUERY_TYPES } from '../queries';
import { AppIntroSlide } from '../types';

import { HtmlScreen } from './HtmlScreen';

const keyExtractor = (slide: AppIntroSlide, index: number) => `index${index}-text${slide.text}`;

const SliderButton = ({
  label,
  style,
  isPlaceholder = false
}: {
  label: string;
  style?: any;
  isPlaceholder?: boolean;
}) => {
  return (
    <View style={[styles.sliderButtonContainer]}>
      <View style={[styles.sliderButton, style]}>
        <BoldText placeholder={isPlaceholder}>{label.toUpperCase()}</BoldText>
      </View>
    </View>
  );
};

const TermsAndConditionsSection = ({ setShowButtonTermsAndConditions }) => {
  const [hasAcceptedDataPrivacy, setHasAcceptedDataPrivacy] = useState(false);
  const [hasAcceptedTermsOfUse, setHasAcceptedTermsOfUse] = useState(false);
  const [isModalVisibleDataPrivacy, setModalVisibleDataPrivacy] = useState(false);
  const [isModalVisibleTermsOfUse, setModalVisibleTermsOfUse] = useState(false);

  return (
    <>
      <Wrapper style={styles.noPaddingTop}>
        <Checkbox
          boldTitle={false}
          center={false}
          checked={hasAcceptedDataPrivacy}
          checkedIcon={<Icon.SquareCheckFilled />}
          navigate={() => setModalVisibleDataPrivacy(true)}
          linkDescription={texts.profile.privacyCheckLink}
          onPress={() => {
            setHasAcceptedDataPrivacy(!hasAcceptedDataPrivacy);
            setShowButtonTermsAndConditions(!hasAcceptedDataPrivacy && hasAcceptedTermsOfUse);
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
          {device.platform === 'android' && (
            <TouchableOpacity
              onPress={() => setModalVisibleDataPrivacy(false)}
              style={styles.termsAndConditionsCloseButton}
            >
              <Icon.Close />
            </TouchableOpacity>
          )}
        </View>
        <HtmlScreen
          navigation={undefined}
          route={{
            params: {
              title: texts.profile.privacyCheckLink,
              query: QUERY_TYPES.PUBLIC_HTML_FILE,
              queryVariables: { name: 'datenschutzProfile' }
            }
          }}
        />
      </Modal>

      <Wrapper style={styles.noPaddingTop}>
        <Checkbox
          boldTitle={false}
          center={false}
          checked={hasAcceptedTermsOfUse}
          checkedIcon={<Icon.SquareCheckFilled />}
          navigate={() => setModalVisibleTermsOfUse(true)}
          linkDescription={texts.profile.termsOfUseLink}
          onPress={() => {
            setHasAcceptedTermsOfUse(!hasAcceptedTermsOfUse);
            setShowButtonTermsAndConditions(hasAcceptedDataPrivacy && !hasAcceptedTermsOfUse);
          }}
          title={texts.profile.termsOfUseChecked}
          uncheckedIcon={<Icon.Square color={colors.placeholder} />}
        />
      </Wrapper>

      <Modal
        animationType="slide"
        onRequestClose={() => setModalVisibleTermsOfUse(false)}
        presentationStyle="pageSheet"
        visible={isModalVisibleTermsOfUse}
      >
        <View style={styles.spacer}>
          {device.platform === 'android' && (
            <TouchableOpacity
              onPress={() => setModalVisibleTermsOfUse(false)}
              style={styles.termsAndConditionsCloseButton}
            >
              <Icon.Close />
            </TouchableOpacity>
          )}
        </View>
        <HtmlScreen
          navigation={undefined}
          route={{
            params: {
              title: texts.profile.termsOfUseLink,
              query: QUERY_TYPES.PUBLIC_HTML_FILE,
              queryVariables: { name: 'nutzungsbedingungenProfile' }
            }
          }}
        />
      </Modal>
    </>
  );
};

type Props = {
  setOnboardingComplete: () => void;
  onlyTermsAndConditions?: boolean;
};

const renderSlide: ListRenderItem<AppIntroSlide> = ({ item, setShowButtonTermsAndConditions }) => {
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

      {item.onLeaveSlideName === Initializer.TermsAndConditions && (
        <TermsAndConditionsSection
          setShowButtonTermsAndConditions={setShowButtonTermsAndConditions}
        />
      )}
    </ScrollView>
  );
};

export const AppIntroScreen = ({ setOnboardingComplete, onlyTermsAndConditions }: Props) => {
  const [showNextButtonTermsAndConditions, setShowNextButtonTermsAndConditions] = useState(true);
  const [showDoneButtonTermsAndConditions, setShowDoneButtonTermsAndConditions] = useState(true);
  const { bottom: safeAreaBottom } = useSafeAreaInsets();

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
    <SafeAreaViewFlex style={styles.background}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <AppIntroSlider<AppIntroSlide>
        activeDotStyle={onlyTermsAndConditions ? styles.hiddenDot : styles.activeDot}
        data={slides}
        dotClickEnabled={false}
        dotStyle={onlyTermsAndConditions ? styles.hiddenDot : styles.inactiveDot}
        keyExtractor={keyExtractor}
        onDone={setOnboardingComplete}
        onSlideChange={(_, index) => {
          // hide the next button on the terms and conditions slide
          if (
            index + 1 ==
            slides.findIndex((slide) => slide.onLeaveSlideName === Initializer.TermsAndConditions)
          ) {
            setShowNextButtonTermsAndConditions(false);
          }

          slides[index]?.onLeaveSlide?.(true);
        }}
        renderDoneButton={() => <SliderButton label={texts.appIntro.continue} />}
        renderItem={({ item }) =>
          renderSlide({
            item,
            setShowButtonTermsAndConditions: (value) => {
              setShowNextButtonTermsAndConditions(value);
              setShowDoneButtonTermsAndConditions(value);
            }
          })
        }
        renderNextButton={() => <SliderButton label={texts.appIntro.continue} />}
        scrollEnabled={false}
        showDoneButton={showDoneButtonTermsAndConditions}
        showNextButton={showNextButtonTermsAndConditions}
        style={device.platform === 'android' && { paddingTop: getStatusBarHeight() }}
      />
      {(!showNextButtonTermsAndConditions || !showDoneButtonTermsAndConditions) && (
        <View
          style={[styles.termsAndConditionsNextButtonContainer, { bottom: safeAreaBottom + 16 }]}
        >
          <View style={styles.termsAndConditionsNextButton}>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  texts.profile.termsAndConditionsAlertTitle,
                  texts.profile.termsAndConditionsAlertMessage,
                  [
                    {
                      text: texts.profile.termsAndConditionsAlertOk
                    }
                  ]
                )
              }
            >
              <SliderButton
                isPlaceholder
                label={texts.appIntro.continue}
                style={{
                  borderBottomColor: colors.placeholder
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  noPaddingBottom: {
    paddingBottom: 0
  },
  noPaddingTop: {
    paddingTop: 0
  },
  sliderButtonContainer: {
    justifyContent: 'center',
    height: 48
  },
  sliderButton: {
    borderBottomColor: colors.darkText,
    borderBottomWidth: 1,
    marginVertical: 12 // no normalization here as the dots position does not use normalization either
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
  },
  termsAndConditionsNextButton: {
    bottom: 0,
    height: 48,
    position: 'absolute',
    right: 0
  },
  termsAndConditionsNextButtonContainer: {
    position: 'absolute',
    right: 16
  }
});
