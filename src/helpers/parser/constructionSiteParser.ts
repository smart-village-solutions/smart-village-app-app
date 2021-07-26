import { ConstructionSite, ConstructionSitePayload, GenericItem } from '../../types';

export const parseConstructionSite = (
  constructionSite: GenericItem<ConstructionSitePayload>
): Partial<ConstructionSite> => {
  let location:
    | {
        lat: number;
        lon: number;
      }
    | undefined;
  if (constructionSite?.locations?.[0]?.geoLocation) {
    location = {
      lat: constructionSite.locations?.[0].geoLocation?.latitude,
      lon: constructionSite.locations?.[0].geoLocation?.longitude
    };
  }
  const imageData = constructionSite.mediaContents?.[0];

  return {
    id: constructionSite.id,
    startDate: constructionSite.dates?.[0]?.dateStart,
    title: constructionSite.title,
    category: constructionSite.categories?.[0]?.name,
    cause: constructionSite.payload.cause,
    description: constructionSite.contentBlocks?.[0]?.body,
    direction: constructionSite.payload.direction,
    endDate: constructionSite.dates?.[0]?.dateEnd,
    image: {
      captionText: imageData?.captionText,
      copyright: imageData?.copyright,
      url: imageData?.sourceUrl?.url
    },
    location,
    locationDescription: constructionSite.locations?.[0]?.name,
    restrictions: constructionSite.payload.restrictions?.map((value) => value.description)
  };
};
