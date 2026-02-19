import React, { createContext, useContext, ReactNode } from 'react';

import { SettingsContext } from './SettingsProvider';

export type IconLibrary =
  | 'fontawesome'
  | 'fontawesome5'
  | 'fontawesome6'
  | 'ionicons'
  | 'materialcommunityicons'
  | 'materialicons'
  | 'simplelineicons'
  | 'tabler';

type IconConfig = IconLibrary | IconLibrary[];

interface IconContextValue {
  iconLibraries: IconLibrary[];
  getIconLibraries: () => IconLibrary[];
}

const DEFAULT_ICON_LIBRARIES: IconLibrary[] = ['tabler'];

const IconContext = createContext<IconContextValue>({
  iconLibraries: DEFAULT_ICON_LIBRARIES,
  getIconLibraries: () => DEFAULT_ICON_LIBRARIES
});

export const useIconLibraries = () => useContext(IconContext);

interface IconProviderProps {
  children: ReactNode;
}

export const IconProvider = ({ children }: IconProviderProps) => {
  const { globalSettings } = useContext(SettingsContext);

  const getIconLibraries = (): IconLibrary[] => {
    // @ts-expect-error - globalSettings.settings might not have icon property typed yet
    const iconConfig = globalSettings?.settings?.iconFamilies as IconConfig | undefined;

    if (!iconConfig) {
      return DEFAULT_ICON_LIBRARIES;
    }

    if (typeof iconConfig === 'string') {
      return [iconConfig];
    }

    if (Array.isArray(iconConfig) && iconConfig.length > 0) {
      return iconConfig;
    }

    return DEFAULT_ICON_LIBRARIES;
  };

  const iconLibraries = getIconLibraries();

  return (
    <IconContext.Provider value={{ iconLibraries, getIconLibraries }}>
      {children}
    </IconContext.Provider>
  );
};
