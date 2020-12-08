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
  homeButtons: {
    events: 'Alle Veranstaltungen anzeigen',
    news: 'Alle Nachrichten anzeigen',
    pointsOfInterest: 'Alle Touren und Orte anzeigen'
  },
  homeTitles: {
    about: 'Über die App',
    events: 'Veranstaltungen',
    pointsOfInterest: 'Touren und Orte',
    service: 'Service',
    company: 'Städtische Unternehmen'
  },
  homeCategoriesNews: {
    categoryTitle: 'Nachrichten',
    categoryTitleDetail: 'Nachricht'
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
  pushNotifications: {
    approve: 'Jetzt einschalten',
    decline: 'Vielleicht später',
    greetingBody:
      'Damit Sie wichtige Mitteilungen aus Ihrer Kommune erreichen, würden wir Ihnen gerne Benachrichtigungen schicken. Sie können diese Einstellung jederzeit in Ihrem persönlichen Bereich ändern.',
    greetingTitle: 'Willkommen',
    permissionMissingBody: 'Bitte überprüfe deine Benachrichtigungseinstellungen im System.',
    permissionMissingTitle: 'Hinweis'
  },
  screenTitles: {
    home: appJson.expo.name,
    service: appJson.expo.name,
    company: appJson.expo.name,
    about: appJson.expo.name,
    settings: 'Einstellungen'
  },
  settingsContents: {
    analytics: {
      no: 'Nein',
      onActivate:
        'Soll Matomo Analytics aktiviert werden? Dies trägt zur Verbesserung der App bei. Matomo Analytics wird nach der Aktivierung mit dem nächsten Neustart der App wirksam.',
      onDeactivate:
        'Soll Matomo Analytics deaktiviert werden? Die Deaktivierung von Matomo Analytics wird mit dem nächsten Neustart der App wirksam.',
      yes: 'Ja'
    }
  },
  settingsScreen: {
    intro: ''
  },
  settingsTitles: {
    analytics: 'Matomo Analytics',
    listLayouts: {
      cardList: 'Liste mit großen Bildern',
      eventRecordsTitle: 'Veranstaltungen',
      imageTextList: 'Liste mit kleinen Bildern',
      newsItemsTitle: 'Nachrichten',
      pointsOfInterestAndToursTitle: 'Touren und Orte',
      sectionTitle: 'Listen-Layouts',
      textList: 'Textliste'
    },
    pushNotifications: 'Push-Benachrichtigungen'
  },
  tabBarLabel: {
    home: 'Übersicht',
    service: 'Service',
    company: 'Unternehmen',
    about: 'Mehr'
  },
  tour: {
    description: 'Beschreibung',
    end: 'Tourende',
    operatingCompany: 'Veranstalter',
    start: 'Tourbeginn',
    tour: 'Tourverlauf'
  },
  categoryFilter: {
    dataProvider: 'Datenquelle',
    category: 'Kategorie'
  }
};
