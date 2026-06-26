import { NavigationProp } from '@react-navigation/native';
import React, { memo, useCallback } from 'react';
import type { ListRenderItem } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import { TextListItem } from '../TextListItem';
import { RegularText } from '../Text';
import { colors, normalize, texts } from '../../config';

import { FloorPlanPin } from './types';
import { canNavigateToLinkedContent, navigateToLinkedContent } from './utils';

type Props = {
  isFullHeight?: boolean;
  navigation: NavigationProp<Record<string, object | undefined>>;
  pins: FloorPlanPin[];
  selectedPinId?: string;
};

export const FloorPlanPinList = memo(
  ({ isFullHeight = false, navigation, pins, selectedPinId }: Props) => {
    const renderItem: ListRenderItem<FloorPlanPin> = useCallback(
      (info) => {
        const item = info.item;
        const itemId = item.listId || item.id;
        const isSelected = itemId === selectedPinId;
        const canNavigate = canNavigateToLinkedContent(item);
        const typeLabel = texts.floorPlan.typeLabels[item.type || 'info'];
        const overtitle = item.floorTitle ? `${item.floorTitle} · ${typeLabel}` : typeLabel;

        return (
          <TextListItem
            containerStyle={StyleSheet.flatten([styles.item, isSelected && styles.selectedItem])}
            item={{
              id: itemId,
              isHeadlineTitle: false,
              onPress: canNavigate
                ? () => navigateToLinkedContent({ navigation, pin: item })
                : undefined,
              overtitle,
              params: item.params || {},
              routeName: item.routeName || '',
              subtitle: item.description || texts.floorPlan.fallbackDescription,
              title: item.title,
              bottomDivider: true
            }}
            listsWithoutArrows={!canNavigate}
            navigation={(canNavigate ? navigation : undefined) as never}
          />
        );
      },
      [navigation, selectedPinId]
    );

    if (!pins.length) {
      return (
        <View style={styles.emptyContainer}>
          <RegularText center placeholder style={styles.emptyText}>
            {texts.floorPlan.emptyPins}
          </RegularText>
        </View>
      );
    }

    return (
      <View style={[styles.container, isFullHeight && styles.fullHeightContainer]}>
        <FlatList
          accessibilityLabel={texts.floorPlan.listAccessibilityLabel}
          contentContainerStyle={[styles.listContent, isFullHeight && styles.fullHeightListContent]}
          data={pins}
          keyExtractor={(item) => item.listId || item.id}
          renderItem={renderItem}
          style={!isFullHeight && styles.list}
        />
      </View>
    );
  }
);

FloorPlanPinList.displayName = 'FloorPlanPinList';

const styles = StyleSheet.create({
  container: {},
  emptyContainer: {
    padding: normalize(16)
  },
  emptyText: {
    textAlign: 'center'
  },
  fullHeightContainer: {
    flex: 1
  },
  fullHeightListContent: {
    paddingBottom: normalize(88)
  },
  item: {},
  list: {
    maxHeight: normalize(220)
  },
  listContent: {
    paddingHorizontal: normalize(16)
  },
  selectedItem: {
    backgroundColor: colors.lighterPrimaryRgba
  }
});
