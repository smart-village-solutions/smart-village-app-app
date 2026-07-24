import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { colors, consts, normalize, texts } from '../../config';
import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { DEFAULT_TILE_GRID_COLUMNS, resolveTileGridLayout } from '../../helpers/serviceTileLayout';
import { umlautSwitcher } from '../../helpers/umlautSwitcher';
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

const { MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
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
  const { textScaleMultiplier = 1 } = useContext(AccessibilityContext);
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
  const tileGridLayout = useMemo(
    () => resolveTileGridLayout(orientation as 'portrait' | 'landscape', textScaleMultiplier),
    [orientation, textScaleMultiplier]
  );
  const defaultColumnsByOrientation =
    orientation === 'portrait'
      ? DEFAULT_TILE_GRID_COLUMNS.portrait
      : DEFAULT_TILE_GRID_COLUMNS.landscape;
  const itemsPerRow =
    typeof tileGridLayout.columns === 'number' && tileGridLayout.columns > 0
      ? tileGridLayout.columns
      : defaultColumnsByOrientation;

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
    [isEditMode, hasDiagonalGradientBackground, navigation, staticJsonName]
  );
  const renderItem = useCallback(
    (item: TServiceTile, index: number, shouldAddMargin?: boolean) => (
      <ServiceTile
        draggableId={umlautSwitcher(item.title) || umlautSwitcher(item.accessibilityLabel)}
        draggableKey={`item${item.title || item.accessibilityLabel}-index${index}`}
        hasDiagonalGradientBackground={hasDiagonalGradientBackground}
        isEditMode={isEditMode}
        item={item}
        key={`item${item.title || item.accessibilityLabel}-index${index}`}
        onToggleVisibility={onToggleVisibility}
        serviceTiles={serviceTiles}
        shouldAddMargin={shouldAddMargin}
        layoutColumns={itemsPerRow}
        tileSizeFactor={tileSizeFactor}
      />
    ),
    [
      isEditMode,
      hasDiagonalGradientBackground,
      onToggleVisibility,
      serviceTiles,
      itemsPerRow,
      tileSizeFactor
    ]
  );
  const toggler = isPersonalizable && (
    <View style={styles.toggler}>
      <TouchableOpacity
        accessibilityLabel={
          isEditMode
            ? texts.accessibilityLabels.actions.finishEditing
            : texts.accessibilityLabels.actions.edit
        }
        onPress={onPress}
      >
        <RegularText lightest={hasDiagonalGradientBackground} center small underline>
          {isEditMode ? texts.serviceTiles.done : texts.serviceTiles.edit}
        </RegularText>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && isEditMode) return <LoadingSpinner loading />;

  const tilesCount = tiles?.length || 0;

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
      <DraggableGrid columns={itemsPerRow} onDragEnd={onDragEnd}>
        {tiles?.map(renderItem)}
      </DraggableGrid>
      {toggler}
    </DiagonalGradient>
  ) : (
    <>
      {rows.map((row) => {
        const isLastRow = rows[rows.length - 1] === row;
        const isIncompleteRow = row.length < itemsPerRow;
        const rowKey = row.map((tile) => tile.title || tile.accessibilityLabel);
        const isLastAndIncompleteRow = isLastRow && isIncompleteRow;
        // marginLeft add only if it's the last row and there is more than one item
        const shouldAddMargin = isLastAndIncompleteRow && row.length > 1;

        return (
          <WrapperWrap
            key={rowKey}
            center={isLastAndIncompleteRow}
            spaceBetween={!isLastAndIncompleteRow}
          >
            {row.map((item, index) => renderItem(item, index, shouldAddMargin))}
          </WrapperWrap>
        );
      })}
      {toggler}
    </>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  diagonalGradient: {
    flex: 1
  },
  toggler: {
    paddingVertical: normalize(14)
  }
});
