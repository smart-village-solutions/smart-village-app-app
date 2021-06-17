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
      agendaItems: 'Tagesordnungspunkte',
      auxiliaryFile: 'Dateianhänge',
      consultation: 'Beratung',
      isPublic: 'Ja',
      isNotPublic: 'Nein',
      license: 'Lizenz: ',
      meeting: 'Termin',
      name: 'Bezeichnung:',
      number: 'Tagesordnungsnr.:',
      public: 'Öffentlich:',
      resolutionFile: 'Beschluss (Datei)',
      resolutionText: 'Beschluss:',
      result: 'Ergebnis:'
    },
    body: {
      agendaItem: 'Tagesordnungspunkte',
      ags: 'Amtlicher Gemeindeschlüssel:',
      body: 'Körperschaft',
      classification: 'Art der Körperschaft:',
      consultation: 'Beratungen',
      equivalent: 'Siehe auch',
      file: 'Dateien',
      legislativeTerm: 'Wahlperioden',
      license: 'Lizenz: ',
      licenseValidSince: 'Lizenz gültig seit: ',
      location: 'Ort:',
      locationList: 'Orte',
      meeting: 'Sitzungen',
      memberships: 'Mitgliedschaften',
      name: 'Name:',
      oparlSince: 'Nutzt OParl seit: ',
      organization: 'Gruppierungen',
      paper: 'Drucksachen',
      person: 'Personen',
      rgs: 'Regionalschlüssel:',
      system: 'OParl System',
      website: 'Website: '
    },
    consultation: {
      agendaItem: 'Tagesordungspunkt',
      authoritative: 'Beschluss wird/wurde gefasst: ',
      consultation: 'Beratung',
      consultationLong: 'Beratung einer Drucksache',
      consultations: 'Beratungen',
      isAuthoritative: 'Ja',
      isNotAuthoritative: 'Nein',
      license: 'Lizenz: ',
      meeting: 'Sitzung',
      organization: 'Gremium',
      organizations: 'Gremien',
      paper: 'Drucksache',
      role: 'Rolle oder Funktion der Beratung: '
    },
    contactSection: {
      name: 'Name: ',
      email: 'Email: '
    },
    dateSection: {
      date: 'Datum:',
      ended: 'Endete am: ',
      ends: 'Endet am: ',
      started: 'Begann am: ',
      starts: 'Beginnt am: '
    },
    file: {
      accessUrl: 'Zugangs-URL: ',
      agendaItems: 'Tagesordnungspunkte',
      date: 'Datum:',
      derivativeFile: 'Abgeleitete Dateien',
      downloadUrl: 'Download-URL: ',
      externalServiceUrl: 'Externer-URL: ',
      file: 'Datei',
      fileLicense: 'Dateilizenz:',
      fileName: 'Dateiname:',
      files: 'Dateien',
      license: 'Lizenz: ',
      masterFile: 'Ursprungsdatei',
      meetings: 'Zugehörige Sitzungen',
      mimeType: 'Dateityp:',
      name: 'Bezeichnung:',
      sha1Checksum: 'SHA1-Prüfsumme: ',
      sha512Checksum: 'SHA512-Prüfsumme: ',
      size: 'Dateigröße:',
      text: 'Textrepräsentation:',
      urls: 'URLs'
    },
    keywords: 'Schlagworte: ',
    legislativeTerm: {
      license: 'Lizenz: ',
      name: 'Bezeichnung:',
      partOfBody: 'Körperschaft',
      legislativeTerm: 'Wahlperiode',
      legislativeTerms: 'Wahlperioden'
    },
    location: {
      bodies: 'Körperschaften',
      description: 'Beschreibung: ',
      license: 'Lizenz: ',
      locality: 'Ort:',
      location: 'Ort',
      locations: 'Orte',
      meeting: 'Sitzungen',
      organization: 'Gruppierungen',
      papers: 'Drucksachen',
      persons: 'Personen',
      postalCode: 'PLZ:',
      room: 'Raum:',
      streetAddress: 'Straße/Nr.:'
    },
    meeting: {
      agendaItem: 'Tagesordnungspunkte',
      auxiliaryFile: 'Dateianhänge',
      cancelled: 'Dieser Termin wurde abgesagt.',
      invitation: 'Einladung',
      license: 'Lizenz',
      location: 'Sitzungsort:',
      meeting: 'Sitzung',
      meetings: 'Sitzungen',
      meetingState: 'Status',
      name: 'Name:',
      organization: 'Gruppierungen',
      participant: 'Teilnehmer',
      resultsProtocol: 'Ergebnisprotokoll',
      verbatimProtocol: 'Wortprotokoll'
    },
    membership: {
      endDate: 'Ende:',
      hasNoVotingRight: 'Nein',
      hasVotingRight: 'Ja',
      license: 'Lizenz: ',
      membership: 'Mitgliedschaft',
      memberships: 'Mitgliedschaften',
      onBehalfOf: 'Vertritt:',
      organization: 'Gruppierung:',
      person: 'Person:',
      role: 'Rolle:',
      startDate: 'Beginn:',
      votingRight: 'Stimmrecht:'
    },
    modifiedSection: {
      created: 'Erstellt am: ',
      modified: 'Zuletzt bearbeitet am: ',
      deleted:
        'Dieses Dokument wurde als gelöscht markiert und enthält somit möglicherweise nicht mehr alle oder keine Daten.'
    },
    organization: {
      body: 'Körperschaft:',
      classification: 'Art:',
      consultation: 'Beratungen',
      endDate: 'Auflösung:',
      externalBody: 'Entspricht der Körperschaft',
      license: 'Lizenz: ',
      location: 'Ort:',
      meeting: 'Sitzungen',
      membership: 'Mitgliedschaften',
      name: 'Name:',
      organization: 'Gruppierung',
      organizations: 'Gruppierungen',
      organizationType: 'Kategorie:',
      post: 'Vorgesehene Positionen: ',
      startDate: 'Gründung:',
      subOrganizationOf: 'Untergruppierung von',
      website: 'Website: '
    },
    overview: {
      calendar: 'Termine',
      title: 'Rathausinfos',
      organizations: 'Organisationen',
      persons: 'Personen',
      search: 'Schlagwortsuche'
    },
    paper: {
      auxiliaryFile: 'Weitere Dateien',
      body: 'Körperschaft',
      consultation: 'Beratungen',
      date: 'Datum:',
      license: 'Lizenz: ',
      location: 'Orte',
      mainFile: 'Hauptdatei',
      name: 'Name:',
      originatorOrganization: 'Urheberorganizationen',
      originatorPerson: 'Urheber',
      paper: 'Drucksache',
      papers: 'Drucksachen',
      paperType: 'Art:',
      reference: 'Referenz:',
      relatedPaper: 'Inhaltich verwandt',
      subOrdinatedPaper: 'Untergeordnete Drucksachen',
      superOrdinatedPaper: 'Übergeordnete Drucksachen',
      underDirectionOf: 'Federführung'
    },
    personList: {
      chooseAnOrg: 'Organisation wählen'
    },
    person: {
      affix: 'Namenszusatz:',
      body: 'Körperschaft',
      email: 'Email:',
      faction: 'Fraktion:',
      familyName: 'Familienname:',
      formOfAddress: 'Anrede:',
      gender: 'Geschlecht:',
      givenName: 'Vorname:',
      license: 'Lizenz: ',
      life: 'Leben: ',
      lifeSource: 'Quelle zu Lebensangaben: ',
      location: 'Ort',
      membership: 'Mitgliedschaften',
      name: 'Name:',
      person: 'Person',
      persons: 'Personen',
      phone: 'Telefon:',
      status: 'Status:',
      title: 'Titel:'
    },
    search: {
      searchTerm: 'Suchbegriff eingeben'
    },
    system: {
      body: 'Körperschaften',
      license: 'Lizenz: ',
      name: 'Name:',
      oparlVersion: 'OParl Version:',
      otherOparlVersion: 'Andere OParl Versionen: ',
      product: 'Server Software: ',
      system: 'OParl System',
      vendor: 'Softwareanbieter: ',
      website: 'Website: '
    },
    webRepresentation: 'Webversion: '
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
    survey: 'Umfrage',
    surveys: 'Umfragen',
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
  survey: {
    archive: 'Umfrage-Archiv'
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
    exportAlertBody:
      'Ein Download wird in einem externen Browser gestartet.\nNachdem der Download abgeschlossen ist, können Sie die Termine durch Öffnen der Datei in Ihren Kalender importieren.',
    exportAlertTitle: 'Abfallkalender',
    exportCalendar: 'Kalender exportieren',
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
