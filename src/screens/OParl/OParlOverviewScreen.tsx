import ApolloClient from 'apollo-client';
import React from 'react';
import { ScrollView } from 'react-native';
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

type Props = {
  navigation: NavigationScreenProp<never>;
};

type TileProps = {
  logoUri: string;
  onPress?: () => void;
  subtitle?: string;
  title: string;
};

const Tile = ({ logoUri, onPress, subtitle, title }: TileProps) => (
  <Touchable disabled={!onPress} onPress={onPress}>
    <DiagonalGradient
      style={{
        borderRadius: 8,
        margin: 12,
        marginBottom: 0,
        height: 160,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Logo
        source={{
          uri: logoUri
        }}
        style={{
          height: 60,
          width: 60,
          marginVertical: 12
        }}
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
            title="Schlagwort Suche"
          />
          <Tile
            logoUri="https://server.bad-belzig.smart-village.app/mobile-app/assets/home-service/Maerker.png"
            title="Termine"
            subtitle="Sitzungen, Agendas, etc."
            onPress={() => navigation.navigate('OParlCalendar', { title: 'Termine' })}
          />
          <Tile
            logoUri="https://server.bad-belzig.smart-village.app/mobile-app/assets/home-service/Maerker.png"
            title="Beteiligte"
            subtitle="Personen, Mitglieder, Organisationen"
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
