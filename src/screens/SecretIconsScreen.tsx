import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { RegularText } from '../components';
import { colors, Icon, normalize } from '../config';

type TIconItem = {
  iconName: string;
};

const iconNames = Object.keys(Icon);

const IconItem = ({ iconName }: TIconItem) => {
  const SelectedIcon = Icon[iconName];
  return (
    <View style={styles.iconField}>
      <Text>
        <SelectedIcon size={normalize(35)} color={colors.secondary} />
      </Text>
      <RegularText smallest>{iconName}</RegularText>
    </View>
  );
};

export const SecretIconsScreen = () => {
  return (
    <FlatList
      data={iconNames}
      renderItem={({ item }) => <IconItem iconName={item} />}
      keyExtractor={(item) => item}
      numColumns={3}
    />
  );
};

const styles = StyleSheet.create({
  iconField: {
    margin: 10,
    flex: 1,
    alignItems: 'center'
  }
});
