const ONCE_A_DAY = 'ONCE_A_DAY';
const ONCE_PER_HOUR = 'ONCE_PER_HOUR';
const NEVER = 'NEVER';

export const consts = {
  a11yLabel: {
    address: '(Adresse)',
    appVersion: '(App-Version)',
    backIcon: 'Zurück (Taste)',
    backIconHint: 'Navigieren zurück zur vorherigen Seite',
    birthDate: 'Geburtsdatum',
    birthDateHint: 'Öffnet Datumsauswahl',
    bookmarkList: 'Lesezeichenliste (Taste)',
    bookmarkListHint: '(Zu der Lesezeichenliste hinzufügen)',
    button: '(Taste)',
    category: '(Kategorie)',
    changeImage: 'Bild ändern',
    closeMenuIcon: 'Schließen (Taste)',
    closeMenuHint: 'Menü schließen',
    encounterId: 'Identifikationsnummer',
    encounterIdInfo: 'Informationen zur Identifikationsnummer',
    fax: '(Fax)',
    firstName: 'Vorname',
    heading: '(Überschrift)',
    image: '(Bild)',
    imageCarousel: '(Bild des Bildkarussells)',
    infoProvider: 'Anbieterinformationen (Taste)',
    password: 'Kennwort',
    lastName: 'Nachname',
    link: '(Link)',
    lunch: 'Mittagstisch(Gerichtname)',
    mail: '(E-Mail-Adresse)',
    mailHint: '(Wechselt zur E-Mail-App)',
    mapHint: '(Wechselt zur Karten-App)',
    openMenuHint: 'Navigiert zum Menü',
    openMenuIcon: 'Menü (Taste)',
    phoneNumber: '(Telefonnummer)',
    phoneAppHint: '(Wechselt zur Telefon-App)',
    price: '(Preis)',
    privacy: 'Datenschutz',
    poiCount: '(Anzahl verfügbarer Einträge)',
    settingsIcon: 'Einstellungen (Taste)',
    settingsHint: 'Anpassen des Layouts von',
    settingsIconHint: 'Zu den Einstellungen wechseln',
    settingsBookmarksIcon: 'Einstellungen und Lesezeichen (Taste)',
    settingsBookmarksHint: 'Zu den Einstellungen und Lesezeichen wechseln',
    shareIcon: 'Teilen (Taste)',
    shareHint: 'Inhalte auf der Seite teilen',
    textInput: 'Texteingabe',
    username: 'Benutzername',
    verified: 'Verifiziert',
    verifiedInfo: 'Informationen zur Verifikation',
    website: '(Webseite)',
    webViewHint: '(Öffnet Webseite in der aktuellen App)'
  },
  POLL_INTERVALS: {
    WEATHER: 3600000
  },

  IMAGE_TYPE_REGEX: /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i,
  JPG_TYPE_REGEX: /\.jpe?g$/i,
  PDF_TYPE_REGEX: /\.pdf$/i,

  REFRESH_INTERVALS: {
    // refresh intervals per time:
    ONCE_A_DAY,
    ONCE_PER_HOUR,
    NEVER,
    // refresh intervals per type:
    BB_BUS: ONCE_A_DAY,
    BOOKMARKS: ONCE_A_DAY,
    EVENTS: ONCE_A_DAY,
    NEWS: ONCE_A_DAY,
    POINTS_OF_INTEREST: ONCE_A_DAY,
    STATIC_CONTENT: ONCE_A_DAY,
    TOURS: ONCE_A_DAY
  },

  DIMENSIONS: {
    // the max screen size we want to render full screen
    FULL_SCREEN_MAX_WIDTH: 414
  },

  // the image aspect ratio can be overwritten by a global setting `imageAspectRatio`
  // from the server in src/index.js
  IMAGE_ASPECT_RATIO: {
    // default image aspect ratio is 2:1
    HEIGHT: 1,
    WIDTH: 2
  },

  MATOMO_TRACKING: {
    SCREEN_VIEW: {
      BB_BUS: 'Bürger- und Unternehmensservice',
      BOOKMARK_CATEGORY: 'Bookmark category',
      BOOKMARKS: 'Bookmarks',
      COMMERCIAL_OFFER: 'Commercial offer',
      COMPANY: 'Company',
      CONSTRUCTION_SITE_DETAIL: 'Construction',
      CONSTRUCTION_SITES: 'Constructions',
      EVENT_RECORDS: 'Events',
      FEEDBACK: 'Feedback',
      HOME: 'Home',
      HTML: 'Content',
      JOB_OFFER: 'Job offer',
      MORE: 'More',
      LUNCH: 'Lunch',
      NEWS_ITEMS: 'News',
      POINTS_OF_INTEREST_AND_TOURS: 'Points of interest and tours',
      POINTS_OF_INTEREST: 'Points of interest',
      SERVICE: 'Service',
      SETTINGS: 'Settings',
      TOURS: 'Tours',
      WEATHER: 'Weather',
      WEB: 'Web'
    }
  },

  LIST_TYPES: {
    CARD_LIST: 'cardList',
    IMAGE_TEXT_LIST: 'imageTextList',
    TEXT_LIST: 'textList'
  },

  ROOT_ROUTE_NAMES: {
    COMMERCIALS: 'Commercials',
    EVENT_RECORDS: 'EventRecords',
    JOBS: 'Jobs',
    NEWS_ITEMS: 'NewsItems',
    POINTS_OF_INTEREST_AND_TOURS: 'PointsOfInterestAndTours',
    POINTS_OF_INTEREST: 'PointsOfInterest',
    TOURS: 'Tours',
    VOLUNTEER: 'Volunteer',
    CONSOLE_HOME: 'ConsulHome'
  }
};
