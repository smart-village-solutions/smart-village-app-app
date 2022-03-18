import PropTypes from 'prop-types';
import React from 'react';
import { ListItem } from 'react-native-elements';

import { colors, normalize, Icon, consts } from '../../../config';
import { BoldText } from '../../Text';
import { Touchable } from '../../Touchable';

export const ConsulListItem = ({ navigation, item }) => {
  const { routeName: name, params, title } = item;
  return (
    <ListItem
      subtitle={<BoldText>{title}</BoldText>}
      containerStyle={{
        backgroundColor: colors.transparent,
        paddingVertical: normalize(12)
      }}
      rightIcon={<Icon.ArrowRight />}
      onPress={() =>
        navigation.navigate({
          name,
          params
        })
      }
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={`(${title}) ${consts.a11yLabel.poiCount} ${consts.a11yLabel.button}`}
    />
  );
};

ConsulListItem.propTypes = {
  navigation: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired
};
