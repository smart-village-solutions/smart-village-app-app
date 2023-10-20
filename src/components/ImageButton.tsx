import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet } from 'react-native';

import { Icon, colors, texts } from '../config';

import { Button } from './Button';
import { Wrapper } from './Wrapper';

type TImageButton = {
  icon?: React.ReactElement;
  params?: any;
  routeName: string;
  title?: string;
};

export const ImageButton = ({ button }: { button: TImageButton }) => {
  const { icon, params, routeName, title = texts.sue.homeCarousel.button } = button;
  const navigation = useNavigation();

  if (!params || !routeName) {
    return null;
  }

  return (
    <Wrapper style={styles.noPadding}>
      <Button
        icon={icon || <Icon.Plus color={colors.lightestText} />}
        title={title}
        onPress={() => navigation.navigate(routeName, params)}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  noPadding: {
    paddingBottom: 0,
    paddingTop: 0
  }
});
