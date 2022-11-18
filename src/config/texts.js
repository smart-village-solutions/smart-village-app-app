import appJson from '../../app.json';

export const texts = {
  appIntro: {
    continue: 'Weiter'
  },
  augmentedReality: {
    arInfoScreen: {
      header: 'Was is AR?',
      loadingError:
        'Es gibt ein Problem mit der Verbindung. Bitte versuchen Sie es später noch einmal.',
      settingsButton: 'AR-Einstellungen'
    },
    arShowScreen: {
      backNavigationErrorOnScreenRecord:
        'Bitte beende die Videoaufzeichnung, bevor Sie zurückkehren.',
      objectLoadErrorAlert:
        'Beim Laden des 3D-Objekts ist ein Problem aufgetreten. Bitte versuchen Sie es erneut.',
      screenRecordingCompleted: 'Die Aufnahme wurde erfolgreich in Ihrer Galerie gespeichert.',
      viroRecordingError: {
        0: 'Bei der Bildschirmaufzeichnung ist ein Fehler aufgetreten.',
        1: 'Bitte erlauben Sie die Aufnahme von Videos/Screenshots.',
        2: 'Bei der Initialisierung der Bildschirmaufzeichnung ist ein Fehler aufgetreten.',
        3: 'Beim Speichern der Datei ist ein Fehler aufgetreten.',
        4: 'Ihr System zeichnet bereits auf.',
        5: 'Ihr System kann derzeit nicht aufzeichnen.'
      }
    },
    artworkDetailScreen: {
      downloadAndLookAtArt: 'Downloaden & AR Kunst gucken',
      lookAtArt: 'AR Kunst gucken',
      header: 'AR-Kunstwerk'
    },
    cancel: 'Abbrechen',
    filter: {
      mapView: 'Kartenansicht',
      listView: 'Listenansicht'
    },
    hide: 'Ausblenden',
    invalidModelError: 'Das 3D-Modell konnte nicht richtig geladen werden.',
    loadingArtworks: 'Kunstwerke laden',
    modalHiddenAlertMessage:
      'Das Herunterladen der Dateien ist noch im Gange. Bitte warten Sie, bis der Download komplett abgeschlossen ist, da ansonsten Probleme mit den heruntergeladenen Dateien auftreten können.',
    modalHiddenAlertTitle: 'Hinweis',
    ok: 'OK',
    wait: 'Warten',
    whatIsAugmentedReality: 'Was ist Augmented Reality (AR)?',
    worksOfArt: 'Kunstwerke'
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
    dataProvider: 'Datenquellenauswahl',
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
    collapse: 'Ausblenden',
    comment: 'Kommentar',
    commentAnswerButton: 'Antwort veröffentlichen',
    commentDeleteAlertBody:
      'Sind Sie sicher? Diese Aktion wird den Kommentar löschen. Das Löschen kann nicht rückgängig gemacht werden.',
    commentEmptyError: 'Sie können keine leeren Kommentare absenden.',
    commentLabel: 'Schreiben Sie einen Kommentar',
    comments: 'Kommentare',
    delete: 'Löschen',
    documents: 'Unterlagen',
    draft: 'Entwurf',
    email: 'E-Mail',
    emailError: 'E-Mail muss korrekt ausgefüllt werden',
    emailInvalid: 'E-Mail ungültig',
    errorLoadingUser: 'Beim Laden Ihrer Daten ist ein Fehler aufgetreten.',
    locationTitle: 'Lage',
    login: 'Anmelden',
    loginAllFieldsRequiredBody:
      'Damit die Anmeldung abgesendet werden kann, muss das Formular vollständig ausgefüllt sein.',
    loginAllFieldsRequiredTitle: 'Hinweis',
    loginFailedBody: 'Bitte Eingaben überprüfen und erneut versuchen.',
    loginFailedTitle: 'Fehler bei der Anmeldung',
    loginTitle: 'Anmelden',
    logoutAlertBody: 'Möchten Sie sich wirklich abmelden?',
    name: 'Benutzername',
    next: 'Weiter',
    noResponse: 'Keine Rückmeldung',
    noVotes: 'Keine Bewertungen',
    ok: 'OK',
    password: 'Passwort',
    passwordConfirmation: 'Passwort bestätigen',
    passwordDoNotMatch: 'Passwörter stimmen nicht überein',
    passwordError: 'Passwort muss ausgefüllt werden',
    passwordForgotten: 'Passwort vergessen',
    passwordLengthError: 'Das Passwort sollte mindestens 8 Zeichen lang sein',
    pollFinished: 'Diese Umfrage wurde beendet.',
    pollUserAnswer:
      'Sie haben bereits an der Umfrage teilgenommen. Falls Sie erneut abstimmen, wird Ihre Wahl überschrieben.',
    privacyChecked: 'Mit der Registrierung akzeptieren Sie die',
    privacyCheckLink: 'allgemeinen Nutzungsbedingungen',
    privacyCheckRequireBody: 'Bitte bestätigen Sie die Nutzungsvereinbarung.',
    privacyCheckRequireTitle: 'Hinweis',
    proposalAlready: 'Sie haben diesen Vorschlag bereits unterstützt.',
    publishProposalBold: 'Herzlichen Glückwunsch! Sie haben den ersten Schritt gemacht.\n',
    publishProposalButton: 'Vorschlag veröffentlichen',
    publishProposalRegular: 'Überprüfen und teilen Sie Ihren Vorschlag.\n',
    register: 'Registrieren',
    registrationFailedBody: 'Bitte Eingaben überprüfen und erneut versuchen.',
    registrationFailedTitle: 'Fehler bei der Registrierung',
    registrationPrivacyLink: 'Datenschutzerklärung.',
    registrationPrivacyText:
      'Ich bin damit einverstanden, dass meine Angaben gespeichert werden. Weitere Informationen unter:',
    registrationTitle: 'Registrieren',
    response: 'Rückmeldung',
    responses: 'Rückmeldungen',
    serverErrorAlertBody: 'Bitte versuchen Sie es später erneut.',
    serverErrorAlertTitle: 'Fehler',
    settingsButtonTitle: 'Einstellungen öffnen',
    show: 'Anzeigen',
    showPDF: 'PDF anzeigen',
    submittingCommentButton: 'Kommentar wird gesendet',
    support: 'Unterstützen',
    supportNeed: 'Unterstützungen benötigt',
    supportProposalAlertBody: 'Sie unterstützen nun diesen Vorschlag.',
    supportProposalAlertTitle: 'Erfolgreich',
    supports: 'Unterstützer*innen',
    tags: 'Stichworte',
    usernameError: 'Benutzername muss ausgefüllt werden',
    usernameOrEmailError: 'Benutzername oder E-Mail muss ausgefüllt werden',
    usernameOrEmail: 'Benutzername oder E-Mail',
    vote: 'Stimme',
    votes: 'Stimmen',
    startNew: {
      categoriesTitle: 'Kategorien',
      deleteAttributesAlertTitle: 'Hinweis',
      deleteAttributesButtonText: 'Löschen',
      descriptionShortError: 'ist zu kurz (minimum 10 Zeichen)',
      documentDeleteAlertBody:
        'Sind Sie sicher, dass Sie dieses Dokument löschen möchten? \n Diese Aktion kann nicht rückgängig gemacht werden!',
      documentSizeError: 'Das ausgewählte Dokument darf maximal 3 MB groß sein.',
      documentTypeAndSizeError:
        'Der ausgewählte Inhaltstyp wird leider nicht unterstützt. Es wird nur PDF akzeptiert. Das ausgewählte Dokument darf maximal 3 MB groß sein.',
      documentTypeError:
        'Der ausgewählte Inhaltstyp wird leider nicht unterstützt. Es wird nur PDF akzeptiert.',
      editButtonLabelOnDetailScreen: 'Bearbeiten',
      emptyError: 'darf nicht leer sein',
      generalDataUploadError:
        'Beim Hochladen des Fotos oder Dokuments ist ein Problem aufgetreten. Bitte überprüfen.',
      imageDeleteAlertBody: 'Möchten Sie das Bild löschen?',
      imageSizeError: 'Das ausgewählte Bild darf maximal 1 MB groß sein.',
      imageTypeAndSizeError:
        'Der ausgewählte Inhaltstyp wird leider nicht unterstützt. Es wird nur JPG akzeptiert. Das ausgewählte Bild darf maximal 1 MB groß sein.',
      imageTypeError:
        'Der ausgewählte Inhaltstyp wird leider nicht unterstützt. Es wird nur JPG akzeptiert.',
      newDebateDescriptionLabel: 'Initialer Debattenbeitrag',
      newDebateStartButtonLabel: 'Eine Diskussion starten',
      newDebateTagLabel: 'Trennen Sie die Tags mit einem Komma (,)',
      newDebateTitleLabel: 'Title der Diskussion',
      newProposalDocumentAddButtonTitle: 'Dokument hinzufügen',
      newProposalDocumentAddInfoText:
        'Sie können maximal 3 Dokumente des folgenden Inhalttyps hochladen: pdf, bis zu 3 MB pro Datei.',
      newProposalDocumentAddTitle: 'Dokumente',
      newProposalDescriptionLabel: 'Vorschlagstext',
      newProposalExternesVideoUrlLabel: 'Externe Video-URL',
      newProposalImageAddButtonTitle: 'Bild hinzufügen',
      newProposalImageAddInfoText:
        'Sie können ein Bild des folgenden Formats hochladen: jpg, bis zu 1 MB.',
      newProposalImageAddTitle: 'Aussagekräftiges Bild',
      newProposalStartButtonLabel: 'Vorschlag erstellen',
      newProposalSummaryLabel: 'Zusammenfassung Vorschlag',
      newProposalTagInfoLabel:
        'Diesen Vorschlag markieren. Sie können aus vorgeschlagenen Kategorien wählen oder Ihre eigenen hinzufügen.',
      newProposalTagLabel: 'Trennen Sie die Tags mit einem Komma (,)',
      newProposalTitleLabel: 'Titel des Vorschlages',
      proposalSummaryInfo: '(maximal 200 Zeichen)',
      proposalTagInfo:
        '(Diesen Vorschlag markieren. Sie können aus vorgeschlagenen Kategorien wählen oder Ihre eigenen hinzufügen.)',
      proposalVideoUrlInfo: '(Füge einen YouTube- oder Vimeo-Link hinzu)',
      tags: 'Tags',
      termsOfServiceLabel: 'Ich stimme den Datenschutzbestimmungen und den',
      termsOfServiceLinkLabel: 'allgemeinen Nutzungsbedingungen zu',
      titleShortError: 'ist zu kurz (minimum 4 Zeichen)',
      updateButtonDisabledLabel: 'Bitte warten...',
      updateButtonLabel: 'Speichern'
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
      voting: 'Abstimmungen'
    },
    sorting: {
      highestRated: 'Am besten bewertet',
      mostActive: 'Aktivste',
      newest: 'Neuste'
    },
    filter: {
      current: 'Offen',
      expired: 'Abgelaufen'
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
    consul: {
      debate: 'Diskussion',
      comment: 'Kommentar',
      poll: 'Abstimmung',
      proposal: 'Vorschlag'
    },
    eventRecord: 'Veranstaltung',
    newsItem: 'Nachricht',
    pointOfInterest: 'Ort',
    volunteer: {
      additional: 'Ganz praktisch',
      conversation: 'Unterhaltung',
      eventRecord: 'Veranstaltung',
      group: 'Gruppe/Verein',
      member: 'Mitglied',
      task: 'Aufgabe',
      user: 'Profil'
    },
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
    registrationTitle: 'Registrieren',
    saveChanges: 'Änderungen speichern',
    scanAgain: 'Erneut scannen',
    scannerSubTitle: 'Scanne den QR-Code deines Fahrers',
    scannerTitle: 'Neue Fahrt',
    status: 'Verifikationsstatus',
    supportId: 'Support-ID',
    toCategory: 'Zu den Mitfahrbänken',
    verified: 'Verifiziert'
  },
  empty: {
    categoryList:
      'Schade, es wurden keine passenden Einträge in dieser Kategorie gefunden. Bitte eine Unterkategorie wählen oder zu einem späteren Zeitpunkt erneut versuchen.',
    content:
      'Schade, es wurde kein passender Inhalt gefunden, bitte zu einem späteren Zeitpunkt erneut versuchen.',
    list: 'Schade, es wurden keine passenden Einträge gefunden, bitte zu einem späteren Zeitpunkt erneut versuchen.'
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
    filterByDailyEvents: 'Nur tagesaktuelle anzeigen',
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
  noticeboard: {
    emptyTitle: 'Im Moment gibt es nichts zu sehen. Bitte versuchen Sie es später noch einmal.',
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
    mapView: 'Kartenansicht',
    routePlanner: 'Routenplaner bbnavi',
    service: appJson.expo.name,
    settings: 'Einstellungen',
    survey: 'Umfrage',
    surveys: 'Umfragen',
    volunteer: {
      calendar: 'Mein Kalender',
      home: 'Ehrenamt',
      me: 'Persönliche Daten',
      groups: 'Meine Gruppen und Vereine',
      groupsFollowing: 'Gruppen und Vereine, denen ich folge',
      messages: 'Mein Postfach',
      personal: 'Mein Bereich',
      tasks: 'Meine Aufgaben'
    },
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
    onboarding: {
      onActivate: 'Beim nächsten Start wird die App-Einführung angezeigt.',
      onDeactivate: 'Die App-Einführung wird beim nächsten Start nicht angezeigt.',
      ok: 'Ok'
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
    arListLayouts: {
      alertTitle: 'Hinweis',
      allDeleteAlertMessage: 'Alle Dateien löschen?',
      allDeleteButtonTitle: 'Alle Dateien löschen',
      allDownloadAlertMessage: 'Möchten Sie alle Dateien herunterladen?',
      allDownloadButtonTitle: 'Alle Dateien herunterladen',
      arListTitle: 'Dateien verwalten',
      cancel: 'Abbrechen',
      continue: 'Weiter',
      deleteAlertButtonText: 'Löschen',
      deleteAlertMessage: 'Möchten Sie die Datei löschen?',
      deleteError:
        'Beim Löschen von Objekten ist ein Problem aufgetreten. Bitte versuchen Sie es erneut',
      downloadAlertButtonText: 'Herunterladen',
      freeMemoryPlace: 'Verfügbarer Speicherplatz auf dem Gerät: ',
      hide: 'Ausblenden',
      ok: 'OK'
    },
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
    onboarding: 'App-Einführung',
    pushNotifications: 'Push-Benachrichtigungen',
    tabs: {
      arSettings: 'AR-Einstellungen',
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
      pl: 'Twój komentarz zostanie teraz sprawdzony redakcyjnie i opublikowany tak szybko, jak to możliwe.'
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
      de: 'Die Umfrageergebnisse werden erst angezeigt, wenn Sie Ihre Stimme abgegeben haben oder die Umfrage beendet wurde.',
      pl: 'Wyniki ankiety nie będą wyświetlane, dopóki nie oddasz głosu lub ankieta nie zostanie zakończona.'
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
    volunteer: 'Ehrenamt',
    about: 'Mehr'
  },
  tour: {
    description: 'Beschreibung',
    end: 'Tourende',
    operatingCompany: 'Veranstalter',
    start: 'Tourbeginn',
    tour: 'Tourverlauf'
  },
  volunteer: {
    abort: 'Abbrechen',
    about: 'Über',
    aboutMe: 'Über mich',
    accept: 'Akzeptieren',
    accessionDirective: 'Beitritts-Richtlinie',
    addDocument: 'Dokument hinzufügen',
    addImage: 'Bild hinzufügen',
    admin: 'Administrator',
    applicants: 'Beitrittsanfragen',
    attend: 'Interessiert',
    attendInfo:
      'Wenn Sie Interesse an dieser Veranstaltung bekunden wird diese in den Kalender in Ihrem Bereich übernommen.\n',
    birthday: 'Geburtstag',
    calendar: 'Kalender',
    calendarMy: 'Mein Kalender',
    calendarNew: 'Termin erstellen',
    contactGroupOwner: 'Gruppenbesitzer kontaktieren',
    conversationAllStart: 'Unterhaltung mit allen beginnen',
    conversations: 'Mein Postfach',
    conversationStart: 'Unterhaltung beginnen',
    country: 'Land',
    city: 'Ort',
    description: 'Beschreibung',
    delete: 'Löschen',
    documentGreater10MBError: 'Das ausgewählte Dokument darf maximal 10 MB groß sein.',
    documents: 'Dokumente',
    edit: 'Daten bearbeiten',
    email: 'E-Mail',
    emailError: 'E-Mail muss korrekt ausgefüllt werden',
    emailInvalid: 'E-Mail ungültig',
    endDate: 'Enddatum',
    endTime: 'Endzeit',
    enterCode: 'Code eingeben',
    entranceFee: 'Eintrittspreis',
    errorLoadingUser: 'Beim Laden deiner Daten ist ein Fehler aufgetreten. Bitte erneut einloggen.',
    eventRecord: {
      appointments: 'Termine'
    },
    events: 'Veranstaltungen',
    facebook: 'Facebook',
    fax: 'Fax',
    firstname: 'Vorname',
    firstnameError: 'Vorname muss ausgefüllt werden',
    flickr: 'flickr',
    gender: 'Geschlecht',
    group: 'Gruppe/Verein',
    groups: 'Gruppen und Vereine',
    groupsMy: 'Meine Gruppen und Vereine',
    groupNew: 'Gruppe/Verein erstellen',
    imageGreater10MBError: 'Das ausgewählte Bild darf maximal 10 MB groß sein.',
    images: 'Aussagekäftiges Bild',
    invalidUrl: '-URL ist keine gültige URL',
    invalidMail: '-Addresse ist keine gültige E-Mail-Adresse.',
    invite: 'Jemanden einladen',
    join: {
      1: 'Beitrittsanfrage stellen',
      2: 'Beitreten'
    },
    lastname: 'Nachname',
    lastnameError: 'Nachname muss ausgefüllt werden',
    leave: 'Verlassen',
    linkedin: 'Linkedin',
    list: 'Liste',
    location: 'Ort',
    login: 'Anmelden',
    loginFailedBody: 'Bitte Eingaben überprüfen und erneut versuchen.',
    loginFailedTitle: 'Fehler bei der Anmeldung',
    loginTitle: 'Anmelden',
    mediaGreater10MBError: 'Das ausgewählte Medien darf maximal 10 MB groß sein.',
    member: 'Mitglied',
    members: 'Mitglieder',
    memberships: 'Mitgliedschaften',
    message: 'Nachricht',
    messageNew: 'Nachricht senden',
    moderator: 'Moderator',
    myProfile: 'Mein Profil',
    mySpace: 'MySpace',
    name: 'Name',
    next: 'Weiter',
    noGroups: 'Dir gehören keine Gruppen oder Vereine, in denen du Termine eintragen könntest.',
    noUsers: 'Es gibt keine Personen, denen du schreiben könntest.',
    notAttend: 'Nicht mehr interessiert',
    ok: 'OK',
    organizer: 'Veranstalter',
    owner: 'Inhaber',
    participants: 'Interessierte',
    participantInfo: 'Informationen für Interessierte',
    password: 'Passwort',
    passwordConfirmation: 'Passwort bestätigen',
    passwordDoNotMatch: 'Passwörter stimmen nicht überein',
    passwordError: 'Passwort muss ausgefüllt werden',
    passwordForgotten: 'Passwort vergessen',
    passwordLengthError: 'Das Passwort sollte mindestens 5 Zeichen lang sein',
    pending: 'Beitrittsanfrage ausstehend',
    phoneMobile: 'Mobile Nummer',
    phonePrivate: 'Privat Nummer',
    phoneWork: 'Arbeit Nummer',
    postalCode: 'Postleitzahl',
    postNew: 'Neuen Beitrag verfassen',
    posts: 'Beiträge',
    postsIndexLink: 'Alle Beiträge anzeigen',
    privacyChecked: 'Mit der Registrierung akzeptieren Sie die',
    privacyCheckLink: 'Datenschutzbestimmungen',
    privacyCheckRequireBody: 'Bitte bestätigen Sie die Datenschutzbestimmungen.',
    privacyCheckRequireTitle: 'Hinweis',
    recipient: 'Empfänger',
    register: 'Registrieren',
    registrationAllFieldsRequiredBody:
      'Damit die Registrierung abgesendet werden kann, muss das Formular vollständig ausgefüllt sein.',
    registrationAllFieldsRequiredTitle: 'Hinweis',
    registrationFailedBody: 'Bitte Eingaben überprüfen und erneut versuchen.',
    registrationFailedTitle: 'Fehler bei der Registrierung',
    registrationPrivacyLink: 'Datenschutzerklärung.',
    registrationPrivacyText:
      'Ich bin damit einverstanden, dass meine Angaben gespeichert werden. Weitere Informationen unter:',
    registrationTitle: 'Registrieren',
    reject: 'Ablehnen',
    requestPending:
      'Ihre Beitrittsanfrage wird schnellstmöglich vom Gruppenadministrator bearbeitet',
    save: 'Speichern',
    search: 'Suche',
    send: 'Senden',
    signupFailedBody: 'Bitte Eingaben überprüfen und erneut versuchen.',
    signupFailedTitle: 'Fehler bei der Registrierung',
    skype: 'Skype',
    startDate: 'Startdatum',
    startTime: 'Startzeit',
    state: 'Bundesland/Kanton',
    street: 'Straße',
    subject: 'Betreff',
    tags: 'Themen',
    title: 'Titel',
    token: 'Code',
    tokenError: 'Code muss ausgefüllt werden',
    topics: 'Themen',
    twitter: 'Twitter',
    username: 'Benutzername',
    usernameError: 'Benutzername muss ausgefüllt werden',
    usernameErrorLengthError: 'Der Benutzername sollte mindestens 4 Zeichen lang sein',
    usernameOrEmail: 'Benutzername oder E-Mail',
    vimeo: 'Vimeo',
    visibility: 'Sichtbarkeit',
    website: 'Home page',
    xing: 'xing',
    xmpp: 'xmpp',
    youtube: 'Youtube'
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
  waterTemperature: {
    headerTitle: 'Wassertemperatur'
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
    water: 'Wasser',
    weather: 'Wetter'
  }
};
