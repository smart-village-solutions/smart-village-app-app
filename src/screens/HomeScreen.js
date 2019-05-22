import React from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';

import { CardList, TextList, Title, TitleContainer, TitleShadow, TopVisual } from '../components';
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
        <TitleShadow />
        <TitleContainer>
          <Title>nachrichten</Title>
        </TitleContainer>
        <TitleShadow />
        <TextList navigation={navigation} data={items} />
        <TitleShadow />
        <TitleContainer>
          <Title>orte & routen</Title>
        </TitleContainer>
        <TitleShadow />
        <CardList data={cards} />
        <TitleShadow />
        <TitleContainer>
          <Title>veranstaltungen</Title>
        </TitleContainer>
        <TitleShadow />
        <TextList navigation={navigation} data={items} alternativeLayout={true} />
        <TitleShadow />
        <TitleContainer>
          <Title>service</Title>
        </TitleContainer>
        <TitleShadow />
        <TextList navigation={navigation} data={items} noSubtitle={true} />
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
