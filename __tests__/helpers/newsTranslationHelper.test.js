import AsyncStorage from '@react-native-async-storage/async-storage';

import { getAppTranslation, loadTranslatedNews } from '../../src/helpers/newsTranslationHelper';

jest.mock('../../src/helpers/storageHelper', () => ({
  storageHelper: { globalSettings: async () => ({}) }
}));

const digest = 'a'.repeat(64);
const response = (state = 'pending', servedLocale = 'de', sourceDigest = digest) => ({
  scope: 'municipality-principal-en',
  data: {
    newsItem: {
      id: '1',
      mainTitle: servedLocale !== 'de' ? 'News' : 'Nachricht',
      contentBlocks: [
        { id: 'block-1', body: servedLocale !== 'de' ? 'Open Mondays' : 'Montags geöffnet' }
      ]
    }
  },
  extensions: { appTranslations: [{ path: ['newsItem'], sourceDigest, servedLocale, state }] }
});

describe('news translations', () => {
  let client;
  let current;
  const open = (online = true, locale = 'en') =>
    loadTranslatedNews({
      client,
      document: 'query News',
      id: '1',
      authMode: 'public',
      locale,
      online,
      isCurrent: () => current
    });
  const tick = async (milliseconds = 0) => {
    await jest.advanceTimersByTimeAsync(milliseconds);
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    await AsyncStorage.clear();
    current = true;
    client = {
      cacheScope: jest.fn().mockResolvedValue('municipality-principal-en'),
      rawRequest: jest.fn().mockResolvedValue(response())
    };
  });
  afterEach(() => jest.useRealTimers());

  it('repeats the same query and commits a complete English message', async () => {
    client.rawRequest
      .mockResolvedValueOnce(response())
      .mockResolvedValueOnce(response('ready', 'en'));
    const result = open();
    await tick(500);
    expect(await result).toEqual({
      data: response('ready', 'en').data,
      servedLocale: 'en',
      scope: 'municipality-principal-en',
      sourceDigest: digest
    });
    expect(client.rawRequest).toHaveBeenNthCalledWith(
      2,
      'query News',
      { id: '1' },
      { authMode: 'public', locale: 'en' }
    );
    expect((await open(false)).servedLocale).toBe('en');
  });

  it('shows ready English even when saving it takes longer than the view deadline', async () => {
    AsyncStorage.setItem.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 6000))
    );
    client.rawRequest.mockResolvedValue(response('ready', 'en'));
    const result = open();
    await tick(5000);
    expect(await result).toMatchObject({ data: response('ready', 'en').data, servedLocale: 'en' });
    await tick(1000);
  });

  it('settles in German at five seconds and ignores a late English response', async () => {
    let resolve;
    client.rawRequest.mockResolvedValueOnce(response()).mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        })
    );
    const result = open();
    await tick(5000);
    expect(await result).toMatchObject({ data: response().data, servedLocale: 'de' });
    resolve(response('ready', 'en'));
    await tick();
    expect((await open(false)).servedLocale).toBe('de');
    expect(client.rawRequest).toHaveBeenCalledTimes(2);
  });

  it('includes the first network request in the five second budget', async () => {
    client.rawRequest.mockReturnValue(new Promise(() => {}));
    const result = open();
    await tick(5000);
    expect(await result).toBeUndefined();
    expect(client.rawRequest).toHaveBeenCalledTimes(1);
  });

  it('treats missing metadata as German legacy data without polling', async () => {
    client.rawRequest.mockResolvedValue({ scope: response().scope, data: response().data });
    expect((await open()).servedLocale).toBe('de');
    expect(client.rawRequest).toHaveBeenCalledTimes(1);
  });

  it('fetches German when a server sends a different translated language', async () => {
    client.rawRequest
      .mockResolvedValueOnce(response('ready', 'fr'))
      .mockResolvedValueOnce(response('unavailable', 'de'));
    expect((await open()).servedLocale).toBe('de');
    expect(client.rawRequest).toHaveBeenLastCalledWith(
      'query News',
      { id: '1' },
      { authMode: 'public', locale: 'de' }
    );
    expect((await open(false)).servedLocale).toBe('de');
  });

  it('does not reuse another municipality, principal, or language cache', async () => {
    client.rawRequest.mockResolvedValue(response('ready', 'en'));
    await open();
    for (const scope of ['other-municipality', 'other-principal', 'same-principal-de']) {
      client.cacheScope.mockResolvedValue(scope);
      expect(await open(false)).toBeUndefined();
    }
  });

  it('rejects a response whose credential scope changed in flight', async () => {
    client.cacheScope
      .mockResolvedValueOnce(response().scope)
      .mockResolvedValueOnce(response().scope)
      .mockResolvedValue('new-principal');
    expect(await open()).toEqual({ denied: true });
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  it('does not commit a previous screen request', async () => {
    client.rawRequest.mockImplementation(async () => {
      current = false;
      return response('ready', 'en');
    });
    expect(await open()).toBeUndefined();
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  it('uses current German data when the source digest changed', async () => {
    client.rawRequest.mockResolvedValueOnce(response('ready', 'en'));
    await open();
    const updated = response('unavailable', 'de', 'b'.repeat(64));
    updated.data.newsItem.mainTitle = 'Neue Nachricht';
    client.rawRequest.mockResolvedValue(updated);
    expect(await open()).toMatchObject({ data: updated.data, servedLocale: 'de' });
    expect((await open(false)).data.newsItem.mainTitle).toBe('Neue Nachricht');
  });

  it('preserves cached data after transport failures but hides it on rejection', async () => {
    client.rawRequest.mockResolvedValueOnce(response('unavailable'));
    await open();
    client.rawRequest.mockRejectedValueOnce(new Error('network unavailable'));
    expect((await open()).servedLocale).toBe('de');
    client.rawRequest.mockRejectedValueOnce(
      Object.assign(new Error('denied'), { response: { status: 403 } })
    );
    expect(await open()).toEqual({ denied: true });
    expect((await open(false)).servedLocale).toBe('de');
  });

  it('matches aliases and list indices exactly and validates the small contract', () => {
    const value = response('ready', 'en');
    value.extensions.appTranslations[0].path = ['articles', 1];
    expect(getAppTranslation(value, ['articles', 1], 'en')?.servedLocale).toBe('en');
    expect(getAppTranslation(value, ['articles', 0], 'en')).toBeUndefined();
    expect(getAppTranslation(value, ['newsItem'], 'en')).toBeUndefined();
    value.extensions.appTranslations[0].sourceDigest = 'invalid';
    expect(getAppTranslation(value, ['articles', 1], 'en')).toBeUndefined();
  });
});

it.each(['fr', 'pt-PT'])(
  'requests and caches %s independently of other languages',
  async (locale) => {
    jest.useFakeTimers();
    try {
      await AsyncStorage.clear();
      const client = {
        cacheScope: jest.fn().mockResolvedValue(response().scope),
        rawRequest: jest.fn().mockResolvedValue(response('ready', locale))
      };
      const read = (locale, online) =>
        loadTranslatedNews({
          client,
          locale,
          online,
          document: 'query News',
          id: '1',
          authMode: 'public',
          isCurrent: () => true
        });

      expect((await read(locale, true)).servedLocale).toBe(locale);
      expect(client.rawRequest).toHaveBeenCalledWith(
        'query News',
        { id: '1' },
        { authMode: 'public', locale }
      );
      expect(await read('en', false)).toBeUndefined();
      expect((await read(locale, false)).servedLocale).toBe(locale);
    } finally {
      jest.useRealTimers();
    }
  }
);
