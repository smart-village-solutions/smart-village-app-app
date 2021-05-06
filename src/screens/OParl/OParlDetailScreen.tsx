import React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import {
  HeaderLeft,
  LoadingContainer,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperWithOrientation
} from '../../components';
import { OParlComponent } from '../../components/oParl';
import { colors, texts } from '../../config';
import { useOParlQuery } from '../../hooks';
import { getOParlQuery } from '../../queries/OParl';

type Props = {
  navigation: NavigationScreenProp<never>;
};

export const OParlDetailScreen = ({ navigation }: Props) => {
  const oParlType = navigation.getParam('type');
  const id = navigation.getParam('id');

  console.log(id);

  const [query, queryName] = getOParlQuery(oParlType);

  const { data: queryData, loading, error } = useOParlQuery(query, {
    variables: { id }
  });

  const data = queryData?.[queryName]?.[0];

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  if (error || !data)
    return (
      <WrapperWithOrientation>
        <Wrapper>
          <RegularText center>{texts.errors.noData}</RegularText>
        </Wrapper>
      </WrapperWithOrientation>
    );

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <WrapperWithOrientation>
          <OParlComponent data={data} navigation={navigation} />
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

OParlDetailScreen.navigationOptions = ({ navigation }: Props) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};
