import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import {
  BoldText,
  HeaderLeft,
  Logo,
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

const Tile = ({ logoUri, onPress, title }: TileProps) => (
  <Touchable style={styles.background} disabled={!onPress} onPress={onPress}>
    <Logo
      source={{
        uri: logoUri
      }}
      style={styles.logo}
    />
    <BoldText primary>{title}</BoldText>
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
            onPress={() => navigation.navigate('OParlSearch', { title: overviewTexts.search })}
          />
          <Tile
            logoUri="https://server.bad-belzig.smart-village.app/mobile-app/assets/home-service/Maerker.png"
            title={overviewTexts.calendar}
            onPress={() => navigation.navigate('OParlCalendar', { title: overviewTexts.calendar })}
          />
          <Tile
            logoUri="https://server.bad-belzig.smart-village.app/mobile-app/assets/home-service/Maerker.png"
            title={overviewTexts.persons}
            onPress={() => navigation.navigate('OParlPersons', { title: overviewTexts.persons })}
          />
          <Tile
            logoUri="https://server.bad-belzig.smart-village.app/mobile-app/assets/home-service/Maerker.png"
            title={overviewTexts.organizations}
            onPress={() =>
              navigation.navigate('OParlOrganizations', { title: overviewTexts.organizations })
            }
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
