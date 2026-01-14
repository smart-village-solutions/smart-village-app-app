import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';

import {
  BoldText,
  Button,
  ButtonVariants,
  EmptyMessage,
  HeadlineText,
  LoadingSpinner,
  Modal,
  RegularText,
  Touchable,
  WalletTransactionList,
  Wrapper,
  WrapperRow,
  WrapperVertical,
  WrapperWrap
} from '../../components';
import { colors, device, Icon, normalize, texts } from '../../config';
import { deleteCardByNumber } from '../../helpers';
import { fetchCardInfo } from '../../queries';
import { ECardType, TCard, TCardInfo } from '../../types';

const ShareableCard = ({
  apiConnection,
  cardNumber,
  pinCode
}: {
  apiConnection: { qrEndpoint: string };
  cardNumber: string;
  pinCode?: string;
}) => {
  return (
    <Wrapper itemsCenter>
      <QRCode
        size={normalize(device.width - 64)}
        value={`${apiConnection.qrEndpoint}${cardNumber}`}
      />

      <Wrapper itemsCenter>
        <WrapperRow>
          <RegularText center small>
            {texts.wallet.detail.couponNumber}:{' '}
          </RegularText>
          <BoldText small>{cardNumber}</BoldText>
        </WrapperRow>

        {!!pinCode && (
          <WrapperRow>
            <RegularText center small>
              {texts.wallet.detail.pin}:{' '}
            </RegularText>
            <BoldText small>{pinCode}</BoldText>
          </WrapperRow>
        )}
      </Wrapper>
    </Wrapper>
  );
};

