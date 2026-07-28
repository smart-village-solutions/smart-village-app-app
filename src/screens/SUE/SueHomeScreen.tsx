import { NavigationProp, ParamListBase, RouteProp, useNavigation } from '@react-navigation/native';
import React, { useContext, useLayoutEffect, useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import {
  AccessibilityHeader,
  Button,
  ConnectedImagesCarousel,
  HeaderLeft,
  Image,
  ListComponent,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperRow,
  WrapperVertical
} from '../../components';
import { normalize, texts } from '../../config';
import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { useStaticContent, useVersionCheck } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';
import { ScreenName } from '../../types';

type HomeScreenProps = {
  navigation: NavigationProp<ParamListBase>;
  route: RouteProp<ParamListBase, string>;
};

const LIST_NAVIGATION_BUTTON = {
  BOTTOM: 'bottom',
  TOP: 'top'
};

const ReportListNavigationButton = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

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
      listItem = listItem?.map((item: Record<string, unknown>) => ({
        ...item,
        appDesignSystem: appDesignSystem.staticContentList
      }));
    }

    return listItem;
  }, [appDesignSystem, data]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <WrapperRow style={styles.headerRight}>
          <AccessibilityHeader style={styles.headerIcon} />
          <HeaderLeft
            backImage={() => (
              <Image
                source={require('../../../assets/sue-icon-pin.png')}
                style={styles.logo}
                borderRadius={normalize(20)}
              />
            )}
          />
        </WrapperRow>
      )
    });
  }, [navigation]);

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <ConnectedImagesCarousel
          isImageFullWidth
          navigation={navigation}
          publicJsonFile="sueHomeCarousel"
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
  headerIcon: {
    paddingHorizontal: normalize(6)
  },
  headerRight: {
    alignItems: 'center',
    paddingRight: normalize(10)
  },
  logo: {
    height: normalize(30),
    marginHorizontal: normalize(6),
    width: normalize(30)
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
