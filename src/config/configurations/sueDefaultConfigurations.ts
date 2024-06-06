const defaultApiConfig = {
  apiKey: '',
  areaService: { apiKey: '', id: '', serverUrl: '' },
  jurisdictionId: '',
  serverUrl: '',
  testApi: { apiKey: '', jurisdictionId: '', serverUrl: '' },
  whichApi: ''
};

const geoMapDefaultConfig = {
  areas: [],
  center: {},
  clisterTreshold: 2,
  clusterDistance: 80,
  locationIsRequired: false,
  locationStreetIsRequired: false,
  minZoom: 11
};

const defaultLimitOfAreaConfig = {
  city: '',
  errorMessage: '',
  zipCodes: []
};

const limitationDefaultConfig = {
  allowedAttachmentTypes: {
    name: '',
    value: ''
  },
  maxAttachmentSize: {
    name: '',
    value: ''
  },
  maxFileUploads: {
    name: '',
    value: ''
  },
  privacyPolicy: {
    name: '',
    value: ''
  }
};

const defaultRequiredFieldsConfig = {
  address: {
    city: false,
    postalCode: false,
    street: false
  },
  contact: {
    email: false,
    familyName: true,
    phone: false
  }
};

export const defaultSueAppConfig = {
  apiConfig: defaultApiConfig,
  geoMap: geoMapDefaultConfig,
  limitation: limitationDefaultConfig,
  limitOfArea: defaultLimitOfAreaConfig,
  requiredFields: defaultRequiredFieldsConfig
};
