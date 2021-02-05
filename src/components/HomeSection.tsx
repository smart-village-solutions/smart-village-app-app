import React, { useContext } from 'react';
import { QueryHookOptions, useQuery } from 'react-apollo';
import { ActivityIndicator, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { colors, consts, device } from '../config';
import { parseListItemsFromQuery } from '../helpers';
import { getQuery } from '../queries';
import { SettingsContext } from '../SettingsProvider';
import { Button } from './Button';
import { ListComponent } from './ListComponent';
import { LoadingContainer } from './LoadingContainer';
import { Title, TitleContainer, TitleShadow } from './Title';
import { Touchable } from './Touchable';
import { Wrapper } from './Wrapper';

type Props = {
  categoryTitle: string;
  categoryTitleDetail?: string;
  categoryButton: string;
  fetchPolicy:
    | 'cache-first'
    | 'network-only'
    | 'cache-only'
    | 'no-cache'
    | 'standby'
    | 'cache-and-network';
  navigateToCategory: () => void;
  navigation: NavigationScreenProp<never>;
  query: string;
  queryParser?: (data: unknown) => unknown[];
  queryVariables: QueryHookOptions;
};

export const HomeSection = ({
  categoryButton,
  categoryTitle,
  categoryTitleDetail,
  fetchPolicy,
  navigateToCategory,
  navigation,
  query,
  queryParser,
  queryVariables
}: Props) => {
  const { listTypesSettings } = useContext(SettingsContext);
  const listType = listTypesSettings[query];

  const { data, loading } = useQuery(getQuery(query), { variables: queryVariables, fetchPolicy });

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const items =
    queryParser?.(data) ?? parseListItemsFromQuery(query, data, true, categoryTitleDetail ?? '');

  if (!items || !items.length) return null;

  return (
    <>
      <TitleContainer>
        <Touchable onPress={navigateToCategory}>
          <Title accessibilityLabel={`${categoryTitle} (Überschrift) (Taste)`}>
            {categoryTitle}
          </Title>
        </Touchable>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}

      <View>
        <ListComponent
          navigation={navigation}
          data={items}
          query={query}
          horizontal={listType === consts.LIST_TYPES.CARD_LIST}
        />

        <Wrapper>
          <Button title={categoryButton} onPress={navigateToCategory} />
        </Wrapper>
      </View>
    </>
  );
};
