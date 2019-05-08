import React from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';

export default class StaticScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Static',
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
        <Text>Static Screen</Text>
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
