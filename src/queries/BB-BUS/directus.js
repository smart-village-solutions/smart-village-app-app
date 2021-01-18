import gql from 'graphql-tag';

export const GET_TOP_10_IDS = gql`
  query PublicJsonFile {
    publicJsonFile(name: "bb-bus-top10") {
      content
    }
  }
`;

export const GET_DIRECTUS = gql`
  query Directus($query: String!) {
    directus(query: $query)
  }
`;

export const GET_SERVICES = ({ ids, areaId }) => {
  if (ids) {
    return {
      query: `
        service${ids ? `(filter: {id_in: "${ids}"})` : ''} {
          data {
            id
            name
          }
        }
      `
    };
  }

  return {
    query: `
      service(filter: {community_contains: "${areaId}"}) {
        data {
          id
          name
        }
      }
    `
  };
};

export const GET_SERVICE = (id) => ({
  query: `
    service(filter: {id_eq: ${id}}) {
      data {
        authorities {
          authority: authority_id {
            id: zfinder_id
            name
            addresses {
              address: address_id {
                street
                houseNumber: house_number
                zipcode: postal_code
                city
              }
            }
            communications {
              communication: communication_id {
                type {
                  id
                  key
                  name
                }
                value
              }
            }
            openingHours: opening_hours
            elevator
            wheelchairAccessible: wheelchair_accessible
          }
        }
        persons {
          person: person_id {
            id
            title
            firstName: first_name
            lastName: last_name
            department
            room
            position
            addresses {
              address: address_id {
                street
                houseNumber: house_number
                zipcode: postal_code
                city
              }
            }
            communications {
              communication: communication_id {
                type {
                  id
                  key
                  name
                }
                value
              }
            }
          }
        }
        textBlocks: text_blocks {
          textBlock: text_block_id {
            type {
              id: zfinder_id
              key
              name
              description
            }
            name
            text
            externalLinks: external_links {
              externalLink: link_id {
                name
                url
              }
            }
          }
        }
        forms {
          forms: form_id {
            name
            links {
              links: link_id {
                id
                name
                url
              }
            }
          }
        }
      }
    }
  `
});

export const GET_COMMUNITIES_AND_TOP_10 = ({ ids }) => {
  return {
    query: `
      community {
        data {
          id
          value: name
          areaId: zfinder_id
        }
      }
      service${ids ? `(filter: {id_in: "${ids}"})` : ''} {
        data {
          id
          name
        }
      }
    `
  };
};
