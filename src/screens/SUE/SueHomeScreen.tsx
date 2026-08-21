import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation
} from 'expo-router/react-navigation';
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
import { Icon, normalize, texts } from '../../config';
import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { navigateToRoute } from '../../helpers';
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

const ReportListNavigationButton = ({
  buttonTitle = texts.sue.viewReports,
  icon,
  query = QUERY_TYPES.SUE.REQUESTS,
  targetTabIndex,
  title = texts.sue.reports
}: {
  buttonTitle?: string;
  icon?: React.ReactNode;
  query?: string;
  targetTabIndex?: number;
  title?: string;
}) => {
  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <Button
      icon={icon}
      invert
      onPress={() =>
        navigateToRoute({
          navigation,
          params: {
            query,
            title
          },
          routeName: ScreenName.SueList,
          targetTabIndex
        })
      }
      title={buttonTitle}
    />
  );
};

export const SueHomeScreen = ({ navigation }: HomeScreenProps) => {
  const { appDesignSystem = {} } = useContext(ConfigurationsContext);
  const { globalSettings } = useContext(SettingsContext);
  const { sections = {} } = globalSettings;
  const { staticContentList = {}, sueListTargetTabIndex, sueReportListNavigationButton } = sections;
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

  const hasTopListNavigationButton =
    sueReportListNavigationButton && sueReportListNavigationButton === LIST_NAVIGATION_BUTTON.TOP;

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <ConnectedImagesCarousel
          isImageFullWidth
          navigation={navigation}
          publicJsonFile="sueHomeCarousel"
        />

        {hasTopListNavigationButton && (
          <Wrapper noPaddingBottom style={styles.paddingTop}>
            <ReportListNavigationButton
              icon={<Icon.ArrowRight />}
              targetTabIndex={sueListTargetTabIndex}
            />
          </Wrapper>
        )}

        {!!staticContentListTitle && (
          <WrapperVertical noPaddingBottom noPaddingTop={hasTopListNavigationButton}>
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

        {sueReportListNavigationButton &&
          sueReportListNavigationButton === LIST_NAVIGATION_BUTTON.BOTTOM && (
            <Wrapper noPaddingBottom>
              <ReportListNavigationButton
                icon={<Icon.ArrowRight />}
                targetTabIndex={sueListTargetTabIndex}
              />
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
  paddingTop: {
    paddingTop: normalize(16)
  }
});
