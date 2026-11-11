import { consts } from '../../config/consts';
import { isValidGeoLocation } from '../../helpers/mapHelper';
import { MapMarker } from '../../types';

type Category = { id?: string; name?: string };

type RelatedPointOfInterest = {
  id: string;
  name?: string;
  visible?: boolean;
  payload?: { iconName?: string; activeIconName?: string };
  category?: { iconName?: string };
  addresses?: Array<{
    geoLocation?: { latitude?: number; longitude?: number };
  }>;
};

export const getPointOfInterestMapCategoryIds = (
  categories: Category[] | undefined,
  categoryName: string | undefined
): string[] => {
  const matchingCategories = categories?.filter((category) => category.name === categoryName);
  const selectedCategories = matchingCategories?.length ? matchingCategories : categories;
  const ids = selectedCategories?.map((category) => category.id).filter((id): id is string => !!id);

  return [...new Set(ids)];
};

export const getPointOfInterestMapMarkers = (
  currentMarker: MapMarker,
  pointsOfInterest: RelatedPointOfInterest[] | undefined
): MapMarker[] => [
  currentMarker,
  ...(pointsOfInterest ?? [])
    .filter(
      (item) =>
        item.visible === true &&
        item.id !== currentMarker.id &&
        isValidGeoLocation(item.addresses?.[0]?.geoLocation)
    )
    .map((item) => {
      const iconName = item.payload?.iconName || item.category?.iconName || consts.MAP.DEFAULT_PIN;

      return {
        [iconName]: 1,
        id: item.id,
        title: item.name,
        iconName,
        activeIconName:
          item.payload?.activeIconName ||
          (item.payload?.iconName ? undefined : `${iconName}Active`),
        position: {
          latitude: item.addresses![0].geoLocation!.latitude!,
          longitude: item.addresses![0].geoLocation!.longitude!
        }
      };
    })
];
