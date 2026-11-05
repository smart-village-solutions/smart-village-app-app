import React from 'react';
import { DeviceEventEmitter } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import {
  applyNewsListTitles,
  NEWS_TRANSLATION_READY,
  useNewsListTranslations
} from '../../src/hooks/newsListTranslations';
import { ReactQueryClient } from '../../src/ReactQueryClient';

jest.mock('../../src/ReactQueryClient');

const item = { id: '21', mainTitle: 'Stadtbibliothek' };
const existingRows = { newsItems: [{ id: '20', mainTitle: 'Other' }, item] };
const response = (state, title = item.mainTitle, scope = 'current-scope') => ({
  scope,
  data: { newsItems: [{ ...item, mainTitle: title }] },
  extensions: {
    appTranslations: [
      {
        path: ['newsItems', 0],
        servedLocale: state === 'ready' ? 'en' : 'de',
        sourceDigest: 'a'.repeat(64),
        state
      }
    ]
  }
});

describe('news list translations', () => {
  let tree;
  let list;
  const rawRequest = jest.fn();
  const Probe = () => {
    list = useNewsListTranslations(true);
    return null;
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    rawRequest.mockReset();
    ReactQueryClient.mockResolvedValue({
      rawRequest,
      cacheScope: async () => 'current-scope'
    });
    await act(async () => {
      tree = renderer.create(<Probe />);
    });
  });

  afterEach(async () => {
    await act(async () => tree.unmount());
    jest.useRealTimers();
  });

  it('updates the pending row when ready and preserves the rest of the loaded list', async () => {
    rawRequest
      .mockResolvedValueOnce(response('pending'))
      .mockResolvedValueOnce(response('ready', 'City library'));
    await act(async () => list.observe(response('pending')));
    await act(async () => jest.advanceTimersByTimeAsync(3000));

    expect(rawRequest).toHaveBeenCalledTimes(2);
    expect(rawRequest).toHaveBeenCalledWith(expect.anything(), { ids: ['21'], limit: 1 }, {});
    expect(applyNewsListTitles(existingRows, list.titles).newsItems).toEqual([
      existingRows.newsItems[0],
      { ...item, mainTitle: 'City library' }
    ]);
    await act(async () => jest.advanceTimersByTimeAsync(5000));
    expect(rawRequest).toHaveBeenCalledTimes(2);
  });

  const openTranslatedDetail = (scope = 'current-scope', sourceDigest = 'a'.repeat(64)) =>
    DeviceEventEmitter.emit(NEWS_TRANSLATION_READY, {
      id: '21',
      title: 'City library',
      scope,
      sourceDigest
    });

  it('updates a cached list row from the English detail without waiting for another request', async () => {
    await act(async () => openTranslatedDetail());

    expect(rawRequest).not.toHaveBeenCalled();
    expect(applyNewsListTitles(existingRows, list.titles).newsItems).toEqual([
      existingRows.newsItems[0],
      { ...item, mainTitle: 'City library' }
    ]);
  });

  it('rejects detail titles for a different auth scope or source revision', async () => {
    await act(async () => list.observe(response('unavailable')));
    await act(async () => openTranslatedDetail('other-scope'));
    await act(async () => openTranslatedDetail('current-scope', 'b'.repeat(64)));

    expect(rawRequest).not.toHaveBeenCalled();
    expect(applyNewsListTitles(existingRows, list.titles)).toBe(existingRows);
  });
});
