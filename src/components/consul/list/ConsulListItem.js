import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, normalize, Icon, consts } from '../../../config';
import { QUERY_TYPES } from '../../../queries';
import { BoldText } from '../../Text';
import { Touchable } from '../../Touchable';
import { ScreenName } from '../../../types';
import { setConsulAuthToken, setConsulUser } from '../../../helpers';
import { texts } from '../../../config';
import { useOpenWebScreen } from '../../../hooks';

const text = texts.consul;

const logOutAlert = (onLogout) =>
  Alert.alert(text.loginAllFieldsRequiredTitle, text.logoutAlertBody, [
    {
      text: text.abort,
      onPress: () => null,
      style: 'cancel'
    },
    {
      text: text.homeScreen.logout,
      onPress: () => onLogout(),
      style: 'destructive'
    }
  ]);

export const ConsulListItem = ({ navigation, item }) => {
  const { routeName: name, params, title } = item;
  const link = params?.queryVariables.link ?? '';
  const headerTitle = title ?? '';
  const rootRouteName = params?.rootRouteName ?? '';

  const onLogout = async () => {
    await setConsulAuthToken();
    await setConsulUser();
    navigation?.navigate(ScreenName.ConsulHomeScreen, {
      refreshUser: new Date().valueOf()
    });
  };

  const openWebScreen = useOpenWebScreen(headerTitle, link, rootRouteName);

  return (
    <ListItem
      title={<BoldText>{title}</BoldText>}
      containerStyle={{
        backgroundColor: colors.transparent,
        paddingVertical: normalize(12)
      }}
      rightIcon={params.query !== QUERY_TYPES.CONSUL.LOGOUT ? <Icon.ArrowRight /> : null}
      onPress={async () => {
        if (params.query === QUERY_TYPES.CONSUL.LOGOUT) {
          logOutAlert(onLogout);
        } else if (params.query === QUERY_TYPES.CONSUL.USER_SETTINGS) {
          openWebScreen();
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
