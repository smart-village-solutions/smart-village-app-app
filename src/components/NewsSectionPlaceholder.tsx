import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { View } from 'react-native';

import { texts } from '../config';

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
