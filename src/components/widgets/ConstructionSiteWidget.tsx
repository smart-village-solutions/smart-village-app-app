import React, { useCallback, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { colors, normalize } from '../../config';
import { ConstructionSiteContext } from '../../ConstructionSiteProvider';
import { constructionSite } from '../../icons';
import { Icon } from '../Icon';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

type Props = {
  navigation: NavigationScreenProp<never>;
};

export const ConstructionSiteWidget = ({ navigation }: Props) => {
  const { constructionSites } = useContext(ConstructionSiteContext);

  const onPress = useCallback(() => {
    if (constructionSites.length) navigation.navigate('ConstructionSiteOverview');
  }, [constructionSites, navigation]);

  return (
    <Touchable onPress={onPress}>
      <Wrapper>
        <View style={styles.container}>
          <Icon style={styles.icon} xml={constructionSite(colors.primary)} />
          <BoldText style={styles.count}>{constructionSites.length}</BoldText>
        </View>
        <RegularText style={styles.text}>Baustellen</RegularText>
      </Wrapper>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  count: {
    color: colors.primary,
    fontSize: normalize(20),
    paddingTop: normalize(4)
  },
  icon: {
    paddingHorizontal: normalize(8)
  },
  text: {
    color: colors.primary
  }
});
