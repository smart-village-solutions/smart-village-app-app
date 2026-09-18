import React, { useContext } from 'react';
import renderer from 'react-test-renderer';

jest.mock('../../src/components/volunteer/VolunteerReportModal', () => ({
  VolunteerReportModal: () => null
}));

import { SettingsContext } from '../../src/SettingsProvider';
import { VolunteerReportContext } from '../../src/components/volunteer/VolunteerReportContext';
import { VolunteerReportProvider } from '../../src/components/volunteer/VolunteerReportProvider';

const ReportingState = () => {
  const { enabled } = useContext(VolunteerReportContext);

  return React.createElement('mock-reporting-state', { enabled });
};

const renderWithSettings = (settings: object) => {
  let tree: renderer.ReactTestRenderer;

  renderer.act(() => {
    tree = renderer.create(
      <SettingsContext.Provider value={{ globalSettings: { settings } } as never}>
        <VolunteerReportProvider>
          <ReportingState />
        </VolunteerReportProvider>
      </SettingsContext.Provider>
    );
  });

  return tree!;
};

describe('VolunteerReportProvider', () => {
  it('enables reporting through the existing hdvt tenant configuration', () => {
    const tree = renderWithSettings({ hdvt: { reporting: true } });

    expect(tree.root.findByType('mock-reporting-state').props.enabled).toBe(true);
  });

  it('does not introduce a volunteer settings hierarchy', () => {
    const tree = renderWithSettings({ volunteer: { reporting: true } });

    expect(tree.root.findByType('mock-reporting-state').props.enabled).toBe(false);
  });
});
