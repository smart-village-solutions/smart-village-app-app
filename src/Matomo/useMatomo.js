import { useContext } from 'react';

import { MatomoContext } from './MatomoProvider';

const useMatomo = () => {
  const instance = useContext(MatomoContext);

  const trackAppStart = () => instance.trackAppStart && instance.trackAppStart();
  const trackScreenView = (params) => instance.trackScreenView && instance.trackScreenView(params);
  const trackAction = (params) => instance.trackAction && instance.trackAction(params);
  const trackEvent = (params) => instance.trackEvent && instance.trackEvent(params);
  const trackSiteSearch = (params) => instance.trackSiteSearch && instance.trackSiteSearch(params);
  const trackLink = (params) => instance.trackLink && instance.trackLink(params);
  const trackDownload = (params) => instance.trackDownload && instance.trackDownload(params);

  return {
    trackAppStart,
    trackScreenView,
    trackAction,
    trackEvent,
    trackSiteSearch,
    trackLink,
    trackDownload
  };
};

export default useMatomo;
