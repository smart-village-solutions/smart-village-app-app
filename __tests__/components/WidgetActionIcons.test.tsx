import * as VectorIcons from '@expo/vector-icons';
import React from 'react';
import renderer from 'react-test-renderer';
import * as Tabler from 'tabler-icons-react-native';

import { Icon } from '../../src/config/icons/Icon';
import { getMappedIconName } from '../../src/config/icons/mappings';
import { useIconLibraries } from '../../src/IconProvider';

jest.mock('../../src/IconProvider', () => ({ useIconLibraries: jest.fn() }));

const cases = [
  ['medal', 'fontawesome', 'trophy', VectorIcons.FontAwesome, 'FontAwesome'],
  ['medal', 'fontawesome5', 'medal', VectorIcons.FontAwesome5, 'FontAwesome5Free'],
  ['medal', 'fontawesome6', 'medal', VectorIcons.FontAwesome6, 'FontAwesome6Free'],
  ['medal', 'ionicons', 'medal-outline', VectorIcons.Ionicons, 'Ionicons'],
  ['medal', 'materialicons', 'military-tech', VectorIcons.MaterialIcons, 'MaterialIcons'],
  [
    'medal',
    'materialcommunityicons',
    'medal-outline',
    VectorIcons.MaterialCommunityIcons,
    'MaterialCommunityIcons'
  ],
  ['medal', 'simplelineicons', 'badge', VectorIcons.SimpleLineIcons, 'SimpleLineIcons'],
  ['medal', 'tabler', 'medal', Tabler.IconMedal, null],
  ['refresh', 'fontawesome', 'refresh', VectorIcons.FontAwesome, 'FontAwesome'],
  ['refresh', 'fontawesome5', 'sync-alt', VectorIcons.FontAwesome5, 'FontAwesome5Free'],
  ['refresh', 'fontawesome6', 'arrows-rotate', VectorIcons.FontAwesome6, 'FontAwesome6Free'],
  ['refresh', 'ionicons', 'refresh', VectorIcons.Ionicons, 'Ionicons'],
  ['refresh', 'materialicons', 'refresh', VectorIcons.MaterialIcons, 'MaterialIcons'],
  [
    'refresh',
    'materialcommunityicons',
    'refresh',
    VectorIcons.MaterialCommunityIcons,
    'MaterialCommunityIcons'
  ],
  ['refresh', 'simplelineicons', 'refresh', VectorIcons.SimpleLineIcons, 'SimpleLineIcons'],
  ['refresh', 'tabler', 'refresh', Tabler.IconRefresh, null]
] as const;

// Verify real installed glyphs, not only a nonempty mapping or the raw-name fallback.
describe.each(cases)('%s in %s', (name, library, glyph, Component, glyphFile) => {
  beforeEach(() => {
    jest.mocked(useIconLibraries).mockReturnValue({
      iconLibraries: [library, 'tabler'],
      getIconLibraries: () => [library, 'tabler']
    });
  });

  it('maps to an installed icon', () => {
    expect(getMappedIconName(name, library)).toBe(glyph);
    if (glyphFile) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const glyphs = require(`@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/${glyphFile}.json`);
      expect(glyphs[glyph]).toEqual(expect.any(Number));
    } else {
      expect(Component).toBeDefined();
    }
  });

  it.each([true, false])(
    'renders with explicit iconSet=%s or configured library order',
    (explicit) => {
      let tree: renderer.ReactTestRenderer;
      renderer.act(() => {
        tree = renderer.create(
          <Icon.NamedIcon name={name} {...(explicit ? { iconSet: library } : {})} />
        );
      });
      const icon = tree!.root.findByType(Component);
      if (library !== 'tabler') expect(icon.props.name).toBe(glyph);
      expect(tree!.root.findAllByType(Tabler.IconQuestionMark)).toHaveLength(0);
      renderer.act(() => tree!.unmount());
    }
  );
});
