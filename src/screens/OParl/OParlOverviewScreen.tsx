import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BoldText, SafeAreaViewFlex, Touchable, Wrapper } from '../../components';
import { Icon, texts } from '../../config';

type Props = {
  navigation: StackNavigationProp<Record<string, { title: string }>>;
};

type TileProps = {
  icon: JSX.Element;
  onPress?: () => void;
  subtitle?: string;
  title: string;
};

const overviewTexts = texts.oparl.overview;

const Tile = ({ icon, onPress, title }: TileProps) => (
  <Touchable disabled={!onPress} onPress={onPress}>
    <View style={styles.background}>
      <Wrapper>{icon}</Wrapper>
      <BoldText primary>{title}</BoldText>
    </View>
  </Touchable>
);

export const OParlOverviewScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <Tile
          icon={<Icon.OParlCalendar />}
          title={overviewTexts.calendar}
          onPress={() => navigation.navigate('OParlCalendar', { title: overviewTexts.calendar })}
        />
        <Tile
          icon={<Icon.OParlPeople />}
          title={overviewTexts.persons}
          onPress={() => navigation.navigate('OParlPersons', { title: overviewTexts.persons })}
        />
        <Tile
          icon={<Icon.OParlOrganizations />}
          title={overviewTexts.organizations}
          onPress={() =>
            navigation.navigate('OParlOrganizations', { title: overviewTexts.organizations })
          }
        />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  background: {
    borderRadius: 8,
    margin: 12,
    marginBottom: 0,
    minHeight: 140,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
