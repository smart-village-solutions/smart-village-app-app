import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';

import { Icon, colors, normalize, texts } from '../../config';
import { Button } from '../Button';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow } from '../Wrapper';
import { Checkbox } from '../Checkbox';
import { TQuota } from '../../types';

const defaultTime = 15 * 60; // 15 * 60 sec.

export const VoucherRedeem = ({ quota }: { quota: TQuota }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(defaultTime);
  const [isRedeemVoucher, setIsRedeemVoucher] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // TODO: set voucher availability
  const [isExpiredVoucher, setIsExpiredVoucher] = useState(false);

  const { maxPerPerson } = quota;

  useEffect(() => {
    if (isRedeemVoucher) {
      const interval = setInterval(() => {
        if (remainingTime > 0) {
          setRemainingTime(remainingTime - 1);
        } else {
          clearInterval(interval);
          setIsExpiredVoucher(true);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setRemainingTime(defaultTime);
    }
  }, [remainingTime, isRedeemVoucher]);

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return (
    <>
      {/* TODO: button availability will be adjusted according to voucher availability */}
      <Button title={texts.voucher.detailScreen.redeem} onPress={() => setIsVisible(true)} />

      <Modal animationType="slide" transparent visible={isVisible}>
        <View style={styles.sheetBackgroundContainer}>
          <View style={styles.sheetContainer}>
            {isExpiredVoucher ? (
              <>
                <Wrapper>
                  <BoldText lightest>{texts.voucher.detailScreen.redeemErrorTitle}</BoldText>
                </Wrapper>

                <Wrapper style={[styles.progressContainer, styles.expiredViewContainer]}>
                  <Icon.Close size={normalize(120)} color={colors.surface} />
                  <RegularText lightest>
                    {texts.voucher.detailScreen.redeemErrorDescription}
                  </RegularText>
                </Wrapper>

                <Wrapper>
                  <Touchable
                    onPress={() => {
                      setIsVisible(false);
                      setIsRedeemVoucher(false);
                      setIsExpiredVoucher(false);
                      setIsChecked(false);
                    }}
                  >
                    <BoldText small center underline lightest>
                      {texts.voucher.detailScreen.close}
                    </BoldText>
                  </Touchable>
                </Wrapper>
              </>
            ) : isRedeemVoucher ? (
              <>
                <Wrapper>
                  <BoldText lightest>{texts.voucher.detailScreen.redeemTitle}</BoldText>
                </Wrapper>

                <Wrapper style={styles.noPaddingTop}>
                  <RegularText lightest>{texts.voucher.detailScreen.redeemDescription}</RegularText>
                </Wrapper>

                <Wrapper style={styles.progressContainer}>
                  <RegularText style={styles.progressOvertitle} lightest>
                    {texts.voucher.detailScreen.progressTitle}
                  </RegularText>

                  <CircularProgress
                    activeStrokeColor={colors.primary}
                    inActiveStrokeColor={colors.lighterPrimary}
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

                <Wrapper>
                  <Touchable
                    onPress={() => {
                      setIsVisible(false);
                      setIsRedeemVoucher(false);
                      setIsChecked(false);
                    }}
                  >
                    <BoldText small center underline lightest>
                      {texts.voucher.detailScreen.close}
                    </BoldText>
                  </Touchable>
                </Wrapper>
              </>
            ) : (
              <>
                <Wrapper>
                  <BoldText lightest>{texts.voucher.detailScreen.sheetTitle}</BoldText>
                </Wrapper>

                <Wrapper style={styles.noPaddingTop}>
                  <RegularText lightest>{texts.voucher.detailScreen.sheetDescription}</RegularText>
                </Wrapper>

                <Wrapper style={styles.noPaddingTop}>
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

                {!!maxPerPerson && maxPerPerson > 1 && (
                  <Wrapper style={styles.noPaddingTop}>
                    <View style={styles.quantityContainer}>
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
                          <BoldText lightest>-</BoldText>
                        </TouchableOpacity>
                        <BoldText lightest>{quantity}</BoldText>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => {
                            if (quantity < maxPerPerson) {
                              setQuantity(quantity + 1);
                            }
                          }}
                        >
                          <BoldText lightest>+</BoldText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Wrapper>
                )}

                <Wrapper>
                  <TouchableOpacity
                    disabled={!isChecked}
                    style={[styles.button, !isChecked && styles.buttonDisabled]}
                    onPress={() => setIsRedeemVoucher(true)}
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
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
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
  noPaddingTop: {
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
    alignItems: 'center',
    flexDirection: 'row'
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