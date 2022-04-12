import appJson from '../../app.json';

export const texts = {
  appIntro: {
    continue: 'Weiter'
  },
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
  consul: {
    abort: 'Abbrechen',
    answer: 'Antwort',
    collapse: 'Kollaps',
    comment: 'Kommentar',
    commentAnswerButton: 'Antwort Veröffentlichen',
    commentDeleteAlertBody:
      'Sind Sie sicher? Diese Aktion wird den Kommentar löschen. Das Löschen kann nicht rückgängig gemacht werden.',
    commentEmptyError: 'Sie können keine leeren Kommentare posten.',
    commentLabel: 'Schreiben Sie einen Kommentar',
    comments: 'Kommentare',
    delete: 'Löschen',
    email: 'E-Mail',
    emailError: 'E-Mail muss ausgefüllt werden',
    emailInvalid: 'E-Mail ungültig',
    errorLoadingUser: 'Beim Laden deiner Daten ist ein Fehler aufgetreten.',
    locationTitle: 'Lage',
    login: 'Anmelden',
    loginAllFieldsRequiredBody:
      'Damit die Anmeldung abgesendet werden kann, muss das Formular vollständig ausgefüllt sein.',
    loginAllFieldsRequiredTitle: 'Hinweis',
    loginFailedBody: 'Bei der Anmeldung ist ein Fehler aufgetreten.',
    loginFailedTitle: 'Fehler',
    loginTitle: 'Anmelden',
    name: 'Name',
    next: 'Weiter',
    noReturn: 'Keine Rückmeldung',
    noVotes: 'Keine Bewertungen',
    noVoting: 'Keine Bewertung',
    ok: 'OK',
    password: 'Passwort',
    passwordConfirmation: 'Passwort bestätigen',
    passwordConfirmationError: 'Passwortbestätigungsfehler',
    passwordDoNotMatch: 'Passwort stimmt nicht überein',
    passwordError: 'Passwort muss ausgefüllt werden',
    passwordForgotten: 'Passwort vergessen',
    passwordLengthError: 'Das Passwort sollte mindestens 8 Zeichen lang sein',
    pollFinished: 'Diese Umfrage wurde beendet.',
    pollUserAnswer:
      'Sie haben bereits an der Umfrage teilgenommen. Falls Sie erneut abstimmen, wird Ihre Wahl überschrieben.',
    privacyChecked: 'Mit der Registrierung akzeptieren Sie die',
    privacyCheckLink: 'Allgemeine Nutzungsbedingungen',
    privacyCheckRequireBody: 'Kreuzen Sie die Nutzungsvereinbarung an.',
    privacyCheckRequireTitle: 'Hinweis',
    proposalAlready: 'Sie haben diesen Vorschlag bereits unterstützt.',
    publishProposalBold: 'Herzlichen Glückwunsch! Sie haben den ersten Schritt gemacht.',
    publishProposalButton: 'Vorschlag veröffentlichen',
    publishProposalRegular: 'überprüfen und teilen Sie Ihren Vorschlag.',
    register: 'Registrieren',
    registrationFailedBody: 'Bei der Registrierung ist ein Fehler aufgetreten.',
    registrationFailedTitle: 'Fehler',
    registrationPrivacyLink: 'Datenschutzerklärung.',
    registrationPrivacyText:
      'Ich bin damit einverstanden, dass meine Angaben gespeichert werden. Weitere Informationen unter:',
    registrationTitle: 'Registrieren',
    resetPasswordEmptyEmailBody:
      'Bitte stellen Sie sicher, dass Sie Ihre E-Mail-Adresse korrekt eingegeben haben.',
    resetPasswordFailedBody: 'Benutzer wurde nicht gefunden oder war nicht angemeldet.',
    resetPasswordFailedTitle: 'Fehler',
    resetPasswordSuccessBody:
      'Sie erhalten in wenigen Minuten eine E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts.',
    resetPasswordSuccessTitle: 'Erfolgreich',
    return: 'Rückmeldung',
    show: 'Anzeigen',
    showPDF: 'PDF anzeigen',
    submittingCommentButton: 'Kommentar abgeben',
    supportNeed: 'Unterstützungen benötigt',
    supportProposalAlertBody: 'Sie haben diesen Vorschlag bereits unterstützt.',
    supportProposalAlertTitle: 'Erfolgreich',
    supports: 'Unterstützer*innen',
    tags: 'Stichworte',
    usernameError: 'Username muss ausgefüllt werden',
    usernameOrEmail: 'Benutzername oder E-Mail',
    votes: 'Stimmen',
    startNew: {
      descriptionShortError: 'ist zu kurz (minimum 10 Zeichen)',
      leerError: 'darf nicht leer sein',
      newDebateDescriptionLabel: 'Initialer Debattenbeitrag',
      newDebateStartButtonLabel: 'Eine Diskussion starten',
      newDebateTagLabel: 'Trennen Sie die Tags mit einem Komma (,)',
      newDebateTitleLabel: 'Title der Diskussion',
      newProposalDescriptionLabel: 'Vorschlagstext',
      newProposalExternesVideoUrlLabel: 'Externes Video URL',
      newProposalStartButtonLabel: 'Vorschlag erstellen',
      newProposalSummaryLabel: 'Zusammenfassung Vorschlag',
      newProposalTagInfoLabel:
        'Diesen Vorschlag markieren. Sie können aus vorgeschlagenen Kategorien wählen, oder Ihre eigenen hinzufügen',
      newProposalTagLabel: 'Trennen Sie die Tags mit einem Komma (,)',
      newProposalTitleLabel: 'Titel des Vorschlages',
      proposalSummaryInfo: '(maximal 200 Zeichen)',
      proposalTagInfo:
        '(Diesen Vorschlag markieren. Sie können aus vorgeschlagenen Kategorien wählen, oder Ihre eigenen hinzufügen)',
      proposalVideoUrlInfo: '(Füge einen YouTube oder Vimeo Link hinzu)',
      tags: 'Tags',
      termsOfServiceLabel: 'Ich stimme der Datenschutzbestimmungen und den',
      termsOfServiceLinkLabel: 'Allgemeine Nutzungsbedingungen zu',
      titleShortError: 'ist zu kurz (minimum 4 Zeichen)',
      updateButtonLabel: 'Bearbeiten'
    },
    homeScreen: {
      account: 'Konto',
      debates: 'Diskussionen',
      general: 'Allgemein',
      logout: 'Ausloggen',
      myComments: 'Meine Kommentare',
      myDebates: 'Meine Diskussionen',
      myProposals: 'Meine Vorschläge',
      personal: 'Persönlich',
      proposals: 'Vorschläge',
      settings: 'Einstellungen',
      voting: 'Abstimmung'
    },
    sorting: {
      current: 'Offen',
      expired: 'Abgelaufen',
      highestRated: 'Am besten bewertet',
      mostActive: 'Aktivste',
      newest: 'Neuste'
    }
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
  encounter: {
    birthDate: 'Geburtsdatum',
    cameraPermissionMissing:
      'Zum Scannen eines QR-Codes wird die Berechtigung benötigt, die Kamera zu nutzen.',
    changeErrorBody: 'Beim Speichern der Änderungen ist ein Fehler aufgetreten!',
    changeSuccessBody: 'Das Speichern der Änderungen war erfolgreich!',
    changeSuccessTitle: 'Erfolg',
    changeWarningAbort: 'Abbrechen',
    changeWarningBody: 'Wenn die Daten geändert werden, wird deine Verifizierung aufgehoben!',
    changeWarningOk: 'Trotzdem ändern',
    changeWarningTitle: 'Achtung',
    dataTitle: 'Meine Daten',
    encounterId: 'Fahrten-ID',
    errorLoadingUser: 'Beim Laden deiner Daten ist ein Fehler aufgetreten.',
    errorScanBody: 'Beim Scannen des QR-Codes ist ein Fehler aufgetreten.',
    firstName: 'Vorname',
    history: 'Fahrthistorie',
    homeTitle: 'Hello, Welcome, Bienvenu',
    lastName: 'Name',
    myData: 'Meine Daten & Fahrthistorie',
    newEncounter: 'Neue Fahrt',
    newEncounterSuccess: 'Eine neue Fahrt wurde erfolgreich angelegt.',
    noHistoryYet: 'Es gibt noch keine Fahrthistorie, du bist noch nicht gefahren.',
    notVerified: 'Nicht verifiziert',
    phone: 'Telefonnummer',
    photoPlaceholder: { first: 'Foto', second: 'hochladen' },
    profilePhoto: 'Profilfoto',
    register: 'Registrieren',
    registerNow: 'Zur Registrierung',
    registrationAllFieldsRequiredBody:
      'Damit die Registrierung abgesendet werden kann, muss das Formular vollständig ausgefüllt sein.',
    registrationAllFieldsRequiredTitle: 'Hinweis',
    registrationFailedBody: 'Bei der Registrierung ist ein Fehler aufgetreten.',
    registrationFailedTitle: 'Fehler',
    registrationHint: 'Bitte gib deine persönlichen Daten an:',
    registrationPrivacyLink: 'Datenschutzerklärung.',
    registrationPrivacyText:
      'Ich bin damit einverstanden, dass meine Angaben gespeichert werden. Weitere Informationen unter:',
    registrationTitle: 'Registrierung',
    saveChanges: 'Änderungen speichern',
    scanAgain: 'Erneut scannen',
    scannerSubTitle: 'Scanne den QR-Code deines Fahrers',
    scannerTitle: 'Neue Fahrt',
    status: 'Verifikationsstatus',
    supportId: 'Support-ID',
    toCategory: 'Zu den Mitfahrbänken',
    verified: 'Verifiziert'
  },
  errors: {
    image: {
      body: 'Es fehlt die Berechtigung Bilder aus der Medienbibliothek auszuwählen.',
      title: 'Hinweis'
    },
    errorTitle: 'Fehler',
    noData: 'Bitte überprüfen Sie Ihre Internetverbindung.',
    unexpected: 'Es ist ein unerwarteter Fehler aufgetreten.'
  },
  eventRecord: {
    appointments: 'Termine',
    description: 'Beschreibung',
    operatingCompany: 'Veranstalter',
    prices: 'Preise'
  },
  feedbackLink: 'Feedback',
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
  job: {
    employmentType: 'Art der Anstellung: ',
    job: 'Stellenanzeige',
    jobs: 'Stellenanzeigen'
  },
  locationOverview: {
    list: 'Listenansicht',
    map: 'Kartenansicht',
    noSelection: 'Bitte wählen Sie eine Markierung aus.'
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
  placeholder: {
    homeSectionButton: 'Filter ändern',
    homeSectionTitle: (title) => `Keine ${title} vorhanden.`,
    homeSectionSubtitle: 'Hast Du alle Quellen abgewählt?'
  },
  pointOfInterest: {
    description: 'Beschreibung',
    filterByOpeningTime: 'Nur aktuell geöffnete anzeigen',
    location: 'Anfahrt',
    openingTime: 'Öffnungszeiten',
    operatingCompany: 'Anbieter',
    prices: 'Preise',
    routePlanner: 'Zum Routenplaner bbnavi',
    showLunches: 'Zum aktuellen Gastro-Angebot',
    yourPosition: 'Ihre Position'
  },
  pushNotifications: {
    abort: 'Abbrechen',
    approve: 'Jetzt einschalten',
    permissionMissingBody: 'Bitte überprüfen Sie Ihre Benachrichtigungseinstellungen im System.',
    permissionMissingTitle: 'Hinweis',
    permissionRequiredBody:
      'Diese Funktion benötigt die Berechtigung Ihnen Benachrichtigungen zu schicken.'
  },
  screenTitles: {
    about: appJson.expo.name,
    appSettings: 'App-Einstellungen',
    company: appJson.expo.name,
    constructionSite: 'Baustelle',
    consul: {
      login: 'Anmelden',
      register: 'Registrieren',
      home: 'Consul'
    },
    encounterHome: 'Mitfahrbank',
    feedback: 'Feedback',
    home: appJson.expo.name,
    routePlanner: 'Routenplaner bbnavi',
    service: appJson.expo.name,
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
      onActivateWithoutRestart:
        'Soll Matomo Analytics aktiviert werden? Dies trägt zur Verbesserung der App bei.',
      onDeactivate:
        'Soll Matomo Analytics deaktiviert werden? Die Deaktivierung von Matomo Analytics wird mit dem nächsten Neustart der App wirksam.',
      yes: 'Ja'
    },
    locationService: {
      abort: 'Abbrechen',
      alternativePositionHint:
        'Wenn Ortungsdienste deaktiviert sind, wird stattdessen der alternative Standort verwendet.',
      chooseAlternateLocationButton: 'Alternativen Standort wählen',
      onSystemPermissionMissing:
        'Um diese Einstellung zu aktivieren muss zunächst die Berechtigung für Ortungsdienste in den Systemeinstellungen erteilt werden.',
      save: 'Speichern',
      sectionHeader: 'Standort'
    },
    permanentFilter: {
      sectionHeader: 'Datenquellen'
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
    locationService: 'Ortungsdienste',
    pushNotifications: 'Push-Benachrichtigungen',
    tabs: {
      general: 'Allgemein',
      listTypes: 'App-Aussehen'
    }
  },
  survey: {
    archive: 'Umfrage-Archiv',
    answerLabelPrefix: {
      de: 'Antwort',
      pl: 'Odpowiedź'
    },
    changeAnswer: {
      de: 'Antwort ändern',
      pl: 'Zmień odpowiedź'
    },
    comments: {
      de: 'Kommentare',
      pl: 'Komentarze'
    },
    commentSubmissionAlert: {
      de: 'Ihr Kommentar wird nun redaktionell geprüft und schnellstmöglich veröffentlicht.',
      pl:
        'Twój komentarz zostanie teraz sprawdzony redakcyjnie i opublikowany tak szybko, jak to możliwe.'
    },
    commentSubmissionAlertTitle: 'Ihr Kommentar wird nun redaktionell geprüft',
    dateEnd: {
      de: 'Abschluss der Umfrage:',
      pl: 'Wypełnienie ankiety:'
    },
    dateStart: {
      de: 'Start der Umfrage:',
      pl: 'Rozpocznij ankietę:'
    },
    errors: {
      submissionBody:
        'Beim Abgeben der Stimme ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
      submissionTitle: 'Fehler'
    },
    hint: {
      de:
        'Die Umfrageergebnisse werden erst angezeigt, wenn Sie Ihre Stimme abgegeben haben oder die Umfrage beendet wurde.',
      pl:
        'Wyniki ankiety nie będą wyświetlane, dopóki nie oddasz głosu lub ankieta nie zostanie zakończona.'
    },
    multiSelectPossible: {
      de: 'Mehrfachantwort möglich.',
      pl: 'Możliwych jest wiele odpowiedzi.'
    },
    result: {
      de: 'Ergebnis',
      pl: 'Wynik'
    },
    submitAnswer: {
      de: 'Antwort senden',
      pl: 'Wyślij odpowiedź'
    },
    submitComment: {
      de: 'Kommentar senden',
      pl: 'Wyślij komentarz'
    }
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
    surveys: 'Umfragen',
    weather: 'Wetter'
  }
};
