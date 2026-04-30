import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { QUERY_TYPES } from '../../queries';
import { ListComponent } from '../ListComponent';
import { TCard } from '../../types';

type WalletListProps = {
  items: TCard[];
  ListEmptyComponent?: React.ReactNode;
  ListFooterComponent?: () => React.ReactNode;
  ListHeaderComponent?: React.ReactNode;
  refreshControl?: React.ReactNode;
};

export const WalletList = ({
  items,
  ListEmptyComponent,
  ListFooterComponent,
  ListHeaderComponent,
  refreshControl
}: WalletListProps) => {
  const navigation = useNavigation<StackNavigationProp<Record<string, any>>>();

  return (
    <ListComponent
      data={items}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      ListHeaderComponent={ListHeaderComponent}
      navigation={navigation}
      query={QUERY_TYPES.WALLET}
      refreshControl={refreshControl}
    />
  );
};
