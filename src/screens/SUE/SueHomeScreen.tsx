import { NavigationProp, RouteProp, useNavigation } from '@react-navigation/native';
import React, { useContext, useLayoutEffect, useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import {
  Button,
  ConnectedImagesCarousel,
  HeaderLeft,
  Image,
  ListComponent,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperVertical
} from '../../components';
import { normalize, texts } from '../../config';
import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { useStaticContent, useVersionCheck } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';
import { ScreenName } from '../../types';

type HomeScreenProps = {
  navigation: NavigationProp<any>;
  route: RouteProp<any, any>;
};

const LIST_NAVIGATION_BUTTON = {
  BOTTOM: 'bottom',
  TOP: 'top'
};

const ReportListNavigationButton = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <Button
      invert
      onPress={() =>
        navigation.navigate(ScreenName.SueList, {
          query: QUERY_TYPES.SUE.REQUESTS,
          title: texts.sue.reports
        })
      }
      title={texts.sue.viewReports}
    />
  );
};

export const SueHomeScreen = ({ navigation }: HomeScreenProps) => {
  const { appDesignSystem = {} } = useContext(ConfigurationsContext);
  const { globalSettings } = useContext(SettingsContext);
  const { sections = {} } = globalSettings;
  const { staticContentList = {}, sueReportListNavigationButton } = sections;
  const {
    staticContentName = 'staticContentList',
    staticContentListDescription,
    horizontal = true,
    showStaticContentList = true,
    staticContentListTitle
  } = staticContentList;

  useVersionCheck();

  const { data } = useStaticContent({
    refreshTimeKey: `publicJsonFile-${staticContentName}`,
    name: staticContentName,
    type: 'json',
    skip: !showStaticContentList
  });

  // function to add customized styles from `globalSettings` to the list items
  const staticContentListItem = useMemo(() => {
    if (!data) {
      return [];
    }

    let listItem = data;

    if (appDesignSystem?.staticContentList) {
      listItem = listItem?.map((item: any) => ({
        ...item,
        appDesignSystem: appDesignSystem.staticContentList
      }));
    }

    return listItem;
  }, [appDesignSystem, data]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderLeft
          backImage={() => (
            <Image
              source={require('../../../assets/sue-icon-pin.png')}
              style={styles.logo}
              borderRadius={normalize(20)}
            />
          )}
        />
      )
    });
  }, []);

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <ConnectedImagesCarousel
          navigation={navigation}
          publicJsonFile="sueHomeCarousel"
          refreshTimeKey="publicJsonFile-sueHomeCarousel"
        />

        {!!sueReportListNavigationButton &&
          sueReportListNavigationButton === LIST_NAVIGATION_BUTTON.TOP && (
            <Wrapper noPaddingBottom style={styles.paddingTop}>
              <ReportListNavigationButton />
            </Wrapper>
          )}

        {!!staticContentListTitle && (
          <WrapperVertical
            style={[
              styles.noPaddingBottom,
              !!sueReportListNavigationButton &&
                sueReportListNavigationButton === LIST_NAVIGATION_BUTTON.TOP &&
                styles.noPaddingTop
            ]}
          >
            <SectionHeader title={staticContentListTitle} />
          </WrapperVertical>
        )}

        {!!staticContentListDescription && (
          <Wrapper>
            <RegularText>{staticContentListDescription}</RegularText>
          </Wrapper>
        )}

        <ListComponent
          data={staticContentListItem}
          horizontal={horizontal}
          navigation={navigation}
          query={QUERY_TYPES.STATIC_CONTENT_LIST}
        />

        {!!sueReportListNavigationButton &&
          sueReportListNavigationButton === LIST_NAVIGATION_BUTTON.BOTTOM && (
            <Wrapper noPaddingBottom>
              <ReportListNavigationButton />
            </Wrapper>
          )}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  logo: {
    height: normalize(30),
    width: normalize(30),
    marginRight: normalize(16)
  },
  noPaddingBottom: {
    paddingBottom: 0
  },
  noPaddingTop: {
    paddingTop: 0
  },
  paddingTop: {
    paddingTop: normalize(16)
  }
});
