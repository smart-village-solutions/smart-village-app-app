/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { Button, SueReportDescription, SueReportLocation } from '../../src/components';
import { consts, texts } from '../../src/config';
import { ConfigurationsContext } from '../../src/ConfigurationsProvider';
import { addToStore, readFromStore } from '../../src/helpers';
import { getSueAddressKey } from '../../src/helpers/sueReportLocation';
import { postRequests } from '../../src/queries/SUE';
import { SueReportScreen } from '../../src/screens/SUE/SueReportScreen';

jest.mock('expo-screen-orientation', () => ({ OrientationLock: {}, lockAsync: jest.fn() }));
jest.mock('react-native-elements', () => ({ Divider: () => null }));
jest.mock('../../src/ConfigurationsProvider', () => ({
  ConfigurationsContext: require('react').createContext({})
}));
jest.mock('../../src/components', () => {
  const react = require('react');
  return Object.fromEntries(
    [
      'BoldText',
      'Button',
      'DefaultKeyboardAvoidingView',
      'HeaderRight',
      'HtmlView',
      'LoadingContainer',
      'SafeAreaViewFlex',
      'SueReportDescription',
      'SueReportLocation',
      'SueReportProgress',
      'SueReportSend',
      'SueReportServices',
      'SueReportUser',
      'Wrapper'
    ].map((name) => [name, ({ children, ...props }) => react.createElement(name, props, children)])
  );
});
jest.mock('../../src/config', () => ({
  consts: jest.requireActual('../../src/config/consts').consts,
  texts: jest.requireActual('../../src/config/texts').texts,
  SUE_REPORT_VALUES: 'sueReportValues',
  device: { width: 390 },
  normalize: (value: number) => value
}));
jest.mock('../../src/helpers', () => ({
  addToStore: jest.fn(async () => undefined),
  readFromStore: jest.fn(),
  getSueLimitOfAreaCity: ({ configuredCity }) => configuredCity || ''
}));
jest.mock('../../src/hooks', () => ({ useKeyboardHeight: () => 0 }));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/hooks/useThemeStyles', () => ({
  useThemeStyles: (createStyles) => createStyles()
}));
jest.mock('../../src/queries', () => ({ QUERY_TYPES: { SUE: {} }, getQuery: jest.fn() }));
jest.mock('../../src/queries/SUE', () => ({ postRequests: jest.fn(async () => undefined) }));
let mockAreaLoading = false;
let mockServicePostcodes: string[] | undefined;
jest.mock('react-query', () => ({
  useQuery: () => ({
    isLoading: mockAreaLoading,
    data: mockServicePostcodes && { postalCodes: mockServicePostcodes }
  }),
  useMutation: (post) => ({ mutateAsync: post })
}));

const kiel = { street: 'Koloniestraße', houseNumber: '2', postalCode: '24159', city: 'Kiel' };
const kielPosition = { latitude: 54.3911114, longitude: 10.1736416 };
const augsburgPosition = { latitude: 48.3415792, longitude: 10.8650444 };
const kielHit = {
  address: {
    road: kiel.street,
    house_number: kiel.houseNumber,
    postcode: kiel.postalCode,
    city: kiel.city
  },
  lat: String(kielPosition.latitude),
  lon: String(kielPosition.longitude)
};
const augsburgHit = {
  address: { ...kielHit.address, postcode: '86199', city: 'Augsburg' },
  lat: String(augsburgPosition.latitude),
  lon: String(augsburgPosition.longitude)
};
const navigation = { addListener: () => jest.fn(), setOptions: jest.fn() };
const reply = (hits: unknown[]) => ({ ok: true, json: async () => hits } as Response);
const alert = texts.sue.report.alerts;
let tree: renderer.ReactTestRenderer;
let fetchSpy: jest.SpyInstance;

