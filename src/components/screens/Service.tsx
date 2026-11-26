import { useNavigation, useRoute } from 'expo-router/react-navigation';
import { StackNavigationProp } from 'expo-router/js-stack';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { consts, normalize, texts } from '../../config';
import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { filterProfileEditorialTiles } from '../../helpers/profileEditorialContentHelper';
import {
  DEFAULT_TILE_GRID_COLUMNS,
  groupServiceTileRows,
  resolveTileGridLayout
} from '../../helpers/serviceTileLayout';
import { umlautSwitcher } from '../../helpers/umlautSwitcher';
import { usePersonalizedTiles } from '../../hooks';
import { OrientationContext } from '../../OrientationProvider';
import { ProfileContext } from '../../ProfileProvider';
import { SettingsContext } from '../../SettingsProvider';
import { ScreenName } from '../../types';
import { isKlimaTalerConfigured } from '../../klimaTaler/settings';
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
  const configureTile = useCallback(
    (item: TServiceTile) =>
      tileLayoutColumns
        ? {
            ...item,
            numberOfTiles: {
              landscape: tileLayoutColumns.landscape ?? item.numberOfTiles?.landscape,
              portrait: tileLayoutColumns.portrait ?? item.numberOfTiles?.portrait
            }
          }
        : item,
    [tileLayoutColumns]
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

  const visibleTiles = useMemo(() => {
    const enabledTiles = tiles?.filter(
      (tile: TServiceTile) =>
        tile.routeName !== 'KlimaTaler' || isKlimaTalerConfigured(globalSettings)
    );
    if (isEditMode) {
      return enabledTiles;
    }

    if (route.name === ScreenName.Profile) {
      return filterProfileEditorialTiles(enabledTiles, roles);
    }

    return enabledTiles;
  }, [tiles, route.name, isEditMode, roles, globalSettings]);

  if (isLoading && isEditMode) return <LoadingSpinner loading />;

  const rows = groupServiceTileRows(
    (visibleTiles ?? []).map(configureTile),
    orientation as 'portrait' | 'landscape',
    itemsPerRow,
    serviceTiles.tileStyle
  );

  return isEditMode ? (
    <DiagonalGradient
      colors={!hasDiagonalGradientBackground ? [colors.surface, colors.surface] : undefined}
      style={styles.diagonalGradient}
    >
      <DraggableGrid columns={itemsPerRow} onDragEnd={onDragEnd}>
        {visibleTiles?.map((item, index) => renderItem(configureTile(item), index))}
      </DraggableGrid>
      {toggler}
    </DiagonalGradient>
  ) : (
    <>
      {rows.map((row) => {
        const isLastRow = rows[rows.length - 1] === row;
        const isIncompleteRow = row.fill < 1 - 1e-6;
        // Remount rows when the grid changes so native percentage sizes are recalculated.
        const rowKey = JSON.stringify([
          orientation,
          itemsPerRow,
          row.fill,
          ...row.tiles.map((tile) => tile.title || tile.accessibilityLabel)
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
            // Rows are already grouped above; native wrapping would split them a second time.
            style={{
              ...styles.gridRow,
              columnGap: gridGap,
              paddingHorizontal: rowHorizontalPadding
            }}
          >
            {row.tiles.map((item, index) => renderItem(item, index))}
          </WrapperWrap>
        );
      })}
      {!!visibleTiles?.length && toggler}
    </>
  );
};
/* eslint-enable complexity */

const createStyles = () => ({
  gridRow: {
    flexWrap: 'nowrap'
  },

  diagonalGradient: {
    flex: 1
  },

  toggler: {
    paddingVertical: normalize(14)
  }
});
