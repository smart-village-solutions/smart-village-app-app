import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { useTranslatedNews } from '../../src/hooks/translatedNews';
import { loadTranslatedNews } from '../../src/helpers/newsTranslationHelper';

jest.mock('../../src/ProfileProvider', () => ({
  ProfileContext: jest.requireActual('react').createContext({ isLoggedIn: false })
}));
jest.mock('../../src/ReactQueryClient', () => ({ ReactQueryClient: async () => ({}) }));
jest.mock('../../src/queries/newsItems', () => ({ GET_NEWS_ITEM: 'query News' }));
jest.mock('../../src/helpers/newsTranslationHelper', () => ({ loadTranslatedNews: jest.fn() }));

const Probe = (props) => {
  const result = useTranslatedNews(props);
  return <probe result={result} />;
};
const props = {
  enabled: true,
  id: '1',
  authMode: 'public',
  locale: 'en',
  online: true,
  refreshTime: 1
};

beforeEach(() => jest.clearAllMocks());

it('ignores an in-flight English result after switching to French', async () => {
  const reads = [];
  loadTranslatedNews.mockImplementation(
    (options) => new Promise((resolve) => reads.push({ ...options, resolve }))
  );
  let tree;
  await act(async () => {
    tree = renderer.create(<Probe {...props} />);
  });
  await act(async () => {
    tree.update(<Probe {...props} locale="fr" />);
    reads[0].resolve({ data: { newsItem: { id: '1' } }, servedLocale: 'en' });
  });
  expect(reads[0].isCurrent()).toBe(false);
  expect(tree.root.findByType('probe').props.result.data).toBeUndefined();
  await act(async () => {
    reads[1].resolve({ data: { newsItem: { id: '1' } }, servedLocale: 'fr' });
  });
  expect(tree.root.findByType('probe').props.result.servedLocale).toBe('fr');
  await act(async () => tree.unmount());
});

it('ignores the old message after navigation and starts a new bounded read on explicit refresh', async () => {
  const reads = [];
  loadTranslatedNews.mockImplementation(
    (options) => new Promise((resolve) => reads.push({ ...options, resolve }))
  );
  let tree;
  await act(async () => {
    tree = renderer.create(<Probe {...props} />);
  });
  await act(async () => {
    tree.update(<Probe {...props} id="2" />);
  });
  expect(reads[0].isCurrent()).toBe(false);
  await act(async () => {
    reads[0].resolve({ data: { newsItem: { id: '1' } } });
  });
  expect(tree.root.findByType('probe').props.result.isLoading).toBe(true);
  await act(async () => {
    reads[1].resolve({ data: { newsItem: { id: '2' } }, servedLocale: 'de' });
  });
  expect(tree.root.findByType('probe').props.result.data.newsItem.id).toBe('2');
  await act(async () => {
    tree.update(<Probe {...props} id="2" online={false} />);
  });
  expect(loadTranslatedNews).toHaveBeenCalledTimes(2);
  await act(async () => {
    tree.root.findByType('probe').props.result.refetch();
  });
  expect(loadTranslatedNews).toHaveBeenCalledTimes(3);
  await act(async () => {
    tree.unmount();
  });
  expect(reads[2].isCurrent()).toBe(false);
});

it('leaves the existing German flow alone when disabled', async () => {
  let tree;
  await act(async () => {
    tree = renderer.create(<Probe {...props} enabled={false} />);
  });
  expect(loadTranslatedNews).not.toHaveBeenCalled();
  expect(tree.root.findByType('probe').props.result.isLoading).toBe(false);
  await act(async () => {
    tree.unmount();
  });
});
