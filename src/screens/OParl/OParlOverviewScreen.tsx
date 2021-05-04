import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import {
  BoldText,
  DiagonalGradient,
  HeaderLeft,
  Logo,
  RegularText,
  SafeAreaViewFlex,
  Touchable,
  WrapperWithOrientation
} from '../../components';
import { texts } from '../../config';

type Props = {
  navigation: NavigationScreenProp<never>;
};

type TileProps = {
  logoUri: string;
  onPress?: () => void;
  subtitle?: string;
  title: string;
};

const overviewTexts = texts.oparl.overview;

const Tile = ({ logoUri, onPress, subtitle, title }: TileProps) => (
  <Touchable disabled={!onPress} onPress={onPress}>
    <DiagonalGradient style={styles.background}>
      <Logo
        source={{
          uri: logoUri
        }}
        style={styles.logo}
      />
      <BoldText lightest>{title}</BoldText>
      <RegularText lightest>{subtitle}</RegularText>
    </DiagonalGradient>
  </Touchable>
);

export const OParlOverviewScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <WrapperWithOrientation>
          <Tile
            logoUri="https://server.bad-belzig.smart-village.app/mobile-app/assets/home-service/Maerker.png"
            title={overviewTexts.search}
            onPress={() => navigation.navigate('OParlSearch', { title: 'Suche' })}
          />
          <Tile
            logoUri="https://server.bad-belzig.smart-village.app/mobile-app/assets/home-service/Maerker.png"
            title={overviewTexts.calendarTitle}
            subtitle={overviewTexts.calendarSubTitle}
            onPress={() => navigation.navigate('OParlCalendar', { title: 'Termine' })}
          />
          <Tile
            logoUri="https://server.bad-belzig.smart-village.app/mobile-app/assets/home-service/Maerker.png"
            title={overviewTexts.peopleTitle}
            subtitle={overviewTexts.peopleSubTitle}
            onPress={() => navigation.navigate('OParlCategory', { title: 'Beteiligte' })}
          />
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

OParlOverviewScreen.navigationOptions = ({ navigation }: Props) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />,
    title: 'Test'
  };
};

const styles = StyleSheet.create({
  background: {
    borderRadius: 8,
    margin: 12,
    marginBottom: 0,
    height: 160,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    height: 60,
    width: 60,
    marginVertical: 12
  }
});
