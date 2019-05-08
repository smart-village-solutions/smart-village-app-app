import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default class HomeScreen extends React.Component {
  render() {
    const { navigation } = this.props;

    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <Button title="Go to news" onPress={() => navigation.navigate('News')} color="#08743c" />
        <Button
          title="Go to events"
          onPress={() => navigation.navigate('Events')}
          color="#08743c"
        />
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
