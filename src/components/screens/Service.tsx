import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, normalize, texts } from '../../config';
import { SettingsContext } from '../../SettingsProvider';
import { ScreenName } from '../../types';
import { DiagonalGradient } from '../DiagonalGradient';
import { RegularText } from '../Text';
import { WrapperWrap } from '../Wrapper';

import { DraggableGrid } from './DraggableGrid';
import { ServiceTile } from './ServiceTile';

const { MATOMO_TRACKING } = consts;

export const Service = ({
  data,
  isEditMode,
  staticJsonName,
  hasDiagonalGradientBackground
}: {
  data: any;
  isEditMode: boolean;
  staticJsonName: string;
  hasDiagonalGradientBackground?: boolean;
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const navigation = useNavigation<StackNavigationProp<any>>();
  const onPress = () =>
    isEditMode
      ? navigation.goBack()
      : navigation.push(ScreenName.TilesScreen, {
          matomoString: MATOMO_TRACKING.SCREEN_VIEW.SERVICE,
          staticJsonName,
          titleFallback: texts.homeTitles.service,
          isEditMode: true,
          hasDiagonalGradientBackground
        });
  const renderItem = (item: any, index: number) => (
    <ServiceTile
      key={index + (item.title || item.accessibilityLabel)}
      item={item}
      isEditMode={isEditMode}
      id={index}
      hasDiagonalGradientBackground={hasDiagonalGradientBackground}
    />
  );
  const toggleItem = globalSettings?.settings?.personalizedTiles && (
    <View style={styles.toggleItem}>
      <TouchableOpacity onPress={onPress}>
        <RegularText lightest={hasDiagonalGradientBackground} center small underline>
          {isEditMode ? texts.serviceTiles.done : texts.serviceTiles.edit}
        </RegularText>
      </TouchableOpacity>
    </View>
  );

  return isEditMode ? (
    <DiagonalGradient
      colors={!hasDiagonalGradientBackground ? [colors.surface, colors.surface] : undefined}
      style={styles.diagonalGradient}
    >
      <DraggableGrid onDragEnd={(positions) => console.log(JSON.stringify(positions, null, 2))}>
        {data?.map(renderItem)}
      </DraggableGrid>
      {toggleItem}
    </DiagonalGradient>
  ) : (
    <>
      <WrapperWrap spaceBetween>{data?.map(renderItem)}</WrapperWrap>
      {toggleItem}
    </>
  );
};

const styles = StyleSheet.create({
  diagonalGradient: {
    flex: 1
  },
  toggleItem: {
    paddingVertical: normalize(14)
  }
});
