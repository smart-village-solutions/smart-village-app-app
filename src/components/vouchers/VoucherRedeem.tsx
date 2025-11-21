import { randomUUID as uuid } from 'expo-crypto';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';

import { Icon, colors, normalize, texts } from '../../config';
import { addToStore, readFromStore } from '../../helpers';
import { VOUCHER_DEVICE_TOKEN, VOUCHER_TRANSACTIONS } from '../../helpers/voucherHelper';
import { useVoucher } from '../../hooks';
import { REDEEM_QUOTA_OF_VOUCHER } from '../../queries/vouchers';
import { TQuota, TVoucherDates } from '../../types';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow, WrapperVertical } from '../Wrapper';

const defaultTime = 15 * 60; // 15 minutes in seconds

/* eslint-disable complexity */
export const VoucherRedeem = ({
  dates,
  quota,
  voucherId
}: {
  dates: TVoucherDates[];
  quota: TQuota;
  voucherId: string;
}) => {
  const { isLoggedIn, memberId } = useVoucher();
  const [isVisible, setIsVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(defaultTime);
  const [isRedeemingVoucher, setIsRedeemingVoucher] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isRedeemedVoucher, setIsRedeemedVoucher] = useState(false);
  const [redeemStartTime, setRedeemStartTime] = useState<number | null>(null);
  const [isAvailableVoucher, setIsAvailableVoucher] = useState(false);
  const [isExpiredVoucher, setIsExpiredVoucher] = useState(false);

  const { availableQuantityForMember = 0, availableQuantity = 0 } = quota;

  const localRedeemedVoucherCheck = async () => {
    const voucherTransactions = (await readFromStore(VOUCHER_TRANSACTIONS)) || [];

    if (voucherTransactions.length) {
      const isRedeemed = voucherTransactions.some(
        (transaction) => transaction.voucherId === voucherId && transaction.memberId === memberId
      );

      setIsRedeemedVoucher(isRedeemed);
    }
  };

  useEffect(() => {
    // check with dates?.[0]?.dateStart and dates?.[0]?.dateEnd against now to see if it is outdated and does not start in future
    const isInTime =
      moment(dates?.[0]?.dateStart).startOf('day').isBefore(moment()) &&
      moment(dates?.[0]?.dateEnd).endOf('day').isAfter(moment());
    const hasAvailableQuantity = availableQuantity !== 0;
    const hasNoAvailableQuantityForMember = availableQuantityForMember === 0;

    setIsAvailableVoucher(isInTime && hasAvailableQuantity);

    if (hasNoAvailableQuantityForMember) {
      setIsRedeemedVoucher(true);
    }

    localRedeemedVoucherCheck();
  }, [availableQuantity, availableQuantityForMember, memberId]);

  const [redeemQuotaOfVoucher] = useMutation(REDEEM_QUOTA_OF_VOUCHER);

  useEffect(() => {
    if (isRedeemingVoucher && redeemStartTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - redeemStartTime) / 1000);
        const newRemainingTime = defaultTime - elapsedSeconds;

        if (newRemainingTime > 0) {
          setRemainingTime(newRemainingTime);
        } else {
          setRemainingTime(0);
          setIsExpiredVoucher(true);
          clearInterval(interval);
        }
      }, 1000); // update every second

      return () => clearInterval(interval);
    } else if (!isRedeemingVoucher) {
      setRemainingTime(defaultTime);
      setRedeemStartTime(null);
    }
  }, [isRedeemingVoucher, redeemStartTime]);

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const redeemVoucher = async () => {
    let deviceToken = await readFromStore(VOUCHER_DEVICE_TOKEN);

    if (!deviceToken) {
      deviceToken = uuid();
      addToStore(VOUCHER_DEVICE_TOKEN, deviceToken);
    }

    try {
      await redeemQuotaOfVoucher({
        variables: {
          deviceToken,
          quantity,
          voucherId,
          memberId
        }
      });
    } catch (error) {
      const voucherTransactions = (await readFromStore(VOUCHER_TRANSACTIONS)) || [];
      const voucherTransaction = {
        deviceToken,
        quantity,
        voucherId,
        memberId,
        createdAt: new Date().toISOString()
      };

      addToStore(VOUCHER_TRANSACTIONS, [...voucherTransactions, voucherTransaction]);

      console.error(error);
    } finally {
      setIsRedeemedVoucher(true);
      setIsRedeemingVoucher(true);
      setRedeemStartTime(Date.now());
    }
  };

  const isButtonDisabled =
    !isLoggedIn || !memberId || !isAvailableVoucher || isExpiredVoucher || isRedeemedVoucher;
  const buttonTitle =
    isExpiredVoucher || !isAvailableVoucher
      ? texts.voucher.detailScreen.isNotAvailable
      : isRedeemedVoucher
      ? texts.voucher.detailScreen.redeemed
      : texts.voucher.detailScreen.redeem;

  return (
    <>
      <Button disabled={isButtonDisabled} title={buttonTitle} onPress={() => setIsVisible(true)} />

      <Modal
        animationType="none"
        transparent
        visible={isVisible}
        supportedOrientations={['landscape', 'portrait']}
      >
        <View style={styles.sheetBackgroundContainer}>
          <View style={styles.sheetContainer}>
            {isExpiredVoucher ? (
              <WrapperVertical>
                <Wrapper>
                  <BoldText lightest>{texts.voucher.detailScreen.redeemErrorTitle}</BoldText>
                </Wrapper>

                <Wrapper style={[styles.progressContainer, styles.expiredViewContainer]}>
                  <Icon.Close size={normalize(120)} color={colors.surface} />
                  <RegularText lightest>
                    {texts.voucher.detailScreen.redeemErrorDescription}
                  </RegularText>
                </Wrapper>

                <Wrapper noPaddingBottom>
                  <Touchable
                    onPress={() => {
                      setIsVisible(false);
                      setIsRedeemingVoucher(false);
                      setIsExpiredVoucher(false);
                      setIsChecked(false);
                    }}
                  >
                    <BoldText small center underline lightest>
                      {texts.voucher.detailScreen.close}
                    </BoldText>
                  </Touchable>
                </Wrapper>
              </WrapperVertical>
            ) : isRedeemingVoucher ? (
              <WrapperVertical>
                <Wrapper>
                  <BoldText lightest>{texts.voucher.detailScreen.redeemTitle}</BoldText>
                </Wrapper>

                <Wrapper noPaddingTop>
                  <RegularText lightest>{texts.voucher.detailScreen.redeemDescription}</RegularText>
                </Wrapper>

                <Wrapper style={styles.progressContainer}>
                  <RegularText style={styles.progressOvertitle} lightest>
                    {texts.voucher.detailScreen.progressTitle}
                  </RegularText>

                  <CircularProgress
                    activeStrokeColor={colors.lighterPrimary}
                    inActiveStrokeColor={colors.primary}
                    maxValue={100}
                    radius={120}
                    showProgressValue={false}
                    subtitle={texts.voucher.detailScreen.progressSubtitle}
                    subtitleColor={colors.surface}
                    subtitleFontSize={normalize(15)}
                    title={`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
                      2,
                      '0'
                    )}`}
                    titleColor={colors.surface}
                    titleFontSize={normalize(50)}
                    titleStyle={styles.progressTitle}
                    value={((defaultTime - remainingTime) / defaultTime) * 100}
                  />
                </Wrapper>

                <Wrapper noPaddingBottom>
                  <Touchable
                    onPress={() => {
                      setIsVisible(false);
                      setIsRedeemingVoucher(false);
                      setIsChecked(false);
                    }}
                  >
                    <BoldText small center underline lightest>
                      {texts.voucher.detailScreen.close}
                    </BoldText>
                  </Touchable>
                </Wrapper>
              </WrapperVertical>
            ) : (
              <WrapperVertical>
                <Wrapper>
                  <BoldText lightest>{texts.voucher.detailScreen.sheetTitle}</BoldText>
                </Wrapper>

                <Wrapper noPaddingTop>
                  <RegularText lightest>{texts.voucher.detailScreen.sheetDescription}</RegularText>
                </Wrapper>

                <Wrapper noPaddingTop>
                  <Checkbox
                    checked={isChecked}
                    checkedColor={colors.surface}
                    checkedIcon="check-square-o"
                    containerStyle={styles.checkbox}
                    title={texts.voucher.detailScreen.checkboxLabel}
                    onPress={() => setIsChecked(!isChecked)}
                    uncheckedColor={colors.surface}
                    uncheckedIcon="square-o"
                    lightest
                  />
                </Wrapper>

                {!!availableQuantityForMember && availableQuantityForMember > 1 && (
                  <Wrapper noPaddingTop>
                    <WrapperRow style={styles.quantityContainer}>
                      <RegularText lightest small>
                        {texts.voucher.detailScreen.desiredQuantity}:
                      </RegularText>

                      <View style={styles.quantityButtonContainer}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => {
                            if (quantity > 1) {
                              setQuantity(quantity - 1);
                            }
                          }}
                        >
                          <BoldText lightest>－</BoldText>
                        </TouchableOpacity>
                        <BoldText lightest>{quantity}</BoldText>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => {
                            if (quantity < availableQuantityForMember) {
                              setQuantity(quantity + 1);
                            }
                          }}
                        >
                          <BoldText lightest>＋</BoldText>
                        </TouchableOpacity>
                      </View>
                    </WrapperRow>
                  </Wrapper>
                )}

                <Wrapper noPaddingBottom>
                  <TouchableOpacity
                    disabled={!isChecked}
                    style={[styles.button, !isChecked && styles.buttonDisabled]}
                    onPress={redeemVoucher}
                  >
                    <BoldText lightest>{texts.voucher.detailScreen.redeemNow}</BoldText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.closeButton]}
                    onPress={() => {
                      setIsVisible(false);
                      setIsChecked(false);
                    }}
                  >
                    <BoldText lightest>{texts.voucher.detailScreen.cancel}</BoldText>
                  </TouchableOpacity>
                </Wrapper>
              </WrapperVertical>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: normalize(4),
    height: normalize(47),
    justifyContent: 'center',
    marginTop: normalize(12),
    width: '100%'
  },
  buttonDisabled: {
    backgroundColor: colors.placeholder
  },
  checkbox: {
    backgroundColor: colors.transparent,
    padding: 0
  },
  closeButton: {
    backgroundColor: colors.transparent,
    borderColor: colors.surface,
    borderWidth: normalize(1),
    marginTop: normalize(16)
  },
  expiredViewContainer: {
    alignItems: 'center',
    marginVertical: normalize(45),
    paddingTop: 0
  },
  progressContainer: {
    alignSelf: 'center'
  },
  progressOvertitle: {
    alignSelf: 'center',
    position: 'absolute',
    top: normalize(75)
  },
  progressTitle: {
    alignSelf: 'center',
    fontWeight: 'bold',
    marginTop: normalize(30)
  },
  quantityButton: {
    alignItems: 'center',
    width: normalize(20)
  },
  quantityButtonContainer: {
    alignItems: 'center',
    backgroundColor: colors.shadowRgba,
    borderColor: colors.surface,
    borderRadius: normalize(20),
    borderWidth: normalize(1),
    flexDirection: 'row',
    height: normalize(32),
    justifyContent: 'space-around',
    marginLeft: normalize(16),
    width: normalize(93)
  },
  quantityContainer: {
    alignItems: 'center'
  },
  sheetBackgroundContainer: {
    backgroundColor: colors.shadowRgba,
    flex: 1
  },
  sheetContainer: {
    backgroundColor: colors.darkerPrimary,
    borderTopLeftRadius: normalize(5),
    borderTopRightRadius: normalize(5),
    bottom: 0,
    paddingBottom: normalize(20),
    position: 'absolute',
    width: '100%'
  }
});
