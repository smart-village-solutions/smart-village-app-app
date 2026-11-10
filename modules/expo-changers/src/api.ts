import type { Capabilities, ChangersNative } from './types';

const ERROR_CODES = new Set([
  'E_SIMULATOR_UNSUPPORTED',
  'E_DISABLED',
  'E_STORAGE',
  'E_CONFIGURATION',
  'E_NOT_ACTIVE',
  'E_NOT_READY',
  'E_BUSY',
  'E_AUTHENTICATION',
  'E_REGISTRATION_UNCERTAIN',
  'E_ALREADY_AUTHENTICATED',
  'E_INVALID_ARGUMENT',
  'E_NETWORK',
  'E_TIMEOUT',
  'E_PROVIDER',
  'E_UNSUPPORTED',
  'E_NO_ACTIVITY'
]);
export class ChangersError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'ChangersError';
  }
}
export function maskUUID(uuid: string | null): string {
  if (!uuid) return 'Keine Sitzung';
  if (uuid.length <= 12) return '••••';
  return `${uuid.slice(0, 4)}••••${uuid.slice(-4)}`;
}
export const isOfferId = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

export function capabilities(
  platform: string,
  safeStatistics = false,
  offerLinks = false
): Capabilities {
  const yes = { supported: true };
  const no = (reason: string) => ({ supported: false, reason });
  const native = ['ios', 'android'].includes(platform);
  return {
    registerUser:
      platform === 'ios'
        ? yes
        : no('Unter Android erfolgt die Registrierung in der Anbieteroberfläche.'),
    loginUser: native ? yes : no('Ein nativer Development-Build ist erforderlich.'),
    statistics:
      platform === 'ios' || (platform === 'android' && safeStatistics)
        ? yes
        : no(
            'Für Statistiken ist ein nativer Build mit sicherer Statistik-Schnittstelle erforderlich.'
          ),
    stopTracking: native ? yes : no('Ein nativer Build ist erforderlich.'),
    logout: native ? yes : no('Ein nativer Build ist erforderlich.'),
    marketplace:
      platform === 'ios' ? yes : no('Die Schnittstelle für Zielverknüpfungen ist nicht bestätigt.'),
    badgeList: no('Diese Funktion ist in der SDK-API nicht bestätigt.'),
    offerDetails:
      native && offerLinks
        ? yes
        : no('Für Angebote ist eine neue native App-Version erforderlich.'),
    poiDetails: no('Eine allgemeine Schnittstelle für POI-Details ist nicht bestätigt.')
  };
}
export function createChangers(native: ChangersNative | null, platform: string) {
  // Older Android binaries must never fall back to the unsafe vendor method.
  const caps = capabilities(
    platform,
    native?.safeStatistics === true,
    typeof native?.openOffer === 'function'
  );
  async function call<K extends Exclude<keyof ChangersNative, 'safeStatistics'>>(
    key: K,
    ...args: Parameters<ChangersNative[K]>
  ): Promise<Awaited<ReturnType<ChangersNative[K]>>> {
    if (!native)
      throw new ChangersError(
        'E_NATIVE_UNAVAILABLE',
        'Bitte einen nativen Development-Build statt Expo Go verwenden.'
      );
    if (typeof native[key] !== 'function')
      throw new ChangersError('E_NATIVE_UNAVAILABLE', 'Bitte die native App aktualisieren.');
    try {
      const method = native[key] as (
        ...a: Parameters<ChangersNative[K]>
      ) => ReturnType<ChangersNative[K]>;
      return (await method.apply(native, args)) as Awaited<ReturnType<ChangersNative[K]>>;
    } catch (error) {
      const code =
        typeof error === 'object' && error && 'code' in error && ERROR_CODES.has(String(error.code))
          ? String(error.code)
          : 'E_PROVIDER';
      // Anbietermeldungen können UUIDs, Anfrage-URLs oder Zugangsdaten enthalten. Nicht ungefiltert weitergeben.
      throw new ChangersError(
        code,
        'Der Vorgang konnte nicht abgeschlossen werden. Bitte Konfiguration, Einwilligung, Netzwerk und Anmeldung prüfen.'
      );
    }
  }
  function requireCapability(key: keyof Capabilities) {
    if (!caps[key].supported)
      throw new ChangersError('E_UNSUPPORTED', caps[key].reason || 'Nicht unterstützt.');
  }
  return {
    capabilities: caps,
    addProviderClosedListener: (listener: () => void) =>
      native?.addListener('onProviderClosed', listener) ?? { remove: () => undefined },
    getStatus: () => call('getStatus'),
    setEnabled: (enabled: boolean) => {
      if (!enabled && !native) return Promise.resolve();
      return call('setEnabled', enabled);
    },
    activate: () => call('activate'),
    getUserUUID: () => call('getUserUUID'),
    openProvider: () => call('openProvider'),
    openOffer: (offerId: number) => {
      if (!isOfferId(offerId))
        return Promise.reject(new ChangersError('E_INVALID_ARGUMENT', 'Ungültiges Angebot.'));
      return call('openOffer', String(offerId));
    },
    closeProvider: () => call('closeProvider'),
    registerUser: async () => {
      requireCapability('registerUser');
      return call('registerUser');
    },
    loginUser: (uuid: string) => call('loginUser', uuid),
    fetchStatistics: async () => {
      requireCapability('statistics');
      return call('fetchStatistics');
    },
    stopTracking: () => call('stopTracking'),
    logout: () => call('logout'),
    openTarget: async (target: 'marketplace') => {
      requireCapability('marketplace');
      return call('openTarget', target);
    }
  };
}
