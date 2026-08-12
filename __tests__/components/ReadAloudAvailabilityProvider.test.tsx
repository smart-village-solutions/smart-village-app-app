import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactLocal = require('react');

  return {
    NavigationRouteContext: ReactLocal.createContext(undefined)
  };
});

jest.mock('../../src/AccessibilityProvider', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactLocal = require('react');

  return {
    AccessibilityContext: ReactLocal.createContext({ features: { readAloud: true } })
  };
});

import {
  ReadAloudAvailabilityProvider,
  useReadAloudPlayerBottomSpacing,
  useRegisterReadAloudContent
} from '../../src/ReadAloudAvailabilityProvider';

const Probe = () => {
  const bottomSpacing = useReadAloudPlayerBottomSpacing();
  useRegisterReadAloudContent('standalone-html', [{ id: 'title', text: 'Datenschutz' }], true);

  return React.createElement('read-aloud-probe', { bottomSpacing });
};

describe('ReadAloudAvailabilityProvider', () => {
  it('stays inactive when content is rendered outside a navigation route', () => {
    let tree: renderer.ReactTestRenderer;

    expect(() => {
      renderer.act(() => {
        tree = renderer.create(
          <ReadAloudAvailabilityProvider>
            <Probe />
          </ReadAloudAvailabilityProvider>
        );
      });
    }).not.toThrow();

    expect(tree!.root.findByType('read-aloud-probe').props.bottomSpacing).toBe(0);
  });
});
