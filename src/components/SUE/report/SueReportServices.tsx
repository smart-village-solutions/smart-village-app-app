import React, { memo, useContext, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from 'react-query';

import { AccessibilityContext } from '../../../AccessibilityProvider';
import { consts, Icon } from '../../../config';
import { resolveEffectiveTextScale, resolveResponsiveGridLayout } from '../../../helpers';
import { useTheme } from '../../../hooks/useTheme';
import { QUERY_TYPES, getQuery } from '../../../queries';
import { TService } from '../../../screens/SUE/SueReportScreen';
import { LoadingSpinner } from '../../LoadingSpinner';
import { BoldText } from '../../Text';

const { a11yLabel } = consts;
const SUE_CONTAINER_PADDING = 16;
const SUE_TILE_GAP = 12;
const SUE_TILE_MIN_WIDTH = 144;
const queryServices = getQuery(QUERY_TYPES.SUE.SERVICES) as () => Promise<TService[]>;

type ServiceTileProps = {
  accessibilityLabel: string;
  isList: boolean;
  item: TService;
  onPress: () => void;
  selected: boolean;
  width: number;
};

const ServiceTile = memo(
  ({ accessibilityLabel, isList, item, selected, onPress, width }: ServiceTileProps) => {
    const { colors } = useTheme();

    return (
      <TouchableOpacity
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={[
          styles.tile,
          isList && styles.listTile,
          { width },
          {
            backgroundColor: selected ? colors.primary + '10' : colors.transparent,
            borderColor: selected ? colors.primary : colors.gray40
          }
        ]}
      >
        <BoldText center>{item.serviceName}</BoldText>
        {selected && (
          <Icon.Check color={colors.primary} hasNoHitSlop size={20} style={styles.selectedIcon} />
        )}
      </TouchableOpacity>
    );
  }
);

export const SueReportServices = ({
  service,
  setService
}: {
  service?: TService;
  setService: (service: TService) => void;
}) => {
  const { fontScale, width } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const { textScaleMultiplier = 1 } = useContext(AccessibilityContext);

  const { data, isLoading } = useQuery<TService[]>([QUERY_TYPES.SUE.SERVICES], queryServices);

  const memoizedData = useMemo(() => data || [], [data]);
  const availableWidth = Math.max(
    0,
    width - safeAreaInsets.left - safeAreaInsets.right - 2 * SUE_CONTAINER_PADDING
  );
  const effectiveTextScale = resolveEffectiveTextScale(fontScale, textScaleMultiplier);
  const layout = useMemo(
    () =>
      resolveResponsiveGridLayout({
        availableWidth,
        gap: SUE_TILE_GAP,
        itemCount: memoizedData.length,
        maxColumns: 2,
        minItemWidth: SUE_TILE_MIN_WIDTH,
        textScale: effectiveTextScale
      }),
    [availableWidth, effectiveTextScale, memoizedData.length]
  );
  const isList = layout.columns === 1;

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingLeft: SUE_CONTAINER_PADDING + safeAreaInsets.left,
          paddingRight: SUE_CONTAINER_PADDING + safeAreaInsets.right
        }
      ]}
    >
      {memoizedData.map((item: TService) => {
        const selected = service?.serviceCode === item.serviceCode;
        return (
          <ServiceTile
            accessibilityLabel={`${item.serviceName} ${a11yLabel.button}`}
            isList={isList}
            item={item}
            key={item.serviceCode}
            onPress={() => setService(item)}
            selected={selected}
            width={layout.itemWidth}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SUE_TILE_GAP,
    paddingVertical: SUE_CONTAINER_PADDING,
    width: '100%'
  },
  listTile: {
    minHeight: 64
  },
  selectedIcon: {
    position: 'absolute',
    right: 8,
    top: 8
  },
  tile: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 96,
    paddingHorizontal: 32,
    paddingVertical: 12,
    position: 'relative'
  }
});
