import React from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';

import { CardList, Title, TitleContainer, TextList, TopVisual } from '../components';
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
const cards = [
  {
    name: 'Burg Eisenhardt Bad Belzig',
    kategorie: 'Museum',
    url: 'https://api.tmb.pixelpoint.biz/api/asset/91380/thumbnail/593/365.jpg'
  },
  {
    name: 'Heimatstube Wiesenburg',
    kategorie: 'Museum',
    url: 'https://api.tmb.pixelpoint.biz/api/asset/80032/thumbnail/593/365.jpg'
  },

  {
    name: 'Roger Loewig Haus czvgubhzuzgizbi  hjvuhbuz',
    kategorie: 'Wellness',
    url: 'https://api.tmb.pixelpoint.biz/api/asset/88671/thumbnail/593/365.jpg'
  }
];

export default class HomeScreen extends React.Component {
  render() {
    const { navigation } = this.props;

    return (
      <ScrollView>
        <TopVisual />
        <TitleContainer>
          <Title>nachrichten</Title>
        </TitleContainer>
        <TextList navigation={navigation} data={items} />
        <Title>orte & routen</Title>
        <CardList data={cards} />
        <Title>veranstaltungen</Title>
        <TextList navigation={navigation} data={items} second={true} />
        <Title>service</Title>
        <TextList navigation={navigation} data={items} listService={true} />
      </ScrollView>
    );
  }
}

// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     justifyContent: 'center'
//   }
// });
