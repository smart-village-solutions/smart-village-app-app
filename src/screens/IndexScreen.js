import React from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';

// data coming later from API
const items = [
  {
    itemId: 1,
    otherParam: '1thing you want here'
  },
  {
    itemId: 2,
    otherParam: '2thing you want here'
  },
  {
    itemId: 3,
    otherParam: '3thing you want here'
  },
  {
    itemId: 4,
    otherParam: '4thing you want here'
  },
  {
    itemId: 5,
    otherParam: '5thing you want here'
  },
  {
    itemId: 6,
    otherParam: '6thing you want here'
  }
];

export default class IndexScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const itemId = navigation.getParam('itemId', 0);

    return {
      title: `Detail #${itemId}`,
      headerLeft: (
        <Button
          title="Home"
          onPress={() => navigation.navigate('Home')}
          color={Platform.OS === 'ios' ? '#fff' : '#08743c'}
        />
      )
    };
  };

  render() {
    const { navigation } = this.props;

    return (
      <View style={styles.container}>
        <Text>Index Screen</Text>
        {items.map((item) => (
          <Button
            key={`bla${item.itemId}`}
            title={`Got to Detail #${item.itemId}`}
            // on press navigate to Detail route (DetailScreen) with the following params,
            // that we use in that screen
            onPress={() => navigation.navigate('Detail', item)}
            color="#08743c"
          />
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
