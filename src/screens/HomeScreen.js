import React from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';

import { Gradient, TextList, TopVisual } from '../components';
import { colors } from '../config';

// TODO: data coming later from API
const items = [
  {
    itemId: 1,
    title: 'China kündigt Vergeltungsmaßnahmen an',
    subtitle: '22.04.88|Polizei Brandeburg'
  },
  {
    itemId: 2,
    title: 'Die Führung in Peking reagiert auf Donald Trumps jüngste Maßnahmen. Zum 1. ',
    subtitle: '22.04.88|Coconat'
  },
  {
    itemId: 3,
    title: 'In der Nacht zum Freitag setzten die Amerikaner ',
    subtitle: '22.04.88|Terranova'
  }
];

export default class HomeScreen extends React.Component {
  render() {
    const { navigation } = this.props;

    return (
      <View>
        <ScrollView>
          <TopVisual />
          <Gradient />
          <Button
            title="Go to news"
            onPress={() => navigation.navigate('News')}
            color={colors.primary}
          />
          <TextList navigation={navigation} data={items} />
          <Button
            title="Go to events"
            onPress={() => navigation.navigate('Events')}
            color={colors.primary}
          />
          <TextList navigation={navigation} data={items} />
        </ScrollView>
      </View>
    );
  }
}

// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     justifyContent: 'center'
//   }
// });
