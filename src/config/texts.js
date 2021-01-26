import appJson from '../../app.json';

export const texts = {
  backToTop: 'zurück nach oben',
  bbBus: {
    authority: {
      elevator: 'Aufzug vorhanden',
      openingTime: 'Öffnungszeiten',
      wheelchairAccessible: 'Rollstuhlgerecht'
    },
    categoryFilter: {
      label: 'Lebenslage'
    },
    employees: 'Ansprechpartner',
    initialFilter: {
      aToZ: 'A-Z',
      top10: 'Meistgesucht',
      search: 'Suche'
    },
    locationFilter: {
      label: 'Ort',
      searchPlaceholder: 'Suche'
    },
    textSearch: {
      label: 'Dienstleistung',
      placeholder: 'Was suchen Sie?'
    }
  },
  bookmarks: {
    bookmarks: 'Lesezeichen',
    noBookmarksinCategory:
      'In dieser Kategorie wurden noch keine Einträge für die Lesezeichenliste markiert. Sobald etwas markiert wurde, wird es hier zu finden sein!',
    noBookmarksYet:
      'Es wurden noch keine Beiträge, Orte oder Touren für die Lesezeichenliste markiert. Sobald etwas markiert wurde, wird es hier zu finden sein!',
    showAll: 'Alle anzeigen'
  },
  categoryFilter: {
    dataProvider: 'Datenquelle',
    category: 'Kategorie'
  },
  categoryList: {
    intro: ''
  },
  categoryTitles: {
    pointsOfInterest: 'Orte',
    tours: 'Touren'
  },
  commercial: {
    commercial: 'Angebot',
    commercials: 'Angebote'
  },
  constructionSites: {
    noInformationGiven: 'Derzeit sind zu keinen Baustellen Informationen vorhanden.'
  },
  dataProvider: {
    more: 'Mehr von',
    partner: 'Partner',
    showAll: 'Alle anzeigen'
  },
  dateTimePicker: {
    cancel: 'Abbrechen',
    ok: 'Ok'
  },
  detailTitles: {
    eventRecord: 'Veranstaltung',
    newsItem: 'Nachricht',
    pointOfInterest: 'Ort',
    tour: 'Tour'
  },
  errors: {
    noData: 'Bitte überprüfen Sie Ihre Internetverbindung.',
    unexpected: 'Es ist ein unerwarteter Fehler aufgetreten.'
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
    pointsOfInterest: 'Alle Orte und Touren anzeigen'
  },
  homeTitles: {
    about: 'Über die App',
    company: 'Städtische Unternehmen',
    events: 'Veranstaltungen',
    pointsOfInterest: 'Orte und Touren',
    service: 'Service'
  },
  homeCategoriesNews: {
    categoryTitle: 'Nachrichten',
    categoryTitleDetail: 'Nachricht'
  },
  locationOverview: {
    noSelection: 'Bitte wählen Sie eine Markierung aus.'
  },
  job: {
    employmentType: 'Art der Anstellung: ',
    job: 'Stellenanzeige',
    jobs: 'Stellenanzeigen'
  },
  lunch: {
    noOffers: 'Für dieses Datum sind derzeit keine Gerichte verfügbar.',
    showAll: 'Alle Gastro-Angebote anzeigen'
  },
  map: {
    noGeoLocations: 'Zu den angegebenen Orten gibt es leider keine Geodaten.'
  },
  navigationTitles: {
    home: 'Übersicht'
  },
  oparl: {
    agendaItem: {
      agendaItem: 'Tagesordnungspunkt',
      auxiliaryFile: 'Dateianhänge: ',
      consultation: 'Beratung: ',
      isPublic: 'Ja',
      isNotPublic: 'Nein',
      meeting: 'Teil folgender Sitzung: ',
      name: 'Bezeichnung: ',
      number: 'Tagesordnungsnummer: ',
      public: 'Öffentlich: ',
      resolutionFile: 'Beschluss (Datei): ',
      resolutionText: 'Beschluss: ',
      result: 'Ergebnis: '
    },
    body: {
      ags: 'Amtlicher Gemeindeschlüssel: ',
      body: 'Körperschaft',
      classification: 'Art der Körperschaft: ',
      equivalent: 'Siehe auch: ',
      legislativeTerm: 'Wahlperioden',
      license: 'Lizenz: ',
      licenseValidSince: 'Lizenz gültig seit: ',
      location: 'Ort: ',
      meeting: 'Sitzungen: ',
      name: 'Name: ',
      oparlSince: 'Nutzt OParl seit: ',
      organization: 'Gruppierungen: ',
      paper: 'Drucksachen: ',
      person: 'Personen: ',
      rgs: 'Regionalschlüssel: ',
      system: 'OParl System: ',
      website: 'Website: '
    },
    consultation: {
      agendaItem: 'Tagesordungspunkt: ',
      authoritative: 'Beschluss wird/wurde gefasst: ',
      consultation: 'Beratung',
      consultationLong: 'Beratung einer Drucksache',
      isAuthoritative: 'Ja',
      isNotAuthoritative: 'Nein',
      meeting: 'Sitzung: ',
      organization: 'Gremium',
      organizations: 'Gremien',
      paper: 'Drucksache: ',
      role: 'Rolle oder Funktion der Beratung: '
    },
    contactSection: {
      name: 'Name: ',
      email: 'Email: '
    },
    dateSection: {
      ended: 'Endete am: ',
      ends: 'Endet am: ',
      started: 'Begann am: ',
      starts: 'Beginnt am: '
    },
    file: {
      accessUrl: 'Zugangs-URL: ',
      agendaItems: 'Zugehörige Tagesordnungspunkte: ',
      date: 'Assoziiertes Datum: ',
      derivativeFile: 'Abgeleitete Dateien: ',
      downloadUrl: 'Download-URL: ',
      externalServiceUrl: 'Externer-URL: ',
      license: 'Lizens: ',
      masterFile: 'Ursprungsdatei: ',
      meetings: 'Zugehörige Sitzungen: ',
      mimeType: 'Dateityp: ',
      name: 'Name: ',
      sha1Checksum: 'SHA1-Prüfsumme: ',
      size: 'Dateigröße',
      text: 'Textrepräsentation: '
    },
    keywords: 'Schlüsselworte: ',
    legislativeTerm: {
      name: 'Bezeichnung: ',
      partOfBody: 'Körperschaft: ',
      title: 'Wahlperiode'
    },
    location: {
      location: 'Ort'
    },
    meeting: {
      agendaItem: 'Tagesordnungspunkte: ',
      auxiliaryFile: 'Dateianhänge: ',
      cancelled: 'Diese Sitzung wurde abgesagt.',
      invitation: 'Einladung: ',
      location: 'Sitzungsort: ',
      meeting: 'Sitzung',
      meetingState: 'Status: ',
      name: 'Name: ',
      organization: 'Gruppierungen: ',
      participant: 'Teilnehmer: ',
      resultsProtocol: 'Ergebnisprotokoll: ',
      verbatimProtocol: 'Wortprotokoll: '
    },
    modifiedSection: {
      created: 'Erstellt am: ',
      modified: 'Zuletzt bearbeitet am: ',
      deleted:
        'Dieses Dokument wurde als gelöscht markiert und enthält somit möglicherweise nicht mehr alle oder keine Daten.'
    },
    organization: {
      organization: 'Organisation: '
    },
    paper: {
      paper: 'Drucksache'
    },
    person: {
      person: 'Person: '
    },
    system: {
      body: 'Körperschaften: ',
      license: 'Lizens: ',
      name: 'Name: ',
      oparlVersion: 'OParl Version: ',
      otherOparlVersion: 'Andere OParl Versionen: ',
      product: 'Server Software: ',
      system: 'OParl System',
      vendor: 'Softwareanbieter: ',
      website: 'Website: '
    },
    webRepresentation: 'Webversion dieses Dokuments: '
  },
  pointOfInterest: {
    description: 'Beschreibung',
    location: 'Anfahrt',
    openingTime: 'Öffnungszeiten',
    operatingCompany: 'Anbieter',
    prices: 'Preise',
    showLunches: 'Zum aktuellen Gastro-Angebot'
  },
  pushNotifications: {
    abort: 'Abbrechen',
    approve: 'Jetzt einschalten',
    decline: 'Vielleicht später',
    greetingBody:
      'Damit Sie wichtige Mitteilungen aus Ihrer Kommune erreichen, würden wir Ihnen gerne Benachrichtigungen schicken. Sie können diese Einstellung jederzeit in Ihrem persönlichen Bereich ändern.',
    greetingTitle: 'Willkommen',
    permissionMissingBody: 'Bitte überprüfen Sie Ihre Benachrichtigungseinstellungen im System.',
    permissionMissingTitle: 'Hinweis',
    permissionRequiredBody:
      'Diese Funktion benötigt die Berechtigung Ihnen Benachrichtigungen zu schicken.'
  },
  screenTitles: {
    home: appJson.expo.name,
    service: appJson.expo.name,
    company: appJson.expo.name,
    about: appJson.expo.name,
    constructionSite: 'Baustelle',
    settings: 'Einstellungen',
    wasteCollection: 'Abfallkalender',
    weather: 'Wetter'
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
      pointsOfInterestAndToursTitle: 'Orte und Touren',
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
  tmb: {
    notice:
      '<p><br /><em>Dies ist ein Service der TMB Tourismus-Marketing Brandenburg GmbH und der regionalen Tourismuspartner. Mehr Informationen zu Reisen und Ausflügen ins Land Brandenburg erhalten sie auf <a href="https://www.reiseland-brandenburg.de" title="www.reiseland-brandenburg.de"><em>www.reiseland-brandenburg.de</em></a></em></p>'
  },
  tour: {
    description: 'Beschreibung',
    end: 'Tourende',
    operatingCompany: 'Veranstalter',
    start: 'Tourbeginn',
    tour: 'Tourverlauf'
  },
  wasteCalendar: {
    configureReminder: 'Erinnerungen einstellen',
    errorOnUpdateBody: 'Beim Aktualisieren Ihrer Einstellungen ist ein Fehler aufgetreten.',
    errorOnUpdateTitle: 'Fehler',
    hint: 'Bitte geben Sie Ihre Straße an.',
    onDayBeforeCollection: 'Am Vortag',
    onDayOfCollection: 'Am Tag der Abholung',
    reminder: 'Erinnerungen',
    reminderTime: 'Zu welcher Uhrzeit möchten Sie benachrichtigt werden?',
    unableToLoad:
      'Beim Laden Ihrer Einstellungen ist ein Fehler aufgetreten. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    updateReminderSettings: 'Änderungen speichern',
    updateSuccess: 'Die Einstellungen wurden erfolgreich gespeichert.',
    whichDay: 'Möchten Sie am Vortag oder am Tag der Abholung benachrichtigt werden?',
    whichType: 'Für welche Müllsorten möchten Sie Erinnerungen?'
  },
  weather: {
    alertsHeadline: 'Wetterwarnungen',
    currentHeadline: 'Aktuelles Wetter',
    nextDaysHeadline: 'Wetter der nächsten Tage',
    noData:
      'Beim Abrufen der Daten ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.'
  },
  widgets: {
    constructionSites: 'Baustellen',
    events: 'Events',
    lunch: 'Gastro',
    weather: 'Wetter'
  }
};