async function openWizard({
  step = 2,
  areaId = '',
  required = true,
  streetRequired = required,
  area = true,
  limitOfArea = area ? { city: 'Kiel', postalCodes: ['24159'] } : {},
  address = kiel,
  position,
  confirmedLocationAddress
}: {
  step?: number;
  areaId?: string;
  required?: boolean;
  streetRequired?: boolean;
  area?: boolean;
  limitOfArea?: { city?: string; postalCodes?: string[]; zipCodes?: string[] };
  address?: typeof kiel;
  position?: typeof kielPosition;
  confirmedLocationAddress?: string;
} = {}) {
  (readFromStore as jest.Mock).mockResolvedValue({
    ...address,
    currentProgress: step,
    images: '[]',
    firstName: 'Erika',
    lastName: 'Mustermann',
    selectedPosition: position,
    confirmedLocationAddress,
    service: { serviceCode: 'fixture' },
    termsOfService: true
  });
  const sueConfig = {
    geoMap: {
      areas: areaId ? [{ id: areaId }] : [],
      locationIsRequired: required,
      locationStreetIsRequired: streetRequired
    },
    limitOfArea,
    sueProgress: ['category', 'description', 'location', 'user'].map((content) => ({
      content,
      inputs:
        content === 'location'
          ? Object.values(consts.INPUT_KEYS.SUE).filter((field) => field in kiel)
          : []
    }))
  };
  await act(async () => {
    tree = renderer.create(
      <ConfigurationsContext.Provider value={{ refetch: jest.fn(), sueConfig } as never}>
        <SueReportScreen navigation={navigation as never} route={{ key: 'fixture' } as never} />
      </ConfigurationsContext.Provider>
    );
  });
}

function press(title: string) {
  return tree.root
    .findAllByType(Button)
    .find((button) => button.props.title === title)
    ?.props.onPress();
}

