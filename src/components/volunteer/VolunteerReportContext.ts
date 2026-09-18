import { createContext, useContext } from 'react';

import { VolunteerReportTarget } from '../../types';

export type VolunteerReportContextValue = {
  enabled: boolean;
  openReport: (target: VolunteerReportTarget) => void;
};

export const VolunteerReportContext = createContext<VolunteerReportContextValue>({
  enabled: false,
  openReport: () => undefined
});

export const useVolunteerReport = () => useContext(VolunteerReportContext);
