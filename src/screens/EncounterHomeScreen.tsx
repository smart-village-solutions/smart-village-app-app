import * as Linking from 'expo-linking';
import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';
import QRCode from 'react-native-qrcode-svg';

import {
  BoldText,
  Button,
  CircularView,
  DiagonalGradient,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Touchable,
  Wrapper,
  WrapperRow,
  WrapperWithOrientation
} from '../components';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors, consts, device, Icon, normalize, texts } from '../config';
import { useEncounterPolling, useEncounterUser, useQRValue } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { ScreenName } from '../types';

const INFO_ICON_SIZE = normalize(16);

const a11yLabels = consts.a11yLabel;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EncounterHomeScreen = ({ navigation }: any) => {
  const {
    loading: loadingQr,
    qrValue: qrId,
    error: errorQr,
    refresh: refreshQr,
    refreshing: refreshingQr
  } = useQRValue();
  const {
    error: errorUser,
    loading: loadingUser,
    refresh: refreshUser,
    refreshing: refreshingUser,
    user
  } = useEncounterUser();

  useEncounterPolling(navigation, user?.userId, qrId);

  const loading = loadingQr || loadingUser;
  const error = errorQr || errorUser;
  const refreshing = refreshingQr || refreshingUser;

  const qrValue = Linking.createURL('encounter', { queryParams: { qrId } });

  const onPressInfo = useCallback(() => {
    navigation.navigate(ScreenName.Html, {
      title: texts.screenTitles.encounterHome,
      query: QUERY_TYPES.PUBLIC_HTML_FILE,
      queryVariables: { name: 'encounter-verification' }
    });
  }, [navigation]);

  const refresh = useCallback(() => {
    refreshQr();
    refreshUser();
  }, [refreshQr, refreshUser]);

  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (!user || error) {
    return (
      <ScrollView
        refreshControl={<RefreshControl onRefresh={refreshUser} refreshing={refreshingUser} />}
      >
        <Wrapper>
          <RegularText center>{texts.encounter.errorLoadingUser}</RegularText>
        </Wrapper>
      </ScrollView>
    );
  }

  const { firstName, lastName, verified } = user;

  return (
    <SafeAreaViewFlex>
      <ScrollView refreshControl={<RefreshControl onRefresh={refresh} refreshing={refreshing} />}>
        <WrapperWithOrientation>
          <SectionHeader title={texts.encounter.homeTitle} />
          <DiagonalGradient style={styles.gradient}>
            <View style={styles.container}>
              <CircularView size={device.width / 2} style={styles.circle}>
                <QRCode value={qrValue} size={device.width / 3} quietZone={normalize(4)} />
              </CircularView>
              <BoldText big lightest>
                {`${firstName} ${lastName}`.toUpperCase()}
              </BoldText>
            </View>

            <Wrapper>
              <WrapperRow spaceBetween>
                <WrapperRow>
                  <RegularText lightest small textAlign="bottom">
                    {texts.encounter.status}
                  </RegularText>
                  <Touchable
                    accessibilityLabel={`${a11yLabels.verifiedInfo} ${a11yLabels.button}`}
                    onPress={onPressInfo}
                  >
                    <Icon.Info
                      color={colors.lightestText}
                      size={INFO_ICON_SIZE}
                      style={styles.icon}
                    />
                  </Touchable>
                </WrapperRow>
                <RegularText lightest>
                  {verified ? texts.encounter.verified : texts.encounter.notVerified}
                </RegularText>
              </WrapperRow>
              <Divider style={styles.divider} />
            </Wrapper>
          </DiagonalGradient>

          <Wrapper>
            <Button
              onPress={() => {
                navigation.navigate(ScreenName.EncounterScanner);
              }}
              title={texts.encounter.newEncounter}
            />
            <Button
              invert
              onPress={() => {
                navigation.navigate(ScreenName.EncounterData);
              }}
              title={texts.encounter.myData}
            />
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.surface,
    marginBottom: normalize(12)
  },
  container: {
    alignItems: 'center'
  },
  divider: { backgroundColor: colors.lightestText },
  gradient: {
    justifyContent: 'center',
    paddingVertical: normalize(24)
  },
  icon: { marginLeft: normalize(8) }
});
