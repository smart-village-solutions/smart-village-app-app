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
    bookmarksHint: 'Zu den Lesezeichen wechseln',
    bookmarksIcon: 'Lesezeichen (Taste)',
    buildNumber: '(Build-Nummer)',
    button: '(Taste)',
    calendarHint: 'Einen neuen Termin erstellen',
    calendarIcon: 'Neuer Termin (Taste)',
    category: '(Kategorie)',
    changeImage: 'Bild ändern',
    chatHint: 'Eine neue Unterhaltung beginnen',
    chatIcon: 'Neue Unterhaltung (Taste)',
    checkbox: '(Checkbox)',
    closeIcon: 'Schließen (Taste)',
    closeMenuHint: 'Menü schließen',
    closeMenuIcon: 'Schließen (Taste)',
    deleteHint: 'Die eingetragenen Meldungsinformationen löschen',
    deleteIcon: 'Löschen (Taste)',
    dropDownMenu: 'Dropdown-Menü (Taste)',
    dropDownMenuItem: 'Dropdown-Menü-Eintrag (Taste)',
    editHint: 'Diesen Eintrag bearbeiten',
    editIcon: 'Bearbeiten (Taste)',
    encounterId: 'Identifikationsnummer',
    encounterIdInfo: 'Informationen zur Identifikationsnummer',
    fax: '(Fax)',
    firstName: 'Vorname',
    groupHint: 'Eine neue Gruppe oder einen neuen Verein erstellen',
    groupIcon: 'Neue Gruppe/Verein (Taste)',
    heading: '(Überschrift)',
    image: '(Bild)',
    imageCarousel: '(Bild des Bildkarussells)',
    infoProvider: 'Anbieterinformationen (Taste)',
    lastName: 'Nachname',
    link: '(Link)',
    lunch: 'Mittagstisch(Gerichtname)',
    mail: '(E-Mail-Adresse)',
    mailHint: '(Wechselt zur E-Mail-App)',
    mapHint: '(Wechselt zur Karten-App)',
    informationIcon: 'Informationen (Taste)',
    informationHint: 'Zu den Informationen wechseln',
    openMenuHint: 'Navigiert zum Menü',
    openMenuIcon: 'Menü (Taste)',
    otaVersion: '(Over-The-Air-Version)',
    password: 'Kennwort',
    phoneAppHint: '(Wechselt zur Telefon-App)',
    phoneNumber: '(Telefonnummer)',
    poiCount: '(Anzahl verfügbarer Einträge)',
    price: '(Preis)',
    privacy: 'Datenschutz',
    required: '(Erforderlich)',
    searchHint: 'Nach Inhalten suchen',
    searchIcon: 'Suchen (Taste)',
    settingsHint: 'Anpassen des Layouts von',
    settingsIcon: 'Einstellungen (Taste)',
    settingsIconHint: 'Zu den Einstellungen wechseln',
    shareHint: 'Inhalte auf der Seite teilen',
    shareIcon: 'Teilen (Taste)',
    tabs: 'Tabs',
    textInput: 'Texteingabe',
    username: 'Benutzername',
    verified: 'Verifiziert',
    verifiedInfo: 'Informationen zur Verifikation',
    versionInfos: 'Versionshinweise',
    website: '(Webseite)',
    webViewHint: '(Öffnet Webseite in der aktuellen App)'
  },

  // e-mail regex found at https://emailregex.com
  EMAIL_REGEX:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  GUID_REGEX: /[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/g,
  HTML_REGEX: /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g,
  IMAGE_TYPE_REGEX: /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i,
  JPG_TYPE_REGEX: /\.jpe?g$/i,
  PDF_TYPE_REGEX: /\.pdf$/i,
  // url regex found at https://uibakery.io/regex-library/url
  URL_REGEX:
    /^https?:\/\/(?:www\.)?[-a-z0-9@:%._\+~#=]{1,256}\.[a-z0-9()]{1,6}\b(?:[-a-z0-9()@:%_\+.~#?&\/=]*)$/i,
  VIDEO_TYPE_REGEX: /\.(swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|mp4)$/i,
  UMLAUT_REGEX: /[üäöÜÄÖß]/g,
  PHONE_NUMBER_REGEX:
    /(((\+([0-9]+) )|0)([1-9][0-9]+)(( ([0-9]) ([0-9]+))| ([0-9]+)([-]([0-9]+))?))|([1-9][0-9][0-9])/,

  CALENDAR: {
    DOT_SIZE: 6,
    MAX_DOTS_PER_DAY: 5
  },

  POLL_INTERVALS: {
    WEATHER: 3600000
  },

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

  FILTER_TYPES: {
    CHECKBOX: 'checkbox',
    DATE: 'date',
    DROPDOWN: 'dropdown',
    SLIDER: 'slider',
    SUE: {
      STATUS: 'status'
    }
  },

  DIMENSIONS: {
    // the max screen size we want to render full screen
    FULL_SCREEN_MAX_WIDTH: 504
  },

  MEDIA_TYPES: {
    DOCUMENT: 'pdf',
    IMAGE: 'jpg'
  },

  // this section has been added to optimise AR on low RAM devices and to prevent some features of AR from being used
  GB_TO_BYTES: {
    1: 1073741824,
    2: 2147483648,
    3: 3221225472
  },

  MB_TO_BYTES: {
    1: 1048576,
    10: 10485760,
    20: 20971520,
    30: 31457280
  },

  IMAGE_SELECTOR_ERROR_TYPES: {
    CONSUL: 'Consul',
    NOTICEBOARD: 'Noticeboard',
    SUE: 'Sue',
    VOLUNTEER: 'Volunteer'
  },

  IMAGE_SELECTOR_TYPES: {
    NOTICEBOARD: 'Noticeboard',
    SUE: 'Sue',
    VOLUNTEER: 'Volunteer'
  },

  IMAGE_FROM: {
    CAMERA: 'Camera',
    GALLERY: 'Gallery'
  },

  // the image aspect ratio can be overwritten by a global setting `imageAspectRatio`
  // from the server in src/index.js
  IMAGE_ASPECT_RATIO: {
    // default image aspect ratio is 2:1
    HEIGHT: 1,
    WIDTH: 2
  },

  INPUT_KEYS: {
    SUE: {
      CITY: 'city',
      DESCRIPTION: 'description',
      EMAIL: 'email',
      FAMILY_NAME: 'familyName',
      FIRST_NAME: 'firstName',
      HOUSE_NUMBER: 'houseNumber',
      IMAGES: 'images',
      LAST_NAME: 'lastName',
      NAME: 'name',
      PHONE: 'phone',
      POSTAL_CODE: 'postalCode',
      STREET: 'street',
      TERMS_OF_SERVICE: 'termsOfService',
      TITLE: 'title'
    }
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
      DEADLINE: 'Deadline',
      DEFECT_REPORT: 'Defect report',
      EVENT_RECORDS: 'Events',
      FEEDBACK: 'Feedback',
      HOME: 'Home',
      HTML: 'Content',
      JOB_OFFER: 'Job offer',
      MORE: 'More',
      LUNCH: 'Lunch',
      NEWS_ITEMS: 'News',
      NOTICEBOARD: 'Noticeboard',
      PDF: 'PDF',
      POINTS_OF_INTEREST_AND_TOURS: 'Points of interest and tours',
      POINTS_OF_INTEREST: 'Points of interest',
      SERVICE: 'Service',
      SETTINGS: 'Settings',
      TOURS: 'Tours',
      WEATHER: 'Weather',
      WEB: 'Web'
    }
  },

  HOST_NAMES: {
    DETAIL: 'detail',
    ENCOUNTER: 'encounter'
  },

  LIST_TYPES: {
    CARD_LIST: 'cardList',
    CARD_TEXT_LIST: 'cardTextList',
    GROUPED_LIST: 'groupedList',
    IMAGE_TEXT_LIST: 'imageTextList',
    TEXT_LIST: 'textList'
  },

  ROOT_ROUTE_NAMES: {
    COMMERCIALS: 'Commercials',
    CONVERSATIONS: 'Conversations',
    DEADLINES: 'Deadlines',
    DEFECT_REPORT: 'DefectReport',
    EVENT_RECORDS: 'EventRecords',
    JOBS: 'Jobs',
    NEWS_ITEMS: 'NewsItems',
    NOTICEBOARD: 'Noticeboard',
    POINTS_OF_INTEREST_AND_TOURS: 'PointsOfInterestAndTours',
    POINTS_OF_INTEREST: 'PointsOfInterest',
    SUE: 'Sue',
    TOURS: 'Tours',
    VOUCHER: 'Voucher',
    VOLUNTEER: 'Volunteer',
    CONSOLE_HOME: 'ConsulHome'
  }
};
