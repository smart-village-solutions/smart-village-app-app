import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { colors } from '../config';

export default class HomeScreen extends React.Component {
  render() {
    const { navigation } = this.props;

    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <Button
          title="Go to news"
          onPress={() => navigation.navigate('News')}
          color={colors.primary}
        />
        <Button
          title="Go to events"
          onPress={() => navigation.navigate('Events')}
          color={colors.primary}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
