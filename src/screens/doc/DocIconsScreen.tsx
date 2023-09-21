import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { RegularText } from '../../components';
import { Icon, normalize } from '../../config';

type TIconItem = {
  iconName: keyof typeof Icon;
};

const IconItem = ({ iconName }: TIconItem) => {
  const SelectedIcon = Icon[iconName];

  return (
    <View style={styles.iconContainer}>
      {/* @ts-expect-error could not find a solution for this type issue :/ */}
      <SelectedIcon />
      <RegularText smallest>{iconName}</RegularText>
    </View>
  );
};

export const DocIconsScreen = () => {
  return (
    <FlatList
      data={Object.keys(Icon).filter((name) => name !== 'NamedIcon')}
      renderItem={({ item }) => <IconItem iconName={item as keyof typeof Icon} />}
      keyExtractor={(item, index) => `index${index}-name${item}`}
      numColumns={3}
    />
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    flex: 1,
    margin: normalize(9)
  }
});
