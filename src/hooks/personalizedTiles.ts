import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

import type { Positions } from '../components/screens/DraggableItem';
import type { TServiceTile } from '../components/screens/ServiceTile';
import { umlautSwitcher } from '../helpers/umlautSwitcher';
import { addToStore, readFromStore } from '../helpers/storageHelper';

const PERSONALIZED_TILES_SETTINGS = 'PERSONALIZED_TILES_SETTINGS';

type PersonalizedTilesSettings = {
  sorter?: Positions;
  toggles?: Positions;
};

const getTileId = (item: TServiceTile) =>
  umlautSwitcher(item.title) || umlautSwitcher(item.accessibilityLabel);

export const applyPersonalizedTilesSettings = ({
  data,
  isEditMode = false,
  settings
}: {
  data: TServiceTile[];
  isEditMode?: boolean;
  settings?: PersonalizedTilesSettings;
}) => {
  const toggles = settings?.toggles;
  const sorter = settings?.sorter;
  const orderMap = new Map<string, number>();

  data.forEach((item, index) => {
    const id = getTileId(item);

    if (id) {
      orderMap.set(id, index);
    }
  });

  let personalizedTiles = [...data];

  if (sorter) {
    personalizedTiles = personalizedTiles.sort((a: TServiceTile, b: TServiceTile) => {
      const idA = getTileId(a);
      const idB = getTileId(b);

      const sortA = idA && typeof sorter[idA] === 'number' ? sorter[idA] : orderMap.get(idA) ?? 0;
      const sortB = idB && typeof sorter[idB] === 'number' ? sorter[idB] : orderMap.get(idB) ?? 0;

      return sortA - sortB;
    });
  }

  if (!toggles) {
    return personalizedTiles;
  }

  const isVisible = (item: TServiceTile) => {
    const id = getTileId(item);
    const toggleValue = id ? toggles[id] : undefined;

    return typeof toggleValue === 'number' ? toggleValue !== 0 : true;
  };

  if (isEditMode) {
    return personalizedTiles.map((item: TServiceTile) => ({
      ...item,
      isVisible: isVisible(item)
    }));
  }

  return personalizedTiles.filter(isVisible);
};

export const usePersonalizedTiles = (
  isPersonalizable = false,
  data: TServiceTile[],
  isEditMode = false,
  staticJsonName: string
) => {
  const [isLoading, setIsLoading] = useState(isPersonalizable);
  const [tiles, setTiles] = useState<TServiceTile[]>(!isPersonalizable ? data : []);

  const getPersonalizedTiles = useCallback(async () => {
    setIsLoading(true);
    const storedPersonalizedTilesSettings = await readFromStore(PERSONALIZED_TILES_SETTINGS);
    const personalizedTiles = applyPersonalizedTilesSettings({
      data,
      isEditMode,
      settings: storedPersonalizedTilesSettings?.[staticJsonName]
    });

    setTiles(personalizedTiles);
    setIsLoading(false);
  }, [staticJsonName, data, isEditMode]);

  const storePersonalizedTilesSettings = useCallback(
    async ({
      personalizedTilesSorter,
      personalizedTilesToggle
    }: {
      personalizedTilesSorter?: Positions;
      personalizedTilesToggle?: Positions;
    }) => {
      const storedPersonalizedTilesSettings = await readFromStore(PERSONALIZED_TILES_SETTINGS);

      if (personalizedTilesSorter) {
        await addToStore(PERSONALIZED_TILES_SETTINGS, {
          ...storedPersonalizedTilesSettings,
          [staticJsonName]: {
            ...storedPersonalizedTilesSettings?.[staticJsonName],
            sorter: {
              ...storedPersonalizedTilesSettings?.[staticJsonName]?.sorter,
              ...personalizedTilesSorter
            }
          }
        });
      }

      if (personalizedTilesToggle) {
        await addToStore(PERSONALIZED_TILES_SETTINGS, {
          ...storedPersonalizedTilesSettings,
          [staticJsonName]: {
            ...storedPersonalizedTilesSettings?.[staticJsonName],
            toggles: {
              ...storedPersonalizedTilesSettings?.[staticJsonName]?.toggles,
              ...personalizedTilesToggle
            }
          }
        });
      }
    },
    [staticJsonName]
  );

  const onToggleVisibility = useCallback(
    (toggleableId: string, oldVisibility: boolean, setIsVisible: (isVisible: boolean) => void) => {
      const newVisibility = !oldVisibility;
      const visibility = { [toggleableId]: Number(newVisibility) };

      setIsVisible(newVisibility);
      storePersonalizedTilesSettings({ personalizedTilesToggle: visibility });
    },
    [storePersonalizedTilesSettings]
  );

  const onDragEnd = useCallback(
    (positions: Positions) =>
      storePersonalizedTilesSettings({ personalizedTilesSorter: positions }),
    [storePersonalizedTilesSettings]
  );

  const refreshTiles = useCallback(() => getPersonalizedTiles(), [getPersonalizedTiles]);

  useFocusEffect(
    useCallback(() => {
      isPersonalizable && !isEditMode && refreshTiles();
    }, [isPersonalizable, isEditMode, refreshTiles])
  );

  useEffect(() => {
    isPersonalizable && getPersonalizedTiles();
  }, [isPersonalizable, getPersonalizedTiles]);

  return { isLoading, tiles, onDragEnd, onToggleVisibility };
};
