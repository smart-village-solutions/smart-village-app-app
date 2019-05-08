import React from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';

export default class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const itemId = navigation.getParam('itemId', 0);

    return {
      title: `Detail #${itemId}`,
      headerRight: (
        <Button
          title="Share"
          onPress={() => alert('Share')}
          color={Platform.OS === 'ios' ? '#fff' : '#08743c'}
        />
      )
    };
  };

  render() {
    const { navigation } = this.props;
    const itemId = navigation.getParam('itemId', 0);
    const otherParam = navigation.getParam('otherParam', 'otherParam fallback');
    const notAvailable = navigation.getParam('notAvailable', '');

    return (
      <View style={styles.container}>
        <Text>Detail Screen #{itemId}</Text>
        {!!otherParam && <Text>{otherParam}</Text>}
        {!!notAvailable && <Text>{notAvailable}</Text>}
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
