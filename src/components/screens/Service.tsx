import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, normalize, texts } from '../../config';
import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { usePersonalizedTiles } from '../../hooks';
import { OrientationContext } from '../../OrientationProvider';
import { SettingsContext } from '../../SettingsProvider';
import { ScreenName } from '../../types';
import { DiagonalGradient } from '../DiagonalGradient';
import { LoadingSpinner } from '../LoadingSpinner';
import { RegularText } from '../Text';
import { WrapperWrap } from '../Wrapper';

import { DraggableGrid } from './DraggableGrid';
import { ServiceTile, TServiceTile } from './ServiceTile';

const { MATOMO_TRACKING, UMLAUT_REGEX } = consts;
const ITEMS_PER_ROW_PORTRAIT = 3;
const ITEMS_PER_ROW_LANDSCAPE = 5;

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
  const { orientation } = useContext(OrientationContext);
  const { settings = {} } = globalSettings;
  const { personalizedTiles: isPersonalizable = false, tileSizeFactor = 1 } = settings;
  const { appDesignSystem } = useContext(ConfigurationsContext);
  const { serviceTiles = {} } = appDesignSystem;
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { isLoading, tiles, onDragEnd, onToggleVisibility } = usePersonalizedTiles(
    isPersonalizable,
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
    (item: TServiceTile, index: number, isLastRow?: boolean) => (
      <ServiceTile
        draggableId={umlautSwitcher(item.title) || umlautSwitcher(item.accessibilityLabel)}
        draggableKey={`item${item.title || item.accessibilityLabel}-index${index}`}
        hasDiagonalGradientBackground={hasDiagonalGradientBackground}
        isEditMode={isEditMode}
        isLastRow={isLastRow}
        item={item}
        key={`item${item.title || item.accessibilityLabel}-index${index}`}
        onToggleVisibility={onToggleVisibility}
        serviceTiles={serviceTiles}
        tileSizeFactor={tileSizeFactor}
      />
    ),
    [isEditMode, hasDiagonalGradientBackground]
  );
  const toggler = isPersonalizable && (
    <View style={styles.toggler}>
      <TouchableOpacity onPress={onPress}>
        <RegularText lightest={hasDiagonalGradientBackground} center small underline>
          {isEditMode ? texts.serviceTiles.done : texts.serviceTiles.edit}
        </RegularText>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && isEditMode) return <LoadingSpinner loading />;

  const tilesCount = tiles?.length || 0;
  const isPortrait = orientation === 'portrait';
  const itemsPerRow = isPortrait ? ITEMS_PER_ROW_PORTRAIT : ITEMS_PER_ROW_LANDSCAPE;

  // Split the tiles array into subarrays (rows), each containing up to itemsPerRow elements.
  // This is done to render tiles row-by-row in a grid layout based on screen orientation.
  const rows: TServiceTile[][] = [];
  for (let i = 0; i < tilesCount; i += itemsPerRow) {
    rows.push(tiles.slice(i, i + itemsPerRow));
  }

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
      {rows.map((row) => {
        const isLastRow = rows[rows.length - 1] === row;
        const isIncompleteRow = row.length < itemsPerRow;
        const rowKey = row.map((tile) => tile.title || tile.accessibilityLabel);
        const isLastAndIncompleteRow = isLastRow && isIncompleteRow;

        return (
          <WrapperWrap
            key={rowKey}
            center={isLastAndIncompleteRow}
            spaceBetween={!isLastAndIncompleteRow}
          >
            {row.map((item, index) => renderItem(item, index, isLastAndIncompleteRow))}
          </WrapperWrap>
        );
      })}
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
