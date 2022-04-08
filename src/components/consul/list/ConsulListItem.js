import PropTypes from 'prop-types';
import React from 'react';
import { ListItem } from 'react-native-elements';

import { colors, normalize, Icon, consts } from '../../../config';
import { QUERY_TYPES } from '../../../queries';
import { BoldText } from '../../Text';
import { Touchable } from '../../Touchable';
import { ScreenName } from '../../../types';
import { setConsulAuthToken, setConsulUser, openLink } from '../../../helpers';

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
      onPress={async () => {
        if (params.query === QUERY_TYPES.CONSUL.LOGOUT) {
          await setConsulAuthToken();
          await setConsulUser();
          navigation?.navigate(ScreenName.ConsulHomeScreen, {
            refreshUser: new Date().valueOf()
          });
        } else if (params.query === QUERY_TYPES.CONSUL.USER_SETTINGS) {
          openLink(params.queryVariables.link);
        } else {
          navigation.navigate({
            name,
            params
          });
        }
      }}
      bottomDivider={true}
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
