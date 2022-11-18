import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

import { TServiceTile } from '../components';
import { Positions } from '../components/screens/DraggableItem';
import { addToStore, readFromStore } from '../helpers';

const PERSONALIZED_TILES_SETTINGS = 'PERSONALIZED_TILES_SETTINGS';

export const usePersonalizedTiles = (
  isPersonalizable = false,
  data: any,
  isEditMode: boolean,
  staticJsonName: string
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tiles, setTiles] = useState<any[]>(data || []);

  const getPersonalizedTiles = useCallback(async () => {
    setIsLoading(true);
    const storedPersonalizedTilesSettings = await readFromStore(PERSONALIZED_TILES_SETTINGS);
    const sorter = storedPersonalizedTilesSettings?.[staticJsonName]?.sorter;

    if (sorter) {
      const sortedTiles = [...tiles].sort((a: TServiceTile, b: TServiceTile) => {
        const sortTitles = {
          a: a.title?.replace('​', '') || a.accessibilityLabel,
          b: b.title?.replace('​', '') || b.accessibilityLabel
        };
        const sortA =
          sorter?.[sortTitles.a] ?? tiles.findIndex((d: TServiceTile) => d.title === a.title);
        const sortB =
          sorter?.[sortTitles.b] ?? tiles.findIndex((d: TServiceTile) => d.title === b.title);

        return sortA - sortB;
      });

      setTiles(sortedTiles);
    }
    setIsLoading(false);
  }, [staticJsonName]);

  const storePersonalizedTilesSettings = useCallback(
    async ({ personalizedTilesSorter }: { personalizedTilesSorter: Positions }) => {
      const storedPersonalizedTilesSettings = await readFromStore(PERSONALIZED_TILES_SETTINGS);

      await addToStore(PERSONALIZED_TILES_SETTINGS, {
        ...storedPersonalizedTilesSettings,
        [staticJsonName]: {
          ...storedPersonalizedTilesSettings?.[staticJsonName],
          sorter: personalizedTilesSorter
        }
      });
    },
    [staticJsonName]
  );

  const onDragEnd = useCallback(
    (positions: Positions) =>
      storePersonalizedTilesSettings({ personalizedTilesSorter: positions }),
    [staticJsonName]
  );

  const onToggleVisibility = useCallback(
    (toggleableId: string, isVisible: boolean, setIsVisible: (isVisible: boolean) => void) => {
      console.log('onToggleVisibility', toggleableId, isVisible);
      setIsVisible(!isVisible);
    },
    [staticJsonName]
  );

  const isFocused = useIsFocused();

  const refreshTiles = useCallback(
    () => !isEditMode && getPersonalizedTiles(),
    [isEditMode, getPersonalizedTiles]
  );

  useEffect(() => {
    isPersonalizable && refreshTiles();
  }, [isFocused]);

  useEffect(() => {
    isPersonalizable && getPersonalizedTiles();
  }, []);

  return { isLoading, tiles, onDragEnd, onToggleVisibility };
};
