import appJson from '../../app.json';

export const texts = {
  categoryList: {
    intro:
      'Enim veniam exercitation elit excepteur ullamco dolore nisi sit ad irure cillum ut velit nulla. Dolore ex consequat id ex magna amet nostrud tempor cupidatat laboris est voluptate.'
  },
  categoryTitles: {
    pointsOfInterest: 'Orte',
    tours: 'Touren'
  },
  eventRecord: {
    appointments: 'Termine',
    description: 'Beschreibung',
    operatingCompany: 'Veranstalter',
    prices: 'Preise'
  },
  homeTitles: {
    about: 'Über die App',
    events: 'Veranstaltungen',
    news: 'Nachrichten',
    pointsOfInterest: 'Touren und Orte',
    service: 'Service',
    company: 'Städtische Unternehmen'
  },
  navigationTitles: {
    home: 'Übersicht'
  },
  pointOfInterest: {
    description: 'Beschreibung',
    location: 'Anfahrt',
    openingTime: 'Öffnungszeiten',
    operatingCompany: 'Anbieter',
    prices: 'Preise'
  },
  screenTitles: {
    home: appJson.expo.name,
    service: appJson.expo.name,
    company: appJson.expo.name,
    about: appJson.expo.name
  },
  tabBarLabel: {
    home: 'Übersicht',
    service: 'Service',
    company: 'Unternehmen',
    about: 'Mehr'
  },
  tour: {
    tour: 'Tourverlauf',
    start: 'Tourbeginn',
    end: 'Tourende'
  }
};
