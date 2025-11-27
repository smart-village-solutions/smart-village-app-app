import { RouteProp } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import QRCode from 'react-native-qrcode-svg';

import { ActivityIndicator, RefreshControl } from 'react-native';
import {
  BoldText,
  Button,
  EmptyMessage,
  HeadlineText,
  LoadingSpinner,
  WalletTransactionList,
  Wrapper,
  WrapperRow,
  WrapperVertical,
  WrapperWrap
} from '../../components';
import { colors, device, Icon, normalize, texts } from '../../config';
import { fetchCardInfo } from '../../queries';
import { TCard } from '../../types';

type TCardInfo = {
  balanceAsCent: number;
  balanceAsEuro: string;
  code: string;
  codeFormated: string;
  expiringCreditAsEuro: string;
  expiringCreditTimeNice: string;
  transactions: TTransaction[];
};

export type TTransaction = {
  dealerName: string;
  timeNice: string;
  type: number;
  valueAsEuro: string;
};

export const WalletCardDetailScreen = ({
  route
}: {
  route: RouteProp<{ params: { card: TCard } }>;
}) => {
  const { card } = route.params;
  const { apiConnection, cardName, cardNumber, description, iconColor, iconName, type, pinCode } =
    card;

  const [isFirstLoading, setFirstLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [cardData, setCardData] = useState<TCardInfo | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCardDetails = async () => {
    try {
      const cardInformation = (await fetchCardInfo({
        apiConnection,
        cardNumber: cardNumber,
        cardPin: pinCode
      })) as TCardInfo;

      setCardData(cardInformation);
      setFirstLoading(false);
    } catch (error) {
      setFirstLoading(false);
      console.error('Error fetching card details:', error);
    }
  };

  useEffect(() => {
    fetchCardDetails();
  }, [apiConnection, cardNumber, pinCode]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCardDetails();
    setRefreshing(false);
  }, [apiConnection, cardNumber, pinCode]);

  if (isFirstLoading) {
    return <LoadingSpinner loading />;
  }

  if (!cardData) {
    return <EmptyMessage title="No card details available." />;
  }

  return (
    <WalletTransactionList
      items={cardData.transactions}
      ListFooterComponent={
        <WrapperWrap itemsCenter spaceAround center>
          <Button
            icon={<Icon.NamedIcon name="share" />}
            iconPosition="left"
            invert
            notFullWidth
            onPress={() => {
              // TODO: Implement backup functionality
              console.log('test');
            }}
            title={texts.wallet.detail.backup}
          />
          <Button
            icon={<Icon.NamedIcon name="trash" color={colors.error} />}
            iconPosition="left"
            invert
            notFullWidth
            onPress={() => {
              // TODO: Implement delete functionality
              console.log('test');
            }}
            title={texts.wallet.detail.deleteButton}
          />
        </WrapperWrap>
      }
      ListHeaderComponent={
        <>
          <Wrapper itemsCenter>
            <QRCode
              size={normalize(device.width - 32)}
              value={`${apiConnection.qrEndpoint}${cardData}`}
            />
          </Wrapper>

          <Wrapper>
            <Wrapper style={{ backgroundColor: colors.shadowRgba, borderRadius: normalize(8) }}>
              <WrapperRow spaceBetween itemsCenter>
                <BoldText small>Code</BoldText>
                <BoldText small>{cardNumber.match(/.{1,4}/g)?.join('-')}</BoldText>
              </WrapperRow>

              <WrapperVertical noPaddingBottom>
                <WrapperRow spaceBetween itemsCenter>
                  <BoldText small>Pin</BoldText>
                  <BoldText small>{pinCode}</BoldText>
                </WrapperRow>
              </WrapperVertical>

              <WrapperVertical noPaddingBottom>
                <WrapperRow spaceBetween itemsCenter>
                  <BoldText small>Guthaben</BoldText>
                  <BoldText primary big>
                    {cardData.balanceAsEuro} EUR
                  </BoldText>
                </WrapperRow>
              </WrapperVertical>

              <WrapperVertical noPaddingBottom>
                <Button
                  icon={
                    isLoading ? (
                      <ActivityIndicator />
                    ) : (
                      <Icon.NamedIcon name="refresh" color={colors.surface} />
                    )
                  }
                  iconPosition="left"
                  onPress={async () => {
                    setIsLoading(true);
                    await fetchCardDetails();
                    setIsLoading(false);
                  }}
                  title={texts.wallet.detail.updateBalance}
                />
              </WrapperVertical>
            </Wrapper>

            <WrapperVertical noPaddingBottom>
              <HeadlineText>Ihre letzten 10 Buchungen</HeadlineText>
            </WrapperVertical>
          </Wrapper>
        </>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          colors={[colors.refreshControl]}
          tintColor={colors.refreshControl}
        />
      }
    />
  );
};
