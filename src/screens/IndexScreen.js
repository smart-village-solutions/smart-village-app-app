import React from 'react';
import { Button, Platform, ScrollView, View } from 'react-native';

import { TextList } from '../components';
import { colors, texts } from '../config';

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
  },
  {
    itemId: 4,
    title: 'Wert von 200 Milliarden Dollar in Kraft.',
    subtitle: '22.04.88|Rathaus Bad Belsig'
  },
  {
    itemId: 5,
    title:
      'Handelsprotektionismus“, so die Behörden in Peking weiter. China hoffe, dass die Vereinigten Staaten im Sinne gegenseitigen Respekts zur bilateralen wirtschaftlichen Zusammenarbeit zurückkehrten.',
    subtitle: '22.04.88|Polizei Brandeburg'
  },
  {
    itemId: 6,
    title: ' bei 25 Prozent',
    subtitle: '22.04.88|Coconat'
  }
];

export default class IndexScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Index',
      headerLeft: (
        <Button
          title={texts.button.home}
          onPress={() => navigation.navigate('Home')}
          color={Platform.OS === 'ios' ? colors.lightestText : colors.primary}
        />
      )
    };
  };

  render() {
    const { navigation } = this.props;

    return (
      <ScrollView>
        <TextList navigation={navigation} data={items} />
      </ScrollView>
    );
  }
}
