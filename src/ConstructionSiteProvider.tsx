import React, { createContext, useState } from 'react';

import { ConstructionSite } from './types';

export const ConstructionSiteContext = createContext<{
  constructionSites: ConstructionSite[];
  setConstructionSites: React.Dispatch<React.SetStateAction<ConstructionSite[]>>;
}>({ constructionSites: [], setConstructionSites: () => null });

export const ConstructionSiteProvider = ({ children }: { children: React.ReactNode }) => {
  const [constructionSites, setConstructionSites] = useState<ConstructionSite[]>([]);
  return (
    <ConstructionSiteContext.Provider value={{ constructionSites, setConstructionSites }}>
      {children}
    </ConstructionSiteContext.Provider>
  );
};
