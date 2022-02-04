import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, Icon, normalize, texts } from '../config';
import { imageHeight, imageWidth } from '../helpers';

import { BoldText, RegularText } from './Text';

type Props = {
  navigation: StackNavigationProp<any>;
  title: string;
};

export const NewsSectionPlaceholder = ({ navigation, title }: Props) => {
  return (
    <View>
      <View style={styles.paddingContainer}>
        <Icon.EmptySection
          color={colors.primary}
          size={imageHeight(imageWidth()) / 2}
          style={styles.icon}
        />
      </View>
      <RegularText primary center>
        {texts.placeholder.homeSectionTitle(title)}
      </RegularText>
      <RegularText primary center small>
        {texts.placeholder.homeSectionSubtitle}
      </RegularText>
      <TouchableOpacity onPress={() => navigation.push('Settings')} style={styles.paddingContainer}>
        <BoldText center primary underline>
          {texts.placeholder.homeSectionButton.toUpperCase()}
        </BoldText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    opacity: 0.4 // TODO: use lighterPrimary instead, once it is defined by using opacity
  },
  paddingContainer: {
    alignItems: 'center',
    paddingVertical: normalize(40)
  }
});
