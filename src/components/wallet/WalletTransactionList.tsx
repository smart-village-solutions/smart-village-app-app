import React from 'react';
import { FlatList } from 'react-native';
import { Divider } from 'react-native-elements';

import { TTransaction } from '../../types';
import { BoldText, RegularText } from '../Text';
import { WrapperHorizontal, WrapperRow, WrapperVertical } from '../Wrapper';

type WalletListProps = {
  items: TTransaction[];
  ListEmptyComponent?: React.ReactNode;
  ListFooterComponent?: React.ReactNode;
  ListHeaderComponent?: React.ReactNode;
  refreshControl?: React.ReactNode;
};
export const WalletTransactionList = ({
  items,
  ListEmptyComponent,
  ListFooterComponent,
  ListHeaderComponent,
  refreshControl
}: WalletListProps) => {
  return (
    <FlatList
      data={items}
      keyExtractor={(item, index) => `item${item.dealerName}-index${index}`}
      renderItem={({ item, index }) => {
        const { dealerName, timeNice, type, valueAsEuro } = item;

        return (
          <WrapperHorizontal>
            <WrapperVertical>
              <RegularText smallest>{timeNice}</RegularText>

              <WrapperRow spaceBetween>
                <BoldText>{dealerName}</BoldText>
                <BoldText primary={type === 100} error={type === 200}>
                  {type === 200 ? '-' : type === 100 ? '+' : ''}
                  {valueAsEuro}
                </BoldText>
              </WrapperRow>
            </WrapperVertical>

            {index !== items.length - 1 && <Divider />}
          </WrapperHorizontal>
        );
      }}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      ListHeaderComponent={ListHeaderComponent}
      refreshControl={refreshControl}
    />
  );
};
