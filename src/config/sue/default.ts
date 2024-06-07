const apiDefaults = {
  apiKey: '',
  areaService: { apiKey: '', id: '', serverUrl: '' },
  jurisdictionId: '',
  serverUrl: '',
  testApi: { apiKey: '', jurisdictionId: '', serverUrl: '' },
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
  address: {
    city: false,
    street: false,
    zipCode: false
  },
  contact: {
    email: false,
    lastName: false,
    phone: false
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
  apiDefaults,
  geoMap: geoMapDefaults,
  limitation: limitationDefaults,
  limitOfArea: limitOfAreaDefaults,
  requiredFields: requiredFieldsDefaults,
  sueProgress: sueProgressDefaults
};
