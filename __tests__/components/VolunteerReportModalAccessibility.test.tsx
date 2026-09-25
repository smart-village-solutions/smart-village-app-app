import React from 'react';
import renderer from 'react-test-renderer';

let mockIsLoading = false;

jest.mock('react-native-elements', () => {
  const ReactLocal = require('react');

  return {
    Overlay: ({ children, ...props }) => ReactLocal.createElement('mock-overlay', props, children)
  };
});

jest.mock('react-query', () => ({
  useMutation: () => ({ isLoading: mockIsLoading, mutate: jest.fn() })
}));

jest.mock('../../src/config', () => ({
  normalize: (value: number) => value,
  texts: {
    volunteer: {
      abort: 'Abbrechen',
      report: {
        cancelHint: 'Schließt den Dialog, ohne eine Meldung zu senden',
        duplicateMessage: 'Bereits gemeldet',
        errors: { generic: 'Fehler' },
        reasonLabel: 'Grund:',
        reasons: {
          misleading: 'Irreführend',
          offensive: 'Anstößig',
          spam: 'Spam',
          wrongSpace: 'Falscher Space'
        },
        sending: 'Wird gesendet…',
        submit: 'Meldung senden',
        submitHint: 'Sendet die Meldung mit dem ausgewählten Grund',
        successMessage: 'Gesendet',
        successTitle: 'Erfolg',
        title: 'Inhalt melden'
      }
    }
  }
}));

jest.mock('../../src/helpers', () => ({
  volunteerReportErrorTextKey: () => 'generic',
  volunteerReportReasons: () => [2, 3, 4]
}));

jest.mock('../../src/queries/volunteer', () => ({
  reportVolunteerTarget: jest.fn()
}));

jest.mock('../../src/types', () => ({
  VolunteerReportReason: {
    WRONG_SPACE: 1,
    OFFENSIVE: 2,
    SPAM: 3,
    MISLEADING: 4
  }
}));

jest.mock('../../src/hooks/useThemeStyles', () => ({
  useThemeStyles: (createStyles) => createStyles({ error: '#B00020', surface: '#FFFFFF' })
}));

jest.mock('../../src/components/Button', () => {
  const ReactLocal = require('react');

  return {
    Button: (props) => ReactLocal.createElement('mock-button', props)
  };
});

jest.mock('../../src/components/Radiobutton', () => {
  const ReactLocal = require('react');

  return {
    Radiobutton: (props) => ReactLocal.createElement('mock-radio', props)
  };
});

jest.mock('../../src/components/Text', () => {
  const ReactLocal = require('react');

  return {
    BoldText: ({ children, ...props }) =>
      ReactLocal.createElement('mock-bold-text', props, children),
    RegularText: ({ children, ...props }) =>
      ReactLocal.createElement('mock-regular-text', props, children)
  };
});

jest.mock('../../src/components/Wrapper', () => ({
  Wrapper: ({ children }) => children,
  WrapperRow: ({ children }) => children
}));

import { VolunteerReportModal } from '../../src/components/volunteer/VolunteerReportModal';

const target = { targetType: 'content' as const, targetId: 39, label: 'Beitrag' };

const renderModal = () => {
  let tree: renderer.ReactTestRenderer;

  renderer.act(() => {
    tree = renderer.create(<VolunteerReportModal onClose={jest.fn()} target={target} />);
  });

  return tree!;
};

describe('VolunteerReportModal accessibility', () => {
  afterEach(() => {
    mockIsLoading = false;
  });

  it('exposes modal, heading, radio group and button semantics', () => {
    const tree = renderModal();

    expect(tree.root.findByProps({ accessibilityViewIsModal: true })).toBeDefined();
    expect(tree.root.findByProps({ accessibilityRole: 'header' }).props.children).toBe(
      'Inhalt melden'
    );
    expect(
      tree.root.findByProps({ accessibilityRole: 'radiogroup' }).props.accessibilityLabel
    ).toBe('Grund:');

    const buttons = tree.root.findAllByType('mock-button');
    expect(buttons[0].props.accessibilityHint).toContain('Schließt den Dialog');
    expect(buttons[1].props.accessibilityHint).toContain('Sendet die Meldung');
    expect(buttons[1].props.disabled).toBe(true);
  });

  it('announces the report submission as a loading state', () => {
    mockIsLoading = true;
    const tree = renderModal();
    const progress = tree.root.findByProps({ accessibilityRole: 'progressbar' });

    expect(progress.props.accessibilityLiveRegion).toBe('polite');
    expect(progress.props.accessibilityValue).toEqual({ text: 'Wird gesendet…' });
    expect(tree.root.findAllByType('mock-radio').every((radio) => radio.props.disabled)).toBe(true);
  });
});
