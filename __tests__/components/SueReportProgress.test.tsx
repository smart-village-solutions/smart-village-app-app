import React from 'react';
import renderer from 'react-test-renderer';

import { SueReportProgress } from '../../src/components/SUE/report/SueReportProgress';

jest.mock('react-native-circular-progress-indicator', () => {
  const ReactLocal = jest.requireActual<typeof React>('react');

  return (props: object) => ReactLocal.createElement('mock-circular-progress', props);
});

jest.mock('react-native-elements', () => {
  const ReactLocal = jest.requireActual<typeof React>('react');

  return {
    Divider: (props: object) => ReactLocal.createElement('mock-divider', props),
    normalize: (value: number) => value
  };
});

jest.mock('../../src/ConfigurationsProvider', () => {
  const ReactLocal = jest.requireActual<typeof React>('react');

  return {
    ConfigurationsContext: ReactLocal.createContext({ appDesignSystem: {} })
  };
});

jest.mock('../../src/config', () => ({
  colors: {
    darkText: '#111111',
    primary: '#008000'
  },
  texts: {
    components: {
      sueReportProgress: (step: number, total: number) => `Step ${step} of ${total}`
    }
  }
}));

jest.mock('../../src/components/Text', () => {
  const ReactLocal = jest.requireActual<typeof React>('react');

  const MockText = ({ children, ...props }: { children: React.ReactNode }) =>
    ReactLocal.createElement('mock-text', props, children);

  return { BoldText: MockText, RegularText: MockText };
});

jest.mock('../../src/components/Wrapper', () => {
  const ReactLocal = jest.requireActual<typeof React>('react');

  const MockWrapper = ({ children, ...props }: { children: React.ReactNode }) =>
    ReactLocal.createElement('mock-wrapper', props, children);

  return { Wrapper: MockWrapper, WrapperRow: MockWrapper };
});

describe('SueReportProgress', () => {
  it('renders the current step independently from the progress library title layer', () => {
    let testRenderer: renderer.ReactTestRenderer;

    renderer.act(() => {
      testRenderer = renderer.create(
        <SueReportProgress
          currentProgress={2}
          isFullscreenMap={false}
          progress={[
            { subtitle: 'First subtitle', title: 'First' },
            { subtitle: 'Second subtitle', title: 'Second' },
            { subtitle: 'Third subtitle', title: 'Third' }
          ]}
        />
      );
    });

    const progressValue = testRenderer!.root
      .findAllByType('mock-text')
      .find((node) => node.props.testID === 'sue-report-progress-value');
    const circularProgress = testRenderer!.root.findByType('mock-circular-progress');

    expect(progressValue?.children).toEqual(['2 / 3']);
    expect(circularProgress.props.title).toBeUndefined();
    expect(circularProgress.props.value).toBeCloseTo(66.67, 2);
  });
});
