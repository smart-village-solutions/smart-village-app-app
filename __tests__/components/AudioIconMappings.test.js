import FontAwesome from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/FontAwesome.json';
import FontAwesome5 from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/FontAwesome5Free.json';
import FontAwesome6 from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/FontAwesome6Free.json';
import Ionicons from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json';
import MaterialCommunityIcons from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json';
import MaterialIcons from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialIcons.json';
import SimpleLineIcons from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/SimpleLineIcons.json';
import { IconMusic, IconPlayerStop } from 'tabler-icons-react-native';

import { fontawesomeIconMapping } from '../../src/config/icons/mappings/fontawesome';
import { fontawesome5IconMapping } from '../../src/config/icons/mappings/fontawesome5';
import { fontawesome6IconMapping } from '../../src/config/icons/mappings/fontawesome6';
import { ioniconsIconMapping } from '../../src/config/icons/mappings/ionicons';
import { materialcommunityiconsIconMapping } from '../../src/config/icons/mappings/materialcommunityicons';
import { materialiconsIconMapping } from '../../src/config/icons/mappings/materialicons';
import { simplelineiconsIconMapping } from '../../src/config/icons/mappings/simplelineicons';
import { tablerIconMapping } from '../../src/config/icons/mappings/tabler';

describe('audio icon mappings', () => {
  it.each([
    ['FontAwesome', fontawesomeIconMapping, FontAwesome],
    ['FontAwesome5', fontawesome5IconMapping, FontAwesome5],
    ['FontAwesome6', fontawesome6IconMapping, FontAwesome6],
    ['Ionicons', ioniconsIconMapping, Ionicons],
    ['MaterialCommunityIcons', materialcommunityiconsIconMapping, MaterialCommunityIcons],
    ['MaterialIcons', materialiconsIconMapping, MaterialIcons],
    ['SimpleLineIcons', simplelineiconsIconMapping, SimpleLineIcons],
    ['Tabler', tablerIconMapping, { music: IconMusic, 'player-stop': IconPlayerStop }]
  ])('resolves music and stop to available %s icons', (_library, mapping, availableIcons) => {
    for (const name of ['music', 'player-stop']) {
      expect(mapping[name]).toBeDefined();
      expect(availableIcons[mapping[name]]).toBeDefined();
    }
  });
});
