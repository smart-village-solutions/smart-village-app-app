import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, normalize, texts } from '../../config';
import { SettingsContext } from '../../SettingsProvider';
import { ScreenName } from '../../types';
import { DiagonalGradient } from '../DiagonalGradient';
import { RegularText } from '../Text';
import { WrapperWrap } from '../Wrapper';

import { DraggableGrid } from './DraggableGrid';
import { ServiceTile, TServiceTile } from './ServiceTile';

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
        key={index + (item.title || item.accessibilityLabel)}
        item={item}
        isEditMode={isEditMode}
        draggableId={item.title || item.accessibilityLabel}
        hasDiagonalGradientBackground={hasDiagonalGradientBackground}
      />
    ),
    [isEditMode, hasDiagonalGradientBackground]
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

  const sorter = {
    'Bürgeramt/Termine': 1,
    Bürgerbeteiligung: 0,
    Bürgermeister: 7,
    Bürgerservice: 4,
    Formulare: 5,
    Gemeindeporträt: 8,
    Kommunalpolitik: 3,
    'Kontakt zur Verwaltung': 2,
    Presse: 6,
    Stellenangebote: 9
  };

  const sortedData = [...data].sort((a: TServiceTile, b: TServiceTile) => {
    const sortTitles = {
      a: a.title?.replace('​', '') || a.accessibilityLabel,
      b: b.title?.replace('​', '') || b.accessibilityLabel
    };
    const sortA =
      sorter?.[sortTitles.a] ?? data.findIndex((d: TServiceTile) => d.title === a.title);
    const sortB =
      sorter?.[sortTitles.b] ?? data.findIndex((d: TServiceTile) => d.title === b.title);

    return sortA - sortB;
  });

  return isEditMode ? (
    <DiagonalGradient
      colors={!hasDiagonalGradientBackground ? [colors.surface, colors.surface] : undefined}
      style={styles.diagonalGradient}
    >
      <DraggableGrid onDragEnd={(positions) => console.log(JSON.stringify(positions, null, 2))}>
        {sortedData?.map(renderItem)}
      </DraggableGrid>
      {toggleItem}
    </DiagonalGradient>
  ) : (
    <>
      <WrapperWrap spaceBetween>{sortedData?.map(renderItem)}</WrapperWrap>
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
