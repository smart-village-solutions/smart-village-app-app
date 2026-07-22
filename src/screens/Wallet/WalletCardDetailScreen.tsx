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
import { BarcodeCreatorView, BarcodeFormat } from 'react-native-barcode-creator';
import { Divider } from 'react-native-elements';
import ViewShot from 'react-native-view-shot';

import {
  BoldText,
  Button,
  ButtonVariants,
  EmptyMessage,
  HeadlineText,
  Image,
  LiveClock,
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
import { device, Icon, normalize, texts } from '../../config';
import { deleteCardByNumber } from '../../helpers';
import { useTheme } from '../../hooks/useTheme';
import { fetchCardInfo } from '../../queries';
import { CardType, TCard, TCardInfo } from '../../types';

const ShareableCard = ({
  apiConnection,
  cardNumber,
  cardType,
  pinCode,
  serverCardType
}: {
  apiConnection: { qrEndpoint: string };
  cardNumber: string;
  cardType: CardType;
  pinCode?: string;
  serverCardType?: TCard;
}) => {
  const { colors } = useTheme();
  const { barcodeFormat = 'QR' } = serverCardType ?? {};

  return (
    <Wrapper itemsCenter style={{ backgroundColor: colors.surface }}>
      <BarcodeCreatorView
        background={colors.surface}
        foregroundColor={colors.darkText}
        style={barcodeFormat === 'CODE128' ? styles.barcode : styles.qrCode}
        format={BarcodeFormat[barcodeFormat]}
        value={`${apiConnection.qrEndpoint}${cardNumber}`}
      />

      <Wrapper itemsCenter>
        <WrapperRow>
          <RegularText center small>
            {cardType === CardType.BONUS
              ? texts.wallet.detail.bonusNumber
              : texts.wallet.detail.couponNumber}
            :{' '}
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
  route: RouteProp<{ params: { savedCard: TCard; serverCardType?: TCard } }>;
}) => {
  const { colors } = useTheme();
  const { savedCard, serverCardType } = route.params;
  const { apiConnection, cardName, cardNumber, pinCode, title, type: cardType } = savedCard;
  const {
    barcodeFormat = 'QR',
    iconBackgroundColor,
    imageStyle,
    imageUrl,
    showClockWithAnimation = false,
    showLiveClock = false
  } = serverCardType as TCard;
  const [isFirstLoading, setFirstLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [cardData, setCardData] = useState<TCard | TCardInfo>(savedCard);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFullScreenCode, setIsFullScreenCode] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPinVisible, setIsPinVisible] = useState(false);

  // Ref to access the ViewShot instance for capturing the card as an image
  const viewShotRef = useRef<ViewShot | null>(null);

  const fetchCardDetails = useCallback(async () => {
    try {
      const cardInformation = (await fetchCardInfo({
        apiConnection,
        cardNumber,
        cardPin: pinCode
      })) as TCardInfo;

      setCardData(cardInformation);
    } catch (error) {
      console.error('Error fetching card details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiConnection, cardNumber, pinCode]);

  const handleShare = async () => {
    const fileUri = `${FileSystem.cacheDirectory}${cardName ? cardName : title}.png`;

    try {
      setIsCapturing(true);

      // Wait for ViewShot to mount
      await new Promise((resolve) => setTimeout(resolve, 50));

      const base64 = await viewShotRef?.current?.capture();

      if (!base64) {
        throw new Error('Failed to capture wallet card image');
      }

      // as URL sharing is not possible on Android, we need to save the file. On iOS, direct sharing of base64 data is supported
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64
      });

      await Sharing.shareAsync(fileUri);
    } catch (e) {
      console.error(e);
      Alert.alert(texts.wallet.detail.errorTitle, texts.wallet.detail.shareErrorMessage);
    } finally {
      setIsCapturing(false);

      // Clean up the temporary file
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadInitialCardDetails = async () => {
      setFirstLoading(true);
      await fetchCardDetails();

      if (isActive) {
        setFirstLoading(false);
      }
    };

    if (cardType === CardType.COUPON) {
      loadInitialCardDetails();
    } else {
      setFirstLoading(false);
    }

    return () => {
      isActive = false;
    };
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
          cardType === CardType.COUPON &&
          cardData &&
          'transactions' in cardData &&
          !!cardData.transactions?.length
            ? cardData.transactions.slice(0, 10)
            : []
        }
        ListFooterComponent={
          <>
            {!!cardData?.balanceAsEuro && (
              <Wrapper noPaddingTop>
                <Divider />

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
            )}

            <Wrapper noPaddingTop>
              <Wrapper style={{ backgroundColor: colors.shadowRgba, borderRadius: normalize(8) }}>
                {!!cardNumber && (
                  <WrapperRow spaceBetween itemsCenter>
                    <BoldText small>{texts.wallet.detail.code}</BoldText>
                    <BoldText small>
                      {cardType === CardType.COUPON
                        ? cardNumber.match(/.{1,4}/g)?.join('-')
                        : cardNumber}
                    </BoldText>
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
              </Wrapper>
            </Wrapper>

            <WrapperWrap itemsCenter spaceAround center>
              <Button
                icon={<Icon.NamedIcon name="share" />}
                iconPosition="left"
                invert
                notFullWidth
                onPress={handleShare}
                title={texts.wallet.detail.share}
              />
              <Button
                icon={<Icon.NamedIcon name="trash" color={colors.error} />}
                iconPosition="left"
                invert
                notFullWidth
                onPress={() => setIsModalVisible(true)}
                title={texts.wallet.detail.deleteButton}
                variant={ButtonVariants.DELETE}
              />
            </WrapperWrap>
          </>
        }
        ListHeaderComponent={
          <>
            {showLiveClock && <LiveClock withAnimatedSeconds={showClockWithAnimation} />}

            {!!cardNumber && (
              <Wrapper itemsCenter noPaddingBottom>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.barcodeButton, { backgroundColor: iconBackgroundColor }]}
                  onPress={() => setIsFullScreenCode(true)}
                  accessibilityLabel={texts.wallet.detail.expandCode}
                  accessibilityRole="button"
                >
                  <BarcodeCreatorView
                    background={iconBackgroundColor}
                    foregroundColor={colors.darkText}
                    format={BarcodeFormat[barcodeFormat]}
                    style={cardType === CardType.BONUS ? styles.barcode : styles.qrCode}
                    value={`${apiConnection.qrEndpoint}${cardNumber}`}
                  />

                  {cardType === CardType.BONUS && (
                    <RegularText center small>
                      {cardNumber}
                    </RegularText>
                  )}
                </TouchableOpacity>
              </Wrapper>
            )}

            {!!imageUrl && (
              <Wrapper noPaddingTop>
                <View style={{ backgroundColor: iconBackgroundColor }}>
                  <Image
                    resizeMode="contain"
                    source={{ uri: imageUrl }}
                    style={[styles.image, imageStyle]}
                  />
                </View>
              </Wrapper>
            )}

            {!!cardData?.balanceAsEuro && (
              <Wrapper noPaddingBottom>
                <HeadlineText>{texts.wallet.detail.lastTransactions}</HeadlineText>
              </Wrapper>
            )}
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
          {cardType === CardType.COUPON && cardData?.balanceAsEuro != null && (
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
          variant={ButtonVariants.DELETE}
        />
      </Modal>

      <Modal
        closeButton={
          <TouchableOpacity
            onPress={() => setIsFullScreenCode(false)}
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
        isVisible={isFullScreenCode}
        onModalVisible={() => setIsFullScreenCode(false)}
        overlayStyle={styles.qrOverlayContainer}
      >
        <Wrapper>
          <LiveClock withAnimatedSeconds={showClockWithAnimation} />

          <ShareableCard
            apiConnection={apiConnection}
            cardNumber={cardNumber}
            cardType={cardType}
            serverCardType={serverCardType}
          />
        </Wrapper>
      </Modal>

      {isCapturing && (
        <View style={styles.hiddenCaptureContainer}>
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9, result: 'base64' }}>
            <ShareableCard
              apiConnection={apiConnection}
              cardNumber={cardNumber}
              cardType={cardType}
              pinCode={pinCode}
              serverCardType={serverCardType}
            />
          </ViewShot>
        </View>
      )}
    </>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  barcode: {
    height: device.width / normalize(2),
    width: device.width - normalize(16)
  },
  barcodeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
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
  image: {
    width: '100%',
    height: normalize(360),
    alignSelf: 'center'
  },
  qrCode: {
    height: device.width - normalize(16),
    width: device.width - normalize(16)
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
