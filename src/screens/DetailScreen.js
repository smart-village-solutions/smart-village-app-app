import React from 'react';
import { Button, Platform, StyleSheet, ScrollView, Text, View } from 'react-native';

import { Divider, TextContent, Link, ListSubtitle, TextList, Logo, TopVisual } from '../components';
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
    const notAvailable = navigation.getParam('notAvailable', '');
    const subtitle = navigation.getParam('subtitle', 'otherParam fallback');

    return (
      <ScrollView>
        {!!notAvailable && <Text>{notAvailable}</Text>}
        <View style={styles.container}>
          <TopVisual />
          <Logo navigation={navigation} />
          {!!subtitle && <ListSubtitle>{subtitle}</ListSubtitle>}
          <TextContent />
          <Link />
        </View>
      </ScrollView>
    );
  }
}

//
const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
