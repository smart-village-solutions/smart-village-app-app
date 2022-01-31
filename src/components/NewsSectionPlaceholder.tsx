import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, Icon, texts } from '../config';
import { imageHeight, imageWidth } from '../helpers';

import { Button } from './Button';
import { BoldText, RegularText } from './Text';
import { Wrapper } from './Wrapper';

type Props = {
  navigation: StackNavigationProp<any>;
};

export const NewsSectionPlaceholder = ({ navigation }: Props) => {
  return (
    <View>
      <Wrapper>
        <Icon.EmptySection
          color={colors.primary}
          size={imageHeight(imageWidth())}
          style={styles.icon}
        />
        <Wrapper>
          <BoldText primary center>
            {texts.placeholder.homeSectionTitle}
          </BoldText>
          <RegularText primary center small>
            {texts.placeholder.homeSectionSubtitle}
          </RegularText>
        </Wrapper>
        <Button
          title={texts.placeholder.homeSectionButton}
          onPress={() => navigation.push('Settings')}
        />
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center',
    opacity: 0.4 // TODO: use lighterPrimary instead, once it is defined by using opacity
  }
});
