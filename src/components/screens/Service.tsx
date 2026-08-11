import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, normalize, texts } from '../../config';
import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { filterProfileEditorialTiles } from '../../helpers/profileEditorialContentHelper';
import { usePersonalizedTiles } from '../../hooks';
import { OrientationContext } from '../../OrientationProvider';
import { ProfileContext } from '../../ProfileProvider';
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
  const { globalSettings } = useContext(SettingsContext);
  const { orientation } = useContext(OrientationContext);
  const { currentUserData } = useContext(ProfileContext);
  const roles = currentUserData?.roles || undefined;
  const route = useRoute();
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
    (item: TServiceTile, index: number, shouldAddMargin?: boolean) => (
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
        shouldAddMargin={shouldAddMargin}
        tileSizeFactor={tileSizeFactor}
      />
    ),
    [
      isEditMode,
      hasDiagonalGradientBackground,
      onToggleVisibility,
      serviceTiles,
      tileLayoutColumns,
      tileSizeFactor
    ]
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

  const isPortrait = orientation === 'portrait';
  const itemsPerRow = isPortrait ? ITEMS_PER_ROW_PORTRAIT : ITEMS_PER_ROW_LANDSCAPE;

  const visibleTiles = useMemo(() => {
    if (isEditMode) {
      return tiles;
    }

    if (route.name === ScreenName.Profile) {
      return filterProfileEditorialTiles(tiles, roles);
    }

    return tiles;
  }, [tiles, route.name, isEditMode, roles]);

  if (isLoading && isEditMode) return <LoadingSpinner loading />;

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
      <DraggableGrid onDragEnd={onDragEnd}>
        {tiles?.map((item, index) => renderItem(item, index))}
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
        const shouldCenterIncompleteRow = isLastAndIncompleteRow && !alignIncompleteRowsLeft;
        // marginLeft add only if it's the last row, centered and there is more than one item
        const shouldAddMargin = shouldCenterIncompleteRow && row.length > 1;

        return (
          <WrapperWrap
            key={rowKey}
            center={shouldCenterIncompleteRow}
            spaceBetween={!isLastAndIncompleteRow}
            style={rowHorizontalPadding ? { paddingHorizontal: rowHorizontalPadding } : undefined}
          >
            {row.map((item, index) => renderItem(item, index, shouldAddMargin))}
          </WrapperWrap>
        );
      })}
      {!!visibleTiles?.length && toggler}
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
