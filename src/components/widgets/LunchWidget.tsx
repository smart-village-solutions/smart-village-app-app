import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { colors, normalize, texts } from '../../config';
import { lunch } from '../../icons';
import { Icon } from '../Icon';
import { BoldText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow } from '../Wrapper';

type Props = {
  navigation: NavigationScreenProp<never>;
};

export const LunchWidget = ({ navigation }: Props) => {
  // const { isConnected, isMainserverUp } = useContext(NetworkContext);

  // const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

  // const { data, loading } = useQuery(getQuery(QUERY_TYPES.LUNCH), {
  //   fetchPolicy,
  //   variables: queryVariables
  // });

  const onPress = useCallback(
    () => navigation.navigate('Lunch', { title: texts.homeTitles.lunch }),
    [navigation]
  );

  return (
    <Touchable onPress={onPress}>
      <Wrapper>
        <WrapperRow center>
          <Icon style={styles.icon} xml={lunch(colors.primary)} />
          <BoldText primary big>
            0
          </BoldText>
        </WrapperRow>
        <BoldText primary small>
          {texts.homeTitles.lunch}
        </BoldText>
      </Wrapper>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(8)
  }
});
