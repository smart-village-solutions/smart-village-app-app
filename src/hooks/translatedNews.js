import { useContext, useEffect, useRef, useState } from 'react';

import { ProfileContext } from '../ProfileProvider';
import { loadTranslatedNews } from '../helpers/newsTranslationHelper';
import { ReactQueryClient } from '../ReactQueryClient';
import { GET_NEWS_ITEM } from '../queries/newsItems';

export const useTranslatedNews = ({ enabled, id, authMode, locale, online, refreshTime }) => {
  const { currentUserData, isLoggedIn } = useContext(ProfileContext);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({});
  const principal = JSON.stringify([
    currentUserData?.member?.id,
    currentUserData?.member?.municipality_id,
    currentUserData?.user?.id,
    currentUserData?.user?.municipality_id
  ]);
  const key = JSON.stringify([id, authMode, locale, principal, isLoggedIn, refreshTime, revision]);
  const session = useRef({});

  useEffect(() => {
    if (!enabled || (session.current.key === key && session.current.settled)) return;
    if (session.current.key !== key) session.current = { key, deadline: Date.now() + 5000 };
    let current = true;
    const load = async () => {
      const client = await ReactQueryClient();
      if (!current) return;
      const response = await loadTranslatedNews({
        client,
        document: GET_NEWS_ITEM,
        id,
        authMode,
        locale,
        online,
        deadline: session.current.deadline,
        isCurrent: () => current
      });
      if (current) {
        session.current.settled = true;
        setResult({ key, response });
      }
    };
    void load().catch(() => {
      if (current && !session.current.settled) {
        session.current.settled = true;
        setResult({ key });
      }
    });
    return () => {
      current = false;
    };
  }, [enabled, key, authMode, id, locale, online]);

  return {
    data: enabled && result.key === key ? result.response?.data : undefined,
    servedLocale: enabled && result.key === key ? result.response?.servedLocale : undefined,
    isLoading: enabled && result.key !== key,
    isRefetching: false,
    refetch: () => setRevision((value) => value + 1)
  };
};
