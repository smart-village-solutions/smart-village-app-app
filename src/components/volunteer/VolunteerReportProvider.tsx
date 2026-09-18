import React, { ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { SettingsContext } from '../../SettingsProvider';
import { VolunteerReportTarget } from '../../types';

import { VolunteerReportContext } from './VolunteerReportContext';
import { VolunteerReportModal } from './VolunteerReportModal';

export const VolunteerReportProvider = ({ children }: { children: ReactNode }) => {
  const { globalSettings } = useContext(SettingsContext);
  const settings = globalSettings?.settings as { hdvt?: { reporting?: boolean } } | undefined;
  const enabled = settings?.hdvt?.reporting === true;
  const [target, setTarget] = useState<VolunteerReportTarget>();
  const openReport = useCallback((nextTarget: VolunteerReportTarget) => setTarget(nextTarget), []);
  const value = useMemo(() => ({ enabled, openReport }), [enabled, openReport]);

  return (
    <VolunteerReportContext.Provider value={value}>
      {children}
      <VolunteerReportModal
        key={target ? `${target.targetType}-${target.targetId}` : 'closed'}
        target={target}
        onClose={() => setTarget(undefined)}
      />
    </VolunteerReportContext.Provider>
  );
};
