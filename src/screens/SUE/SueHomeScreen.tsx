import { NavigationProp, RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
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
import { myRequests } from '../../queries/SUE';
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

const ReportListNavigationButton = ({
  buttonTitle = texts.sue.viewReports,
  query = QUERY_TYPES.SUE.REQUESTS,
  title = texts.sue.reports
}: {
  buttonTitle?: string;
  query?: string;
  title?: string;
}) => {
  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <Button
      invert
      onPress={() =>
        navigation.navigate(ScreenName.SueList, {
          query,
          title
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
  const { staticContentList = {}, sueReportListNavigationButton } = sections;
  const {
    staticContentName = 'staticContentList',
    staticContentListDescription,
    horizontal = true,
    showStaticContentList = true,
    staticContentListTitle
  } = staticContentList;
  const [myReports, setMyReports] = useState<any[]>([]);

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

  useFocusEffect(
    useCallback(() => {
      const fetchMyReports = async () => {
        const reports = await myRequests();
        setMyReports(reports);
      };

      fetchMyReports();
    }, [])
  );

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
          isImageFullWidth
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

        {!!myReports?.length && (
          <Wrapper noPaddingBottom noPaddingTop>
            <ReportListNavigationButton
              buttonTitle={texts.sue.viewMyReports}
              query={QUERY_TYPES.SUE.MY_REQUESTS}
              title={texts.sue.myReports}
            />
          </Wrapper>
        )}

        {!!staticContentListTitle && (
          <WrapperVertical
            noPaddingBottom
            noPaddingTop={
              !!sueReportListNavigationButton &&
              sueReportListNavigationButton === LIST_NAVIGATION_BUTTON.TOP
            }
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