/* eslint-disable complexity */
export const WalletCardDetailScreen = ({
  navigation,
  route
}: {
  navigation: StackNavigationProp<Record<string, any>>;
  route: RouteProp<{ params: { card: TCard } }>;
}) => {
  const { card } = route.params;
  const { apiConnection, cardName, cardNumber, pinCode, title, type: cardType } = card;
  const [isFirstLoading, setFirstLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [cardData, setCardData] = useState<TCard | TCardInfo>(card);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFullScreenQR, setIsFullScreenQR] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPinVisible, setIsPinVisible] = useState(false);

  const viewShotRef = useRef();

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

  const handleShare = async () => {
    try {
      setIsCapturing(true);

      // Wait for ViewShot to mount
      setTimeout(async () => {
        const base64 = await viewShotRef?.current?.capture();
        const fileUri = `${FileSystem.cacheDirectory}${cardName ? cardName : title}.png`;

        // as URL sharing is not possible on Android, we need to save the file. On iOS, direct sharing of base64 data is supported
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64
        });

        await Sharing.shareAsync(fileUri);
        setIsCapturing(false);

        // Clean up the temporary file
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      }, 50);
    } catch (e) {
      console.error(e);
      Alert.alert(texts.wallet.detail.errorTitle, texts.wallet.detail.shareErrorMessage);
      setIsCapturing(false);
    }
  };

  useEffect(() => {
    if (cardType === ECardType.COUPON) {
      fetchCardDetails();
    } else {
      setFirstLoading(false);
    }
  }, [cardType, fetchCardDetails]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCardDetails();
    setRefreshing(false);
  }, [fetchCardDetails]);

  if (isFirstLoading) {
    return <LoadingSpinner loading />;
  }

  if (!Object.keys(cardData || {})?.length) {
    return <EmptyMessage title={texts.wallet.detail.noCardsAvailable} />;
  }

  return (
    <>
      <WalletTransactionList
        items={
          cardType === ECardType.COUPON && !!cardData?.transactions?.length
            ? cardData.transactions.slice(0, 10)
            : []
        }
        ListFooterComponent={
          <WrapperWrap itemsCenter spaceAround center>
            <Button
              icon={<Icon.NamedIcon name="share" />}
              iconPosition="left"
              invert
              notFullWidth
              onPress={handleShare}
              title={texts.wallet.detail.backup}
            />
            <Button
              icon={<Icon.NamedIcon name="trash" color={colors.error} />}
              iconPosition="left"
              invert
              notFullWidth
              onPress={() => setIsModalVisible(true)}
              title={texts.wallet.detail.deleteButton}
              variants={ButtonVariants.DELETE}
            />
          </WrapperWrap>
        }
        ListHeaderComponent={
          <>
            {!!cardNumber && (
              <Wrapper itemsCenter>
                <TouchableOpacity
                  onPress={() => setIsFullScreenQR(true)}
                  accessibilityLabel={texts.wallet.detail.expandQrCode}
                  accessibilityRole="button"
                >
                  <QRCode
                    size={normalize(device.width - 64)}
                    value={`${apiConnection.qrEndpoint}${cardNumber}`}
                  />
                </TouchableOpacity>
              </Wrapper>
            )}

            <Wrapper>
              <Wrapper style={{ backgroundColor: colors.shadowRgba, borderRadius: normalize(8) }}>
                {!!cardNumber && (
                  <WrapperRow spaceBetween itemsCenter>
                    <BoldText small>{texts.wallet.detail.code}</BoldText>
                    <BoldText small>{cardNumber.match(/.{1,4}/g)?.join('-')}</BoldText>
                  </WrapperRow>
                )}

                {!!pinCode && (
                  <WrapperVertical noPaddingBottom>
                    <WrapperRow spaceBetween itemsCenter>
                      <BoldText small>{texts.wallet.detail.pin}</BoldText>

                      <WrapperRow itemsCenter>
                        <BoldText small>{isPinVisible ? pinCode : '***'}</BoldText>
                        <Touchable
                          accessibilityLabel={
                            isPinVisible
                              ? texts.wallet.detail.togglePinHide
                              : texts.wallet.detail.togglePinShow
                          }
                          accessibilityRole="button"
                          onPress={() => setIsPinVisible((prev) => !prev)}
                          style={{ paddingLeft: normalize(8) }}
                        >
                          <Icon.NamedIcon
                            name={isPinVisible ? 'eye-off' : 'eye'}
                            color={colors.darkText}
                          />
                        </Touchable>
                      </WrapperRow>
                    </WrapperRow>
                  </WrapperVertical>
                )}

                {!!cardData?.balanceAsEuro && (
                  <WrapperVertical noPaddingBottom>
                    <WrapperRow spaceBetween itemsCenter>
                      <BoldText small>{texts.wallet.detail.balance}</BoldText>
                      <BoldText primary big>
                        {cardData.balanceAsEuro} EUR
                      </BoldText>
                    </WrapperRow>
                  </WrapperVertical>
                )}

                {cardType === ECardType.COUPON && (
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
                )}
              </Wrapper>

              {cardType === ECardType.COUPON && (
                <WrapperVertical noPaddingBottom>
                  <HeadlineText>{texts.wallet.detail.lastTransactions}</HeadlineText>
                </WrapperVertical>
              )}
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
          {cardType === ECardType.COUPON && cardData?.balanceAsEuro && (
            <WrapperVertical>
              <RegularText center>
                {texts.wallet.detail.deleteConfirmationMessage(cardData?.balanceAsEuro)}
              </RegularText>
            </WrapperVertical>
          )}
        </Wrapper>

        <Button
          onPress={async () => {
            try {
              await deleteCardByNumber(cardNumber);
              navigation.pop();
            } catch (error) {
              Alert.alert(texts.wallet.detail.errorTitle, texts.wallet.detail.deleteErrorMessage);
              console.error('Error deleting card:', error);
            }
          }}
          title={texts.wallet.detail.deleteAnywayButton}
          variants={ButtonVariants.DELETE}
        />
      </Modal>

      <Modal
        closeButton={
          <TouchableOpacity
            onPress={() => setIsFullScreenQR(false)}
            style={styles.qrOverlayCloseButton}
            accessibilityLabel={texts.wallet.detail.close}
            accessibilityRole="button"
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
        <Wrapper>
          <ShareableCard apiConnection={apiConnection} cardNumber={cardNumber} />
        </Wrapper>
      </Modal>

      {isCapturing && (
        <View style={styles.hiddenCaptureContainer}>
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9, result: 'base64' }}>
            <ShareableCard
              apiConnection={apiConnection}
              cardNumber={cardNumber}
              pinCode={pinCode}
            />
          </ViewShot>
        </View>
      )}
    </>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  hiddenCaptureContainer: {
    position: 'absolute',
    top: -9999,
    left: -9999,
    opacity: 0
  },
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
    alignItems: 'center',
    flexDirection: 'row',
    left: normalize(20),
    position: 'absolute',
    top: normalize(70)
  }
});
