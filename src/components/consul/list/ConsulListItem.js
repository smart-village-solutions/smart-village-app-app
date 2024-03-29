import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, consts, Icon, normalize, texts } from '../../../config';
import { setConsulAuthToken, setConsulUser } from '../../../helpers';
import { useOpenWebScreen } from '../../../hooks';
import { QUERY_TYPES } from '../../../queries';
import { ScreenName } from '../../../types';
import { BoldText } from '../../Text';
import { Touchable } from '../../Touchable';

const logOutAlert = (onLogout) =>
  Alert.alert(texts.consul.loginAllFieldsRequiredTitle, texts.consul.logoutAlertBody, [
    {
      text: texts.consul.abort,
      onPress: () => null,
      style: 'cancel'
    },
    {
      text: texts.consul.homeScreen.logout,
      onPress: () => onLogout(),
      style: 'destructive'
    }
  ]);

export const ConsulListItem = ({ navigation, item }) => {
  const { routeName: name, params, title } = item;
  const headerTitle = title ?? '';
  const link = params?.queryVariables.link ?? '';
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
      containerStyle={{
        backgroundColor: colors.transparent,
        paddingVertical: normalize(12)
      }}
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
    >
      <ListItem.Content>
        <BoldText>{title}</BoldText>
      </ListItem.Content>

      {params.query !== QUERY_TYPES.CONSUL.LOGOUT && (
        <Icon.ArrowRight color={colors.darkText} size={normalize(18)} />
      )}
    </ListItem>
  );
};

ConsulListItem.propTypes = {
  item: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired
};
