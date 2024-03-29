import gql from 'graphql-tag';

export const GET_CONSTRUCTION_SITES = gql`
  query GenericItems($ids: [ID]) {
    constructionSites: genericItems(ids: $ids, genericType: "ConstructionSite") {
      id
      title
      contentBlocks {
        id
        body
      }
      categories {
        id
        name
      }
      locations {
        id
        name
        geoLocation {
          latitude
          longitude
        }
      }
      mediaContents {
        id
        captionText
        contentType
        copyright
        sourceUrl {
          id
          url
        }
      }
      dates {
        id
        dateEnd
        dateStart
      }
      payload
    }
  }
`;
