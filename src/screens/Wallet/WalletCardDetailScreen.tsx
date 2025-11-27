import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {
  BoldText,
  Button,
  EmptyMessage,
  HeadlineText,
  LoadingSpinner,
  Modal,
  RegularText,
  WalletTransactionList,
  Wrapper,
  WrapperRow,
  WrapperVertical,
  WrapperWrap
} from '../../components';
import { colors, device, Icon, normalize, texts } from '../../config';
import { deleteCardByNumber } from '../../helpers';
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
  navigation,
  route
}: {
  navigation: StackNavigationProp<Record<string, any>>;
  route: RouteProp<{ params: { card: TCard } }>;
}) => {
  const { card } = route.params;
  const { apiConnection, cardNumber, pinCode } = card;

  const [isFirstLoading, setFirstLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [cardData, setCardData] = useState<TCardInfo | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFullScreenQR, setIsFullScreenQR] = useState(false);

  const fetchCardDetails = useCallback(async () => {
    try {
      const cardInformation = (await fetchCardInfo({
        apiConnection,
        cardNumber,
        cardPin: pinCode
      })) as TCardInfo;

      setCardData(cardInformation);
      setFirstLoading(false);
    } catch (error) {
      setFirstLoading(false);
      console.error('Error fetching card details:', error);
    }
  }, [apiConnection, cardNumber, pinCode]);

  useEffect(() => {
    fetchCardDetails();
  }, [fetchCardDetails]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCardDetails();
    setRefreshing(false);
  }, [fetchCardDetails]);

  if (isFirstLoading) {
    return <LoadingSpinner loading />;
  }

  if (!cardData) {
    return <EmptyMessage title={texts.wallet.detail.noCardsAvailable} />;
  }

  const listItem = [...cardData.transactions];

  return (
    <>
      <WalletTransactionList
        items={listItem}
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
              onPress={() => setIsModalVisible(true)}
              title={texts.wallet.detail.deleteButton}
            />
          </WrapperWrap>
        }
        ListHeaderComponent={
          <>
            <Wrapper itemsCenter>
              <TouchableOpacity onPress={() => setIsFullScreenQR(true)}>
                <QRCode
                  size={normalize(device.width - 32)}
                  value={`${apiConnection.qrEndpoint}${cardNumber}`}
                />
              </TouchableOpacity>
            </Wrapper>

            <Wrapper>
              <Wrapper style={{ backgroundColor: colors.shadowRgba, borderRadius: normalize(8) }}>
                <WrapperRow spaceBetween itemsCenter>
                  <BoldText small>{texts.wallet.detail.code}</BoldText>
                  <BoldText small>{cardNumber.match(/.{1,4}/g)?.join('-')}</BoldText>
                </WrapperRow>

                <WrapperVertical noPaddingBottom>
                  <WrapperRow spaceBetween itemsCenter>
                    <BoldText small>{texts.wallet.detail.pin}</BoldText>
                    <BoldText small>{pinCode}</BoldText>
                  </WrapperRow>
                </WrapperVertical>

                <WrapperVertical noPaddingBottom>
                  <WrapperRow spaceBetween itemsCenter>
                    <BoldText small>{texts.wallet.detail.balance}</BoldText>
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
                <HeadlineText>{texts.wallet.detail.lastTransactions}</HeadlineText>
              </WrapperVertical>
            </Wrapper>
          </>
        }
        refreshControl={
          <RefreshControl
            colors={[colors.refreshControl]}
            onRefresh={refresh}
            refreshing={refreshing}
            tintColor={colors.refreshControl}
          />
        }
      />

      <Modal
        closeButton={
          <Button
            invert
            onPress={() => setIsModalVisible(false)}
            title={texts.wallet.detail.cancel}
          />
        }
        isBackdropPress={false}
        isListView={false}
        isVisible={isModalVisible}
        onModalVisible={() => setIsModalVisible(false)}
      >
        <Wrapper itemsCenter style={[styles.iconContainer, { backgroundColor: colors.errorRgba }]}>
          <Icon.NamedIcon name="info-circle" size={normalize(30)} color={colors.error} />
        </Wrapper>

        <Wrapper itemsCenter>
          <BoldText>{texts.wallet.detail.deleteConfirmationTitle}</BoldText>
          <WrapperVertical>
            <RegularText center>
              {texts.wallet.detail.deleteConfirmationMessage(cardData.balanceAsEuro)}
            </RegularText>
          </WrapperVertical>
        </Wrapper>

        <Button
          onPress={async () => {
            await deleteCardByNumber(cardNumber);
            navigation.pop();
          }}
          title={texts.wallet.detail.deleteAnywayButton}
        />
      </Modal>

      <Modal
        closeButton={
          <TouchableOpacity
            onPress={() => setIsFullScreenQR(false)}
            style={styles.qrOverlayCloseButton}
          >
            <Icon.Close />
            <RegularText primary>{texts.wallet.detail.close}</RegularText>
          </TouchableOpacity>
        }
        isBackdropPress={true}
        isListView={false}
        isVisible={isFullScreenQR}
        onModalVisible={() => setIsFullScreenQR(false)}
        overlayStyle={styles.qrOverlayContainer}
      >
        <Wrapper itemsCenter>
          <QRCode
            size={normalize(device.width - 32)}
            value={`${apiConnection.qrEndpoint}${cardNumber}`}
          />

          <Wrapper itemsCenter>
            <WrapperRow>
              <RegularText center small>
                {texts.wallet.detail.couponNumber}:{' '}
              </RegularText>
              <BoldText small>{cardNumber}</BoldText>
            </WrapperRow>

            <WrapperRow>
              <RegularText center small>
                {texts.wallet.detail.pin}:{' '}
              </RegularText>
              <BoldText small>{pinCode}</BoldText>
            </WrapperRow>
          </Wrapper>
        </Wrapper>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignSelf: 'center',
    borderRadius: normalize(50)
  },
  qrOverlayContainer: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%'
  },
  qrOverlayCloseButton: {
    flexDirection: 'row',
    left: normalize(20),
    position: 'absolute',
    top: normalize(70)
  }
});
