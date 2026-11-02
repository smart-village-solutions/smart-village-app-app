import { useNavigation, useRoute } from 'expo-router/react-navigation';
import { StackNavigationProp } from 'expo-router/js-stack';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { consts, normalize, texts } from '../../config';
import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { filterProfileEditorialTiles } from '../../helpers/profileEditorialContentHelper';
import { DEFAULT_TILE_GRID_COLUMNS, resolveTileGridLayout } from '../../helpers/serviceTileLayout';
import { umlautSwitcher } from '../../helpers/umlautSwitcher';
import { usePersonalizedTiles } from '../../hooks';
import { OrientationContext } from '../../OrientationProvider';
import { ProfileContext } from '../../ProfileProvider';
import { SettingsContext } from '../../SettingsProvider';
import { ScreenName } from '../../types';
import { DiagonalGradient } from '../DiagonalGradient';
import { LoadingSpinner } from '../LoadingSpinner';
import { RegularText } from '../Text';
import { WrapperWrap } from '../Wrapper';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';

import { DraggableGrid } from './DraggableGrid';
import { ServiceTile, TServiceTile } from './ServiceTile';

const { MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
export const Service = ({
  data,
  isEditMode = false,
  alignIncompleteRowsLeft = false,
  rowHorizontalPadding = 0,
  tileLayoutColumns,
  staticJsonName,
  hasDiagonalGradientBackground
}: {
  data: any;
  isEditMode?: boolean;
  alignIncompleteRowsLeft?: boolean;
  rowHorizontalPadding?: number;
  tileLayoutColumns?: {
    landscape?: number;
    portrait?: number;
  };
  staticJsonName: string;
  hasDiagonalGradientBackground?: boolean;
}) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const { globalSettings } = useContext(SettingsContext);
  const { orientation } = useContext(OrientationContext);
  const { currentUserData } = useContext(ProfileContext);
  const roles = currentUserData?.roles || undefined;
  const route = useRoute();
  const { textScaleMultiplier = 1 } = useContext(AccessibilityContext);
  const { settings = {} } = globalSettings;
  const { personalizedTiles: isPersonalizable = false, tileSizeFactor = 1 } = settings;
  const { appDesignSystem } = useContext(ConfigurationsContext);
  const { serviceTiles = {} } = appDesignSystem;
  const [gridWidth, setGridWidth] = useState<number>();
  const gridGap = normalize(5);
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
    (item: TServiceTile, index: number) => (
      <ServiceTile
        draggableId={umlautSwitcher(item.title) || umlautSwitcher(item.accessibilityLabel)}
        draggableKey={`item${item.title || item.accessibilityLabel}-index${index}`}
        hasDiagonalGradientBackground={hasDiagonalGradientBackground}
        isEditMode={isEditMode}
        item={
          tileLayoutColumns
            ? {
                ...item,
                numberOfTiles: {
                  ...item.numberOfTiles,
                  landscape: tileLayoutColumns.landscape ?? item.numberOfTiles?.landscape,
                  portrait: tileLayoutColumns.portrait ?? item.numberOfTiles?.portrait
                }
              }
            : item
        }
        key={`item${item.title || item.accessibilityLabel}-index${index}`}
        onToggleVisibility={onToggleVisibility}
        serviceTiles={serviceTiles}
        staticJsonName={staticJsonName}
        gridWidth={isEditMode ? undefined : gridWidth}
        gridGap={isEditMode ? undefined : gridGap}
        layoutColumns={itemsPerRow}
        tileSizeFactor={tileSizeFactor}
      />
    ),
    [
      isEditMode,
      hasDiagonalGradientBackground,
      onToggleVisibility,
      serviceTiles,
      tileLayoutColumns,
      itemsPerRow,
      tileSizeFactor,
      staticJsonName,
      gridWidth,
      gridGap
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

  const visibleTiles = useMemo(() => {
    if (isEditMode) {
      return tiles;
    }

    if (route.name === ScreenName.Profile) {
      return filterProfileEditorialTiles(tiles, roles);
    }

    return tiles;
  }, [tiles, route.name, isEditMode, roles]);

  // Split the visible tiles into rows for grid layout based on screen orientation.
  const rows: TServiceTile[][] = [];
  for (let i = 0; i < (visibleTiles?.length || 0); i += itemsPerRow) {
    rows.push(visibleTiles.slice(i, i + itemsPerRow));
  }

  return isEditMode ? (
    <DiagonalGradient
      colors={!hasDiagonalGradientBackground ? [colors.surface, colors.surface] : undefined}
      style={styles.diagonalGradient}
    >
      <DraggableGrid columns={itemsPerRow} onDragEnd={onDragEnd}>
        {tiles?.map((item, index) => renderItem(item, index))}
      </DraggableGrid>
      {toggler}
    </DiagonalGradient>
  ) : (
    <>
      {rows.map((row) => {
        const isLastRow = rows[rows.length - 1] === row;
        const isIncompleteRow = row.length < itemsPerRow;
        // Remount rows when the grid changes so native percentage sizes are recalculated.
        const rowKey = JSON.stringify([
          orientation,
          itemsPerRow,
          ...row.map((tile) => tile.title || tile.accessibilityLabel)
        ]);
        const isLastAndIncompleteRow = isLastRow && isIncompleteRow;
        const shouldCenterIncompleteRow = isLastAndIncompleteRow && !alignIncompleteRowsLeft;
        return (
          <WrapperWrap
            key={rowKey}
            center={shouldCenterIncompleteRow}
            spaceBetween={!isLastAndIncompleteRow}
            onLayout={({ nativeEvent: { layout } }) =>
              setGridWidth(Math.max(0, layout.width - 2 * rowHorizontalPadding))
            }
            style={{ columnGap: gridGap, paddingHorizontal: rowHorizontalPadding }}
          >
            {row.map((item, index) => renderItem(item, index))}
          </WrapperWrap>
        );
      })}
      {!!visibleTiles?.length && toggler}
    </>
  );
};
/* eslint-enable complexity */

const createStyles = () => ({
  diagonalGradient: {
    flex: 1
  },

  toggler: {
    paddingVertical: normalize(14)
  }
});