function location() {
  return tree.root.findByType(SueReportLocation).props;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAreaLoading = false;
  mockServicePostcodes = undefined;
  fetchSpy = jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Unexpected fetch'));
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(() => {
  if (tree) act(() => tree.unmount());
  jest.restoreAllMocks();
});

it.each([true, false])(
  'uses a matching Kiel result for the POST even when Augsburg is listed first (area: %s)',
  async (area) => {
    await openWizard({ area });
    fetchSpy.mockResolvedValue(reply([augsburgHit, kielHit]));
    await act(async () => press(texts.sue.report.next));
    await act(async () => press(texts.sue.report.sendReport));
    expect(postRequests).toHaveBeenCalledWith(
      expect.objectContaining({
        addressString: 'Koloniestraße; 2; 24159; Kiel',
        firstName: 'Erika',
        lastName: 'Mustermann',
        lat: kielPosition.latitude,
        long: kielPosition.longitude
      }),
      expect.any(Object)
    );
  }
);

it('keeps a later map selection when an older manual result arrives', async () => {
  await openWizard();
  let resolve: (response: Response) => void;
  fetchSpy.mockImplementationOnce(() => new Promise((complete) => (resolve = complete)));
  let lookup: Promise<boolean | undefined>;
  act(() => {
    lookup = location().resolveManualLocation();
    const map = location().beginLocationUpdate();
    location().setValue('street', 'Confirmed map street');
    location().setSelectedPosition(kielPosition);
    map.finish();
  });
  await act(async () => {
    resolve(reply([kielHit]));
    expect(await lookup).toBeUndefined();
  });
  await act(async () => press(texts.sue.report.next));
  await act(async () => press(texts.sue.report.sendReport));

  expect(postRequests).toHaveBeenCalledWith(
    expect.objectContaining({
      addressString: 'Confirmed map street; 2; 24159; Kiel',
      lat: kielPosition.latitude
    }),
    expect.any(Object)
  );
});

it('blocks submission while a location request is pending', async () => {
  await openWizard({ step: 3, position: augsburgPosition });
  const request = location().beginLocationUpdate();
  await act(async () => press(texts.sue.report.sendReport));
  expect(postRequests).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith(alert.hint, alert.locationPending);
  request.finish();
});

it.each(['empty', 'error'])('omits unconfirmed coordinates after an %s result', async (outcome) => {
  await openWizard({ step: 3, position: augsburgPosition });
  if (outcome === 'empty') fetchSpy.mockResolvedValue(reply([]));
  else fetchSpy.mockRejectedValue(new Error('Offline'));
  await act(async () => expect(await location().resolveManualLocation()).toBe(false));
  await act(async () => press(texts.sue.report.sendReport));

  expect(postRequests).toHaveBeenCalledWith(
    expect.objectContaining({ lat: undefined, long: undefined }),
    expect.any(Object)
  );
});

it('discards legacy draft coordinates for an optional address without an area restriction', async () => {
  await openWizard({ step: 3, required: false, area: false, position: augsburgPosition });
  await act(async () => press(texts.sue.report.sendReport));
  expect(postRequests).toHaveBeenCalledWith(
    expect.objectContaining({
      addressString: 'Koloniestraße; 2; 24159; Kiel',
      lat: undefined,
      long: undefined
    }),
    expect.any(Object)
  );
});

it('restores coordinates from a draft with a matching confirmed address', async () => {
  await openWizard({
    step: 3,
    position: kielPosition,
    confirmedLocationAddress: getSueAddressKey(kiel)
  });
  await act(async () => press(texts.sue.report.sendReport));
  expect(postRequests).toHaveBeenCalledWith(
    expect.objectContaining({ lat: kielPosition.latitude, long: kielPosition.longitude }),
    expect.any(Object)
  );
});

it('encodes the address and ignores a manual response after another edit', async () => {
  await openWizard();
  let resolve: (response: Response) => void;
  fetchSpy.mockImplementationOnce(() => new Promise((complete) => (resolve = complete)));
  let lookup: Promise<boolean | undefined>;
  act(() => {
    location().setValue('houseNumber', '2#');
    lookup = location().resolveManualLocation();
    location().invalidateLocation();
    location().setValue('houseNumber', '2');
  });

  const params = new URL(fetchSpy.mock.calls[0][0]).searchParams;
  expect(params.get('street')).toBe('Koloniestraße 2#');
  expect(params.get('city')).toBe('Kiel');
  expect(params.get('postalcode')).toBe('24159');
  fetchSpy.mockResolvedValue(reply([kielHit]));
  await act(async () => press(texts.sue.report.next));
  await act(async () => {
    resolve(reply([augsburgHit]));
    expect(await lookup).toBeUndefined();
  });
  await act(async () => press(texts.sue.report.sendReport));
  expect(postRequests).toHaveBeenCalledWith(
    expect.objectContaining({ lat: kielPosition.latitude, long: kielPosition.longitude }),
    expect.any(Object)
  );
});

it('checks the configured area at submit even when resuming on the final step', async () => {
  await openWizard({ step: 3, required: false });
  act(() => {
    location().setValue('city', 'Augsburg');
    location().setValue('postalCode', '86199');
  });
  await act(async () => press(texts.sue.report.sendReport));

  expect(fetchSpy).not.toHaveBeenCalled();
  expect(postRequests).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith(alert.hint, alert.limitOfArea('Kiel'));
});

it('previews the confirmed incident pin at its original coordinates', async () => {
  const position = { latitude: 54.3912114, longitude: 10.1737416 };
  await openWizard({ position, confirmedLocationAddress: getSueAddressKey(kiel) });
  fetchSpy.mockResolvedValue(reply([kielHit]));
  const previousPosition = location().selectedPosition;
  await act(async () => expect(await location().resolveManualLocation()).toBe(true));
  expect(location().selectedPosition).toEqual(position);
  expect(location().selectedPosition).not.toBe(previousPosition);
  expect(fetchSpy).not.toHaveBeenCalled();

  await act(async () => press(texts.sue.report.next));
  await act(async () => press(texts.sue.report.sendReport));
  expect(postRequests).toHaveBeenCalledWith(
    expect.objectContaining({ lat: position.latitude, long: position.longitude }),
    expect.any(Object)
  );
});

it.each([
  {
    required: true,
    streetRequired: false,
    address: { ...kiel, street: '', houseNumber: '' },
    text: '; ; 24159; Kiel'
  },
  {
    required: false,
    streetRequired: true,
    address: { ...kiel, postalCode: '', city: '' },
    text: 'Koloniestraße; 2; ; '
  }
])(
  'accepts an address that meets the configured field requirements',
  async ({ text, ...options }) => {
    await openWizard(options);
    await act(async () => press(texts.sue.report.next));
    await act(async () => press(texts.sue.report.sendReport));
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(postRequests).toHaveBeenCalledWith(
      expect.objectContaining({ addressString: text, lat: undefined, long: undefined }),
      expect.any(Object)
    );
  }
);

it.each(['headers', 'body'])(
  'continues without coordinates when the provider stalls on %s',
  async (stall) => {
    jest.useFakeTimers();
    try {
      await openWizard({ required: false, position: augsburgPosition });
      const noResponse = new Promise<never>(() => {});
      if (stall === 'headers') fetchSpy.mockReturnValue(noResponse);
      else fetchSpy.mockResolvedValue({ ok: true, json: () => noResponse });
      act(() => {
        void press(texts.sue.report.next);
      });
      await act(async () => jest.advanceTimersByTimeAsync(15_000));

      expect(fetchSpy.mock.calls[0][1]?.signal?.aborted).toBe(true);
      await act(async () => press(texts.sue.report.sendReport));
      expect(postRequests).toHaveBeenCalledWith(
        expect.objectContaining({
          addressString: 'Koloniestraße; 2; 24159; Kiel',
          lat: undefined,
          long: undefined
        }),
        expect.any(Object)
      );
    } finally {
      jest.useRealTimers();
    }
  }
);

it('honors a legacy tenant postcode list without a configured city or area service', async () => {
  await openWizard({
    step: 3,
    required: false,
    limitOfArea: { zipCodes: ['24159'] },
    address: { ...kiel, city: 'Augsburg', postalCode: '86199' }
  });
  await act(async () => press(texts.sue.report.sendReport));

  expect(postRequests).not.toHaveBeenCalled();
  expect(fetchSpy).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith(alert.hint, expect.any(String));
});

it('matches a district in the suburb field when street, number and postcode match', async () => {
  await openWizard({ address: { ...kiel, city: 'Friedrichsort' } });
  fetchSpy.mockResolvedValue(
    reply([
      { ...augsburgHit, address: { ...augsburgHit.address, suburb: 'Friedrichsort' } },
      { ...kielHit, address: { ...kielHit.address, suburb: 'Friedrichsort' } }
    ])
  );
  await act(async () => press(texts.sue.report.next));
  await act(async () => press(texts.sue.report.sendReport));

  expect(postRequests).toHaveBeenCalledWith(
    expect.objectContaining({
      addressString: 'Koloniestraße; 2; 24159; Friedrichsort',
      lat: kielPosition.latitude,
      long: kielPosition.longitude
    }),
    expect.any(Object)
  );
});

it.each(['KIEL', 'Kiel  '])(
  'keeps the precise confirmed pin for an equivalent address edit (%s)',
  async (city) => {
    await openWizard({ position: kielPosition, confirmedLocationAddress: getSueAddressKey(kiel) });
    const request = location().beginLocationUpdate();
    act(() => {
      location().invalidateLocation({ city });
      location().setValue('city', city);
    });
    expect(request.isLatestRequest()).toBe(false);
    expect(location().selectedPosition).toEqual(kielPosition);

    await act(async () => press(texts.sue.report.next));
    await act(async () => press(texts.sue.report.sendReport));
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(postRequests).toHaveBeenCalledWith(
      expect.objectContaining({ lat: kielPosition.latitude, long: kielPosition.longitude }),
      expect.any(Object)
    );
  }
);

it('drops coordinates for a meaningful address edit', async () => {
  await openWizard({ position: kielPosition, confirmedLocationAddress: getSueAddressKey(kiel) });
  act(() => {
    location().invalidateLocation({ houseNumber: '3' });
    location().setValue('houseNumber', '3');
  });
  expect(location().selectedPosition).toBeUndefined();
});

it.each([{ postalCodes: ['24159'] }, { zipCodes: ['24159'] }])(
  'uses configured postcodes while an area-service request is pending (%j)',
  async (limitOfArea) => {
    mockAreaLoading = true;
    await openWizard({ areaId: 'fixture', limitOfArea, step: 3 });
    expect(location().areaServiceData).toEqual({ postalCodes: ['24159'] });
    await act(async () => press(texts.sue.report.sendReport));
    expect(postRequests).toHaveBeenCalled();
  }
);

it('persists the confirmed pin while a different location lookup is pending', async () => {
  await openWizard({
    step: 1,
    position: kielPosition,
    confirmedLocationAddress: getSueAddressKey(kiel)
  });
  const request = location().beginLocationUpdate();
  await act(async () => tree.root.findByType(SueReportDescription).props.storeReportValues());
  expect(addToStore).toHaveBeenLastCalledWith(
    'sueReportValues',
    expect.objectContaining({
      selectedPosition: kielPosition,
      confirmedLocationAddress: getSueAddressKey(kiel)
    })
  );
  request.finish();
});

it('preserves the old location when returning from a pending map lookup', async () => {
  await openWizard({ position: kielPosition, confirmedLocationAddress: getSueAddressKey(kiel) });
  const request = location().beginLocationUpdate();
  await act(async () => press(texts.sue.report.back));
  expect(request.isLatestRequest()).toBe(false);
  expect(location().selectedPosition).toEqual(kielPosition);
  expect(addToStore).toHaveBeenLastCalledWith(
    'sueReportValues',
    expect.objectContaining({
      selectedPosition: kielPosition,
      confirmedLocationAddress: getSueAddressKey(kiel)
    })
  );
});

it('keeps a confirmed pin in a draft saved while a photo lookup is pending', async () => {
  await openWizard({
    step: 1,
    position: kielPosition,
    confirmedLocationAddress: getSueAddressKey(kiel)
  });
  const request = location().beginLocationUpdate();
  await act(async () => tree.root.findByType(SueReportDescription).props.storeReportValues());
  expect(addToStore).toHaveBeenCalledWith(
    'sueReportValues',
    expect.objectContaining({
      selectedPosition: kielPosition,
      confirmedLocationAddress: getSueAddressKey(kiel)
    })
  );
  request.finish();
});

it.each(['postalCodes', 'zipCodes'] as const)(
  'uses configured %s while an area-id lookup is still loading',
  async (key) => {
    mockAreaLoading = true;
    await openWizard({ step: 3, areaId: 'configured-area', limitOfArea: { [key]: ['24159'] } });
    expect(tree.root.findByType(SueReportLocation)).toBeDefined();
    await act(async () => press(texts.sue.report.sendReport));
    expect(postRequests).toHaveBeenCalledWith(
      expect.objectContaining({ addressString: 'Koloniestraße; 2; 24159; Kiel' }),
      expect.any(Object)
    );
  }
);

it.each([true, false])(
  'keeps explicit tenant postcodes authoritative before and after the area result (pending: %s)',
  async (pending) => {
    mockAreaLoading = pending;
    mockServicePostcodes = pending ? undefined : ['86199'];
    await openWizard({ step: 3, areaId: 'configured', limitOfArea: { postalCodes: ['24159'] } });
    expect(location().areaServiceData).toEqual({ postalCodes: ['24159'] });
    await act(async () => press(texts.sue.report.sendReport));
    expect(postRequests).toHaveBeenCalled();
  }
);

it('uses the area service restrictions when no explicit tenant list exists', async () => {
  mockServicePostcodes = ['86199'];
  await openWizard({ step: 3, areaId: 'configured', limitOfArea: {} });
  await act(async () => press(texts.sue.report.sendReport));
  expect(postRequests).not.toHaveBeenCalled();
});
