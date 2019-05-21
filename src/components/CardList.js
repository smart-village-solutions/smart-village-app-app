import React, { Component } from 'react';
import { Card } from 'react-native-elements';
import { Image, Dimensions, StyleSheet, FlatList, Text, View } from 'react-native';

import { ListSubtitle, ListTitle } from './TextList';

export class CardList extends Component {
  keyExtractor = (item, index) => item + index;

  renderItem = ({ item }) => {
    return (
      <Card
        containerStyle={{
          shadowColor: 'transparent',
          padding: 0,
          borderWidth: 0,
          width: Dimensions.get('window').width * 0.7
        }}
      >
        <Image style={styles.image} source={{ uri: item.url }} />
        <ListSubtitle>{item.kategorie}</ListSubtitle>
        <ListTitle style={{ marginBottom: 10 }}>{item.name}</ListTitle>
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
  image: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 10
  }
});
