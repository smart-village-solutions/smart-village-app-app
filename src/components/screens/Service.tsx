import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
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
import { DraggableList } from './DraggableList';
import { ServiceTile, TServiceTile } from './ServiceTile';
import { LIST_TYPES } from './ServiceTiles';

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
  hasDiagonalGradientBackground,
  isEditMode,
  listType,
  staticJsonName
}: {
  data: any;
  hasDiagonalGradientBackground?: boolean;
  isEditMode: boolean;
  listType?: string;
  staticJsonName: string;
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
            hasDiagonalGradientBackground,
            isEditMode: true,
            listType,
            matomoString: MATOMO_TRACKING.SCREEN_VIEW.SERVICE,
            staticJsonName,
            titleFallback: texts.homeTitles.service
          }),
    [isEditMode, hasDiagonalGradientBackground, listType]
  );

  const renderItem = useCallback(
    (item: TServiceTile, index: number) => (
      <ServiceTile
        draggableId={umlautSwitcher(item.title) || umlautSwitcher(item.accessibilityLabel)}
        draggableKey={`item${item.title || item.accessibilityLabel}-index${index}`}
        hasDiagonalGradientBackground={hasDiagonalGradientBackground}
        isEditMode={isEditMode}
        item={item}
        key={`item${item.title || item.accessibilityLabel}-index${index}`}
        listType={listType}
        onToggleVisibility={onToggleVisibility}
        tileSizeFactor={tileSizeFactor}
      />
    ),
    [isEditMode, hasDiagonalGradientBackground, listType]
  );

  const toggler = personalizedTiles && (
    <View style={styles.toggler}>
      <TouchableOpacity onPress={onPress}>
        <RegularText lightest={hasDiagonalGradientBackground} center small underline>
          {isEditMode
            ? texts.serviceTiles.done
            : listType === LIST_TYPES.grid
            ? texts.serviceTiles.edit
            : texts.serviceTiles.listEdit}
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
      {listType === LIST_TYPES.grid ? (
        <DraggableGrid onDragEnd={onDragEnd}>{tiles?.map(renderItem)}</DraggableGrid>
      ) : (
        <DraggableList onDragEnd={onDragEnd}>{tiles?.map(renderItem)}</DraggableList>
      )}
      {toggler}
    </DiagonalGradient>
  ) : (
    <>
      {listType === LIST_TYPES.grid ? (
        <WrapperWrap spaceBetween>{tiles?.map(renderItem)}</WrapperWrap>
      ) : (
        tiles?.map(renderItem)
      )}
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
