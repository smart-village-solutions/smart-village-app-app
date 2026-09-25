import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('../../src/config', () => {
  const ReactLocal = require('react');

  return {
    Icon: {
      Flag: (props: unknown) => ReactLocal.createElement('mock-flag-icon', props)
    },
    normalize: (value: number) => value,
    texts: {
      volunteer: {
        report: {
          action: (label: string) => `${label} melden`,
          actionHint: 'Öffnet den Dialog zum Melden',
          label: 'Melden'
        }
      }
    }
  };
});

jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ colors: { darkText: '#222222' } })
}));

import { VolunteerReportAction } from '../../src/components/volunteer/VolunteerReportAction';
import { VolunteerReportContext } from '../../src/components/volunteer/VolunteerReportContext';

const target = {
  targetType: 'content' as const,
  targetId: 39,
  label: 'Beitrag Test4',
  isInSpace: true
};

describe('VolunteerReportAction', () => {
  it('does not render when reporting is disabled', () => {
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(
        <VolunteerReportContext.Provider value={{ enabled: false, openReport: jest.fn() }}>
          <VolunteerReportAction target={target} />
        </VolunteerReportContext.Provider>
      );
    });

    expect(tree!.toJSON()).toBeNull();
  });

  it('opens the report dialog with the content target', () => {
    const openReport = jest.fn();
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(
        <VolunteerReportContext.Provider value={{ enabled: true, openReport }}>
          <VolunteerReportAction target={target} />
        </VolunteerReportContext.Provider>
      );
    });

    const button = tree!.root.findByProps({ accessibilityRole: 'button' });

    renderer.act(() => button.props.onPress());

    expect(button.props.accessibilityLabel).toBe('Beitrag Test4 melden');
    expect(openReport).toHaveBeenCalledWith(target);
  });

  it('renders an inline report label with its separator', () => {
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(
        <VolunteerReportContext.Provider value={{ enabled: true, openReport: jest.fn() }}>
          <VolunteerReportAction target={target} variant="text" withSeparator />
        </VolunteerReportContext.Provider>
      );
    });

    expect(tree!.root.findByProps({ accessibilityRole: 'button' }).props.children).toBeTruthy();
    expect(JSON.stringify(tree!.toJSON())).toContain('Melden');
    expect(JSON.stringify(tree!.toJSON())).toContain(' • ');
  });

  it('renders a labeled detail action for event screens', () => {
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(
        <VolunteerReportContext.Provider value={{ enabled: true, openReport: jest.fn() }}>
          <VolunteerReportAction target={{ ...target, label: 'Veranstaltung' }} variant="detail" />
        </VolunteerReportContext.Provider>
      );
    });

    expect(JSON.stringify(tree!.toJSON())).toContain('Veranstaltung melden');
    expect(tree!.root.findAllByType('mock-flag-icon')).toHaveLength(1);
  });
});
