import React, { useCallback, useContext, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';

import {
  EmptyMessage,
  HeadlineText,
  LoadingSpinner,
  WalletList,
  Wrapper,
  WrapperVertical
} from '../../components';
import { colors, Icon, normalize, texts } from '../../config';
import { useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { ScreenName, TCard } from '../../types';

export const WalletCardsListScreen = () => {
  const { isConnected } = useContext(NetworkContext);

  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, refetch } = useStaticContent<TCard[]>({
    refreshTimeKey: 'publicJsonFile-walletCardTypes',
    name: 'walletCardTypes',
    type: 'json'
  });

  const refresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) {
      await refetch();
    }
    setRefreshing(false);
  }, [isConnected, refetch]);

  if (loading) {
    return <LoadingSpinner loading />;
  }

  const listItem = (data || []).map((card: TCard) => {
    const {
      description = '',
      iconBackgroundColor = colors.lighterPrimaryRgba,
      iconColor = colors.primary,
      iconName = 'credit-card',
      type = ''
    } = card;

    return {
      leftIcon: (
        <Wrapper style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
          <Icon.NamedIcon name={iconName} color={iconColor} />
        </Wrapper>
      ),
      params: { card },
      routeName: ScreenName.WalletCardAdd,
      subtitle: description,
      title: type
    };
  });

  return (
    <WalletList
      items={listItem}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          colors={[colors.refreshControl]}
          tintColor={colors.refreshControl}
        />
      }
      ListEmptyComponent={<EmptyMessage title={texts.wallet.add.noCardsAvailable} />}
      ListHeaderComponent={
        <WrapperVertical>
          <HeadlineText>{texts.wallet.add.selectCardType}</HeadlineText>
        </WrapperVertical>
      }
    />
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignSelf: 'center',
    borderRadius: normalize(50)
  }
});
