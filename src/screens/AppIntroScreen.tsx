import React from 'react';
import { ListRenderItem, ScrollView, StyleSheet, View } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

import { BoldText, Image, RegularText, SafeAreaViewFlex, Wrapper } from '../components';
import { colors, normalize } from '../config';
import { Initializer, Initializers } from '../helpers/initializationHelper';

/*
 * TODO:
 * extract texts
 * only show slides that are relevant through global settings
 * rework matomo initialization
 * rework push initialization
 * rework location service initialization
 * add a "you are done with onboarding"-slide
 */

type SlideInfo = {
  image: string;
  title: string;
  text: string;
  onLeaveSlide?: () => void;
};
const keyExtractor = (slide: SlideInfo) => slide.title + slide.text;

const slides: SlideInfo[] = [
  {
    image: 'https://www.smurf.com/characters-smurfs/smurfette.png',
    title: 'Willkommen!',
    text: 'Hier im Smart Village findest Du Nachrichten, Veranstaltungen und Services.'
  },
  {
    image: 'https://www.smurf.com/characters-smurfs/papa.png',
    title: 'Top informiert',
    text: 'Erlaube Push-Notification – Du wirst sofort benachrichtigt, wenn es Neuigkeiten gibt.',
    onLeaveSlide: Initializers.get(Initializer.PushNotifications)
  },
  {
    image: 'https://www.smurf.com/characters-smurfs/smurfette.png',
    title: 'Gewusst wo',
    text: 'Erlaube Ortungsdienste – bekomme Informationen genau für Deinen Umkreis.',
    onLeaveSlide: Initializers.get(Initializer.LocationService)
  },
  {
    image: 'https://www.smurf.com/characters-smurfs/papa.png',
    title: 'Sei dabei',
    text: 'Erlaube Tracking – über Deine Nutzerreise erfahren wir, wo die App besser werden kann.'
  }
];

const SliderButton = ({ label }: { label: string }) => {
  return (
    <View style={styles.underline}>
      <BoldText>{label.toUpperCase()}</BoldText>
    </View>
  );
};

type Props = {
  setOnboardingComplete: () => void;
};

export const AppIntroScreen = ({ setOnboardingComplete }: Props) => {
  const renderSlide: ListRenderItem<SlideInfo> = ({ item }) => {
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

  return (
    <SafeAreaViewFlex>
      <AppIntroSlider<SlideInfo>
        renderItem={renderSlide}
        data={slides}
        keyExtractor={keyExtractor}
        onSlideChange={(_, index) => {
          slides[index]?.onLeaveSlide?.();
        }}
        onDone={setOnboardingComplete}
        renderDoneButton={() => <SliderButton label="Weiter" />}
        renderNextButton={() => <SliderButton label="Weiter" />}
        dotStyle={styles.inactiveDot}
        activeDotStyle={styles.activeDot}
        scrollEnabled={false}
      />
    </SafeAreaViewFlex>
  );
};

const INACTIVE_DOT_SIZE = normalize(4);
const ACTIVE_DOT_SIZE = INACTIVE_DOT_SIZE * 2;

const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: colors.darkText,
    borderRadius: normalize(ACTIVE_DOT_SIZE / 2),
    height: ACTIVE_DOT_SIZE,
    width: ACTIVE_DOT_SIZE
  },
  imageContainer: {
    width: '100%'
  },
  inactiveDot: {
    backgroundColor: colors.darkText,
    borderRadius: normalize(INACTIVE_DOT_SIZE / 2),
    height: INACTIVE_DOT_SIZE,
    width: INACTIVE_DOT_SIZE
  },
  noPaddingBottom: {
    paddingBottom: 0
  },
  underline: {
    borderBottomColor: colors.darkText,
    borderBottomWidth: 1
  }
});
