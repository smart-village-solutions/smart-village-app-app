const generateDummyWebUrls = (value) => {
  return {
    id: `web-1${value}`,
    url: `alf.fr${value}.ed`,
    description: `Der alfigste Fred! ${value}`
  };
};

const generateDummyContact = (value) => {
  return {
    id: `contact-1${value}`,
    firstName: `Alf${value}`,
    lastName: `Fred${value}`,
    phone: `0123-123123123${value}`,
    email: `alf@fr.ed${value}`,
    webUrls: [1, 2].map((index) => generateDummyWebUrls(`?suffix=${value}&index=${index}`))
  };
};

const generateDummyMediaContent = (value, type = 'image') => {
  return {
    id: `mediaContentId${value}`,
    contentType: type,
    sourceUrl: {
      id: `sU${value}`,
      url: 'https://cataas.com/cat'
    },
    captionText: `cat${value}`
  };
};

const generateDummyContentBlock = (value) => {
  return {
    id: `contentBlockId${value}`,
    body: `${value}Lorem ipsum dolor sit amet,
      consectetur adipiscing elit. Morbi posuere purus sed neque tincidunt interdum.
      Aliquam et libero nec tortor molestie tempus a mollis est. Integer nec leo nisi.
      Nunc tellus purus, ornare sed mauris id, vestibulum finibus ex. Quisque.`,
    mediaContents: [1, 2, 3].map((index) => generateDummyMediaContent(index))
  };
};

export const DummyOfferData = {
  id: '123123',
  createdAt: '2021-02-24 15:54:31 +0100',
  genericType: 'Job',
  title: 'Amazing Job Title',
  externalId: 'dummyExternalId-123',
  companies: [
    {
      id: 'c-11',
      name: 'company eleven',
      address: {
        id: 's-3',
        addition: 'add-add',
        street: 'Dummy-Str.',
        zip: '22222',
        city: 'Bad Dummytown',
        geoLocation: {
          id: 'geo-1',
          latitude: 52.520008,
          longitude: 13.404954
        }
      },
      contact: generateDummyContact('Uff')
    }
  ],
  contacts: [1, 2, 3].map((index) => generateDummyContact(index)),
  contentBlocks: [1].map((index) => generateDummyContentBlock(index)),
  mediaContents: [4, 5].map((index) =>
    generateDummyMediaContent(index, index % 2 ? 'image' : 'logo')
  ),
  dates: {
    id: 'datesId',
    dateEnd: '2021-03-24 15:54:31 +0100'
  },
  publicationDate: '2021-02-24 15:54:31 +0100',
  payload: {
    employmentType: 'Vollzeit, Remote'
  }
};
