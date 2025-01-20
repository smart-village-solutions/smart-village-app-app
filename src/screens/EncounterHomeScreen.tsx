import * as Linking from 'expo-linking';
import React, { useCallback, useContext, useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider } from 'react-native-elements';
import QRCode from 'react-native-qrcode-svg';

import {
  BoldText,
  Button,
  CircularView,
  DiagonalGradient,
  EncounterWelcome,
  HtmlView,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperRow
} from '../components';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors, consts, device, Icon, normalize, texts } from '../config';
import {
  useEncounterPolling,
  useEncounterUser,
  useOpenWebScreen,
  useQRValue,
  useStaticContent
} from '../hooks';
import { QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';
const { a11yLabel, HOST_NAMES } = consts;

const INFO_ICON_SIZE = normalize(16);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line complexity
export const EncounterHomeScreen = ({ navigation, route }: any) => {
  // @ts-expect-error settings are not properly typed
  const categoryId = useContext(SettingsContext).globalSettings?.settings?.encounter?.categoryId;
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
    user,
    userId
  } = useEncounterUser();
  const additionalInfo = useStaticContent({
    type: 'html',
    name: 'encounter-home-info'
  }).data as string | undefined;

  const openWebScreen = useOpenWebScreen(texts.screenTitles.encounterHome);

  useEncounterPolling(navigation, userId, qrId);

  const loading = (loadingQr && userId) || loadingUser;
  const error = errorQr || errorUser;
  const refreshing = refreshingQr || refreshingUser;

  const qrValue = Linking.createURL(HOST_NAMES.ENCOUNTER, { queryParams: { qrId } });

  const onPressInfo = useCallback(() => {
    navigation.navigate(ScreenName.Html, {
      title: texts.screenTitles.encounterHome,
      query: QUERY_TYPES.PUBLIC_HTML_FILE,
      queryVariables: { name: 'encounter-verification' }
    });
  }, [navigation]);

  const onPressToCategory = useCallback(() => {
    navigation.navigate(ScreenName.Index, {
      query: QUERY_TYPES.POINTS_OF_INTEREST,
      queryVariables: {
        categoryId,
        limit: 15,
        order: 'name_ASC'
      },
      title: texts.screenTitles.encounterHome
    });
  }, [categoryId, navigation]);

  const refresh = useCallback(() => {
    refreshQr();
    refreshUser();
  }, [refreshQr, refreshUser]);

  // refresh if the refreshUser param changed, which happens after registration
  useEffect(refresh, [route.params?.refreshUser]);

  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (!userId) {
    return (
      <EncounterWelcome
        onPressToCategory={categoryId ? onPressToCategory : undefined}
        navigation={navigation}
      />
    );
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
                <TouchableOpacity
                  accessibilityLabel={`${a11yLabel.verifiedInfo} ${a11yLabel.button}`}
                  onPress={onPressInfo}
                >
                  <Icon.Info
                    color={colors.lightestText}
                    size={INFO_ICON_SIZE}
                    style={styles.icon}
                  />
                </TouchableOpacity>
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
          {!!categoryId && (
            <Button invert title={texts.encounter.toCategory} onPress={onPressToCategory} />
          )}
          {!!additionalInfo?.length && (
            // @ts-expect-error HtmlView memo is not typed in a way that the correct type can be inferred
            <HtmlView html={additionalInfo} openWebScreen={openWebScreen} />
          )}
        </Wrapper>
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
  divider: { backgroundColor: colors.surface },
  gradient: {
    justifyContent: 'center',
    paddingVertical: normalize(24)
  },
  icon: { marginLeft: normalize(8) }
});
