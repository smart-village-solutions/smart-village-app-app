import React from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';

import { colors, texts } from '../config';

export default class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const itemId = navigation.getParam('itemId', 0);

    return {
      title: `Detail #${itemId}`,
      headerLeft: (
        <Button
          title={texts.button.back}
          onPress={() => navigation.goBack()}
          color={Platform.OS === 'ios' ? colors.lightestText : colors.primary}
        />
      ),
      headerRight: (
        <View style={{ flexDirection: 'row' }}>
          <Button
            title={texts.button.share}
            onPress={() => alert(texts.button.share)}
            color={Platform.OS === 'ios' ? colors.lightestText : colors.primary}
          />
          <Button
            title="="
            onPress={() => navigation.openDrawer()}
            color={Platform.OS === 'ios' ? colors.lightestText : colors.primary}
          />
        </View>
      )
    };
  };

  render() {
    const { navigation } = this.props;
    const title = navigation.getParam('title', 0);
    const subtitle = navigation.getParam('subtitle', 'otherParam fallback');
    const notAvailable = navigation.getParam('notAvailable', '');

    return (
      <View style={styles.container}>
        <Text>{subtitle}</Text>
        {!!subtitle && <Text>{title}</Text>}
        {!!notAvailable && <Text>{notAvailable}</Text>}
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
