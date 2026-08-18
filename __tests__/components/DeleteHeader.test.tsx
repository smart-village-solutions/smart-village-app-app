import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('../../src/config', () => {
  const ReactLocal = require('react');

  return {
    colors: {
      darkText: '#222222'
    },
    consts: {
      a11yLabel: {
        deleteHint: 'Löscht den Eintrag',
        deleteIcon: 'Löschen'
      }
    },
    Icon: {
      NamedIcon: (props: unknown) => ReactLocal.createElement('mock-named-icon', props),
      Trash: (props: unknown) => ReactLocal.createElement('mock-trash-icon', props)
    }
  };
});

import { DeleteHeader } from '../../src/components/DeleteHeader';

describe('DeleteHeader', () => {
  it('uses a header-specific icon variant instead of the shared trash svg', () => {
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(<DeleteHeader onPress={jest.fn()} style={undefined} />);
    });

    expect(() => tree!.root.findByType('mock-trash-icon')).toThrow();
    expect(tree!.root.findByType('mock-named-icon').props.name).toBe('trash');
    expect(tree!.root.findByType('mock-named-icon').props.strokeWidth).toBe(1.75);
  });
});
