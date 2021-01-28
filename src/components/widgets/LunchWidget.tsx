import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { colors, texts } from '../../config';
import { lunch } from '../../icons';
import { DefaultWidget } from './DefaultWidget';

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

  const onPress = useCallback(() => navigation.navigate('Lunch', { title: texts.widgets.lunch }), [
    navigation
  ]);

  return (
    <DefaultWidget
      icon={lunch(colors.primary)}
      number={0}
      onPress={onPress}
      text={texts.widgets.lunch}
    />
  );
};
