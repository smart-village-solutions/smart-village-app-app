import appJson from '../../app.json';

export const texts = {
  eventRecord: {
    prices: 'Preise',
    description: 'Beschreibung',
    openingTime: 'Termine',
    operatingCompany: 'Veranstalter'
  },
  homeTitles: {
    news: 'Nachrichten',
    pointsOfInterest: 'Orte und Touren',
    events: 'Veranstaltungen',
    service: 'Service',
    about: 'Über die App'
  },
  navigationTitles: {
    home: 'Übersicht'
  },
  pointOfInterest: {
    location: 'Anfahrt',
    openingTime: 'Öffnungszeiten',
    prices: 'Preise',
    description: 'Beschreibung',
    operatingCompany: 'Anbieter'
  },

  screenTitles: {
    home: appJson.expo.name
  }
};
