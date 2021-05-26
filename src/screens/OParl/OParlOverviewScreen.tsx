import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import {
  BoldText,
  HeaderLeft,
  Icon,
  SafeAreaViewFlex,
  Touchable,
  Wrapper,
  WrapperWithOrientation
} from '../../components';
import { colors, texts } from '../../config';
import { oParlCalendar, oParlOrganizations, oParlPeople } from '../../icons';

type Props = {
  navigation: NavigationScreenProp<never>;
};

type TileProps = {
  icon: JSX.Element;
  onPress?: () => void;
  subtitle?: string;
  title: string;
};

const overviewTexts = texts.oparl.overview;

const Tile = ({ icon, onPress, title }: TileProps) => (
  <Touchable style={styles.background} disabled={!onPress} onPress={onPress}>
    <Wrapper>{icon}</Wrapper>
    <BoldText primary>{title}</BoldText>
  </Touchable>
);

export const OParlOverviewScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <WrapperWithOrientation>
          <Tile
            icon={<Icon xml={oParlCalendar(colors.primary)} />}
            title={overviewTexts.calendar}
            onPress={() => navigation.navigate('OParlCalendar', { title: overviewTexts.calendar })}
          />
          <Tile
            icon={<Icon xml={oParlPeople(colors.primary)} />}
            title={overviewTexts.persons}
            onPress={() => navigation.navigate('OParlPersons', { title: overviewTexts.persons })}
          />
          <Tile
            icon={<Icon xml={oParlOrganizations(colors.primary)} />}
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
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
