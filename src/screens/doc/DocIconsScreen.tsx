import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { RegularText } from '../../components';
import { colors, Icon, normalize } from '../../config';

type TIconItem = {
  iconName: keyof typeof Icon;
};

const IconItem = ({ iconName }: TIconItem) => {
  const SelectedIcon = Icon[iconName];

  return (
    <View style={styles.iconContainer}>
      <SelectedIcon size={normalize(35)} color={colors.secondary} />
      <RegularText smallest>{iconName}</RegularText>
    </View>
  );
};

export const DocIconsScreen = () => {
  return (
    <FlatList
      data={Object.keys(Icon).filter((name) => name !== "NamedIcon")}
      renderItem={({ item }) => <IconItem iconName={item as keyof typeof Icon} />}
      keyExtractor={(keyExtractor) => keyExtractor}
      numColumns={3}
    />
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    flex: 1,
    margin: normalize(10)
  }
});
