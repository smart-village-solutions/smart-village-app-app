/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { Button, SueReportLocation } from '../../src/components';
import { consts, texts } from '../../src/config';
import { ConfigurationsContext } from '../../src/ConfigurationsProvider';
import { readFromStore } from '../../src/helpers';
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
jest.mock('react-query', () => ({
  useQuery: () => ({}),
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
  required = true,
  area = true,
  position,
  confirmedLocationAddress
}: {
  step?: number;
  required?: boolean;
  area?: boolean;
  position?: typeof kielPosition;
  confirmedLocationAddress?: string;
} = {}) {
  (readFromStore as jest.Mock).mockResolvedValue({
    ...kiel,
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
    geoMap: { locationIsRequired: required, locationStreetIsRequired: required },
    limitOfArea: area ? { city: 'Kiel', postalCodes: ['24159'] } : {},
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

it.each(['pending', 'empty', 'error'])(
  'blocks submission with a required %s lookup',
  async (outcome) => {
    await openWizard({ step: 3, position: augsburgPosition });
    let finish: (() => void) | undefined;
    if (outcome === 'pending') {
      act(() => {
        finish = location().beginLocationUpdate().finish;
      });
    } else {
      if (outcome === 'empty') fetchSpy.mockResolvedValue(reply([]));
      else fetchSpy.mockRejectedValue(new Error('Offline'));
      await act(async () => expect(await location().resolveManualLocation()).toBe(false));
    }

    await act(async () => press(texts.sue.report.sendReport));
    expect(postRequests).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      alert.hint,
      outcome === 'pending' ? alert.locationPending : alert.locationUnconfirmed
    );
    finish?.();
  }
);

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
