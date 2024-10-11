import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, normalize, texts } from '../../config';
import { usePersonalizedTiles } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { ScreenName } from '../../types';
import { DiagonalGradient } from '../DiagonalGradient';
import { LoadingSpinner } from '../LoadingSpinner';
import { RegularText } from '../Text';
import { WrapperWrap } from '../Wrapper';

import { DraggableGrid } from './DraggableGrid';
import { ServiceTile, TServiceTile } from './ServiceTile';

const { MATOMO_TRACKING, UMLAUT_REGEX } = consts;

export const umlautSwitcher = (text: string) => {
  if (!text) return;

  const umlautReplacements = {
    ü: 'ue',
    ä: 'ae',
    ö: 'oe',
    Ü: 'UE',
    Ä: 'AE',
    Ö: 'OE',
    ß: 'ss'
  };

  const replacedText = text
    .replace(UMLAUT_REGEX, (match: string) => umlautReplacements[match])
    ?.replace('​', '');

  return replacedText;
};

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
  const { settings = {} } = globalSettings;
  const { personalizedTiles = false, tileSizeFactor = 1 } = settings;
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { isLoading, tiles, onDragEnd, onToggleVisibility } = usePersonalizedTiles(
    personalizedTiles,
    data,
    isEditMode,
    staticJsonName
  );

  const onPress = useCallback(
    () =>
      isEditMode
        ? navigation.goBack()
        : navigation.push(ScreenName.TilesScreen, {
            matomoString: MATOMO_TRACKING.SCREEN_VIEW.SERVICE,
            staticJsonName,
            titleFallback: texts.homeTitles.service,
            isEditMode: true,
            hasDiagonalGradientBackground
          }),
    [isEditMode, hasDiagonalGradientBackground]
  );
  const renderItem = useCallback(
    (item: TServiceTile, index: number) => (
      <ServiceTile
        draggableId={umlautSwitcher(item.title) || umlautSwitcher(item.accessibilityLabel)}
        hasDiagonalGradientBackground={hasDiagonalGradientBackground}
        isEditMode={isEditMode}
        item={item}
        key={index + (item.title || item.accessibilityLabel)}
        onToggleVisibility={onToggleVisibility}
        tileSizeFactor={tileSizeFactor}
      />
    ),
    [isEditMode, hasDiagonalGradientBackground]
  );
  const toggler = personalizedTiles && (
    <View style={styles.toggler}>
      <TouchableOpacity onPress={onPress}>
        <RegularText lightest={hasDiagonalGradientBackground} center small underline>
          {isEditMode ? texts.serviceTiles.done : texts.serviceTiles.edit}
        </RegularText>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && isEditMode) return <LoadingSpinner loading />;

  return isEditMode ? (
    <DiagonalGradient
      colors={!hasDiagonalGradientBackground ? [colors.surface, colors.surface] : undefined}
      style={styles.diagonalGradient}
    >
      <DraggableGrid onDragEnd={onDragEnd}>{tiles?.map(renderItem)}</DraggableGrid>
      {toggler}
    </DiagonalGradient>
  ) : (
    <>
      <WrapperWrap spaceBetween>{tiles?.map(renderItem)}</WrapperWrap>
      {!!tiles?.length && toggler}
    </>
  );
};

const styles = StyleSheet.create({
  diagonalGradient: {
    flex: 1
  },
  toggler: {
    paddingVertical: normalize(14)
  }
});
