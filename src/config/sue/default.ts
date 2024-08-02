const apiDefaults = {
  apiKey: '',
  areaService: { apiKey: '', id: '', serverUrl: '' },
  serverUrl: '',
  testApi: { apiKey: '', serverUrl: '' },
  whichApi: ''
};

const geoMapDefaults = {
  areas: [],
  center: {},
  clusterDistance: 80,
  clusterThreshold: 2,
  locationIsRequired: false,
  locationStreetIsRequired: false,
  minZoom: 11
};

const limitOfAreaDefaults = {
  city: '',
  errorMessage: '',
  zipCodes: []
};

const limitationDefaults = {
  allowedAttachmentTypes: {
    name: '',
    value: 'png,jpg,jpeg'
  },
  maxAttachmentSize: {
    name: '',
    value: '31457280'
  },
  maxFileUploads: {
    name: '',
    value: '5'
  },
  privacyPolicy: {
    name: '',
    value: 'https://smart-village.app/datenschutzerklaerung/'
  }
};

const requiredFieldsDefaults = {
  email: false,
  firstName: false,
  lastName: false,
  phone: false
};

const sueReportScreenDefaults = {
  showFeedbackSection: false,
  reportTerms: {
    termsOfService: {},
    termsOfUse: {}
  },
  reportSendDone: {
    subtitle: '',
    title: ''
  },
  reportSendLoading: {
    subtitle: '',
    title: ''
  }
};

const sueProgressDefaults = [
  {
    content: '',
    inputs: [],
    requiredInputs: [],
    subtitle: '',
    title: ''
  }
];

export const defaultSueAppConfig = {
  apiConfig: apiDefaults,
  geoMap: geoMapDefaults,
  limitation: limitationDefaults,
  limitOfArea: limitOfAreaDefaults,
  requiredFields: requiredFieldsDefaults,
  sueProgress: sueProgressDefaults,
  sueReportScreen: sueReportScreenDefaults
};
