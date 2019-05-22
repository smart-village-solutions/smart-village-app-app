import React, { Component } from 'react';
import { Card } from 'react-native-elements';
import { ActivityIndicator, Platform, StyleSheet, FlatList } from 'react-native';
import { Image } from 'react-native-elements';

import { device } from '../config';
import { ListSubtitle, ListTitle } from './TextList';

export class CardList extends Component {
  keyExtractor = (item, index) => item + index;

  renderItem = ({ item }) => {
    return (
      <Card
        containerStyle={[
          Platform.select({
            android: {
              elevation: 0
            },
            ios: {
              shadowColor: 'transparent'
            }
          }),
          styles.container
        ]}
      >
        <Image
          style={styles.image}
          source={{ uri: item.url }}
          PlaceholderContent={<ActivityIndicator />}
        />
        <ListSubtitle>{item.kategorie}</ListSubtitle>
        <ListTitle style={styles.listTitle}>{item.name}</ListTitle>
      </Card>
    );
  };

  render() {
    const { data } = this.props;

    return (
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal={true}
        keyExtractor={this.keyExtractor}
        data={data}
        renderItem={this.renderItem}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 0,
    padding: 0,
    width: device.width * 0.7
  },
  image: {
    borderRadius: 5,
    height: 200,
    marginBottom: 10
  },
  listTitle: {
    marginBottom: 10
  }
});
