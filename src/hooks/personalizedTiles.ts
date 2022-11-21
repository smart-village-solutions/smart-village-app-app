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
    const toggles = storedPersonalizedTilesSettings?.[staticJsonName]?.toggles;
    const sorter = storedPersonalizedTilesSettings?.[staticJsonName]?.sorter;

    let personalizedTiles = [...tiles];

    if (toggles) {
      // in edit mode we want to show all tiles but with visual difference.
      // if we are not in edit mode we want to filter out tiles entirely.
      // if there is no entry in `toggles`, it means that the tile is new or never toggled, so we
      // want to show it.
      const isVisible = (item: TServiceTile) => toggles[item.title || item.accessibilityLabel] ?? 1;

      if (isEditMode) {
        personalizedTiles = personalizedTiles.map((item: TServiceTile) => ({
          ...item,
          isVisible: isVisible(item)
        }));
      } else {
        personalizedTiles = personalizedTiles.filter(isVisible);
      }
    }

    if (sorter) {
      const sortedTiles = personalizedTiles.sort((a: TServiceTile, b: TServiceTile) => {
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
    async ({
      personalizedTilesSorter,
      personalizedTilesToggle
    }: {
      personalizedTilesSorter?: Positions;
      personalizedTilesToggle?: Positions;
    }) => {
      const storedPersonalizedTilesSettings = await readFromStore(PERSONALIZED_TILES_SETTINGS);

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

      if (personalizedTilesSorter) {
        await addToStore(PERSONALIZED_TILES_SETTINGS, {
          ...storedPersonalizedTilesSettings,
          [staticJsonName]: {
            ...storedPersonalizedTilesSettings?.[staticJsonName],
            sorter: personalizedTilesSorter
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
    [staticJsonName]
  );

  const onDragEnd = useCallback(
    (positions: Positions) =>
      storePersonalizedTilesSettings({ personalizedTilesSorter: positions }),
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
