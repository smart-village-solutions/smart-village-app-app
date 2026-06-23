import PropTypes from 'prop-types';
import React, { useContext, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { BackToTop, Button, SafeAreaViewFlex } from '../../components';
import { Authority } from '../../components/BUS/Authority';
import { Persons } from '../../components/BUS/Persons';
import { TextBlock } from '../../components/BUS/TextBlock';
import { FeedbackFooter } from '../../components/FeedbackFooter';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { colors, consts, device, normalize } from '../../config';
import { matomoTrackingString, openLink } from '../../helpers';
import { getBusTopActions, splitBusTextBlocks } from '../../helpers/busDetailHelper';
import { useBusService, useMatomoTrackScreenView, useOpenWebScreen } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';

const { MATOMO_TRACKING } = consts;

const uniqueId = (name) => name.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);

const FormButton = ({ headerTitle, link, name, rootRouteName }) => {
  const { url } = link;
  const openWebScreen = useOpenWebScreen(headerTitle, url, rootRouteName);

  return <Button title={name} onPress={() => openLink(url, openWebScreen)} invert />;
};

FormButton.propTypes = {
  headerTitle: PropTypes.string,
  link: PropTypes.object.isRequired,
  name: PropTypes.string,
  rootRouteName: PropTypes.string
};

const renderForm = (headerTitle, form, rootRouteName) => {
  const { links, name } = form;

  return links.map((link) => {
    const buttonTitle = name || link?.name || 'Formular öffnen';

    return (
      <FormButton
        headerTitle={headerTitle}
        key={link.url}
        link={link}
        name={buttonTitle}
        rootRouteName={rootRouteName}
      />
    );
  });
};

// eslint-disable-next-line complexity
export const DetailScreen = ({ route }) => {
  const scrollViewRef = useRef();
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { bus = {} } = settings;
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? '';
  const details = route?.params?.data ?? '';
  const areaId = route.params?.areaId ?? bus?.areaId?.toString();
  const id = details.id;

  useMatomoTrackScreenView(matomoTrackingString([MATOMO_TRACKING.SCREEN_VIEW.BUS, headerTitle]));

  const openWebScreen = useOpenWebScreen(headerTitle, undefined, rootRouteName);

  const { data: service, isLoading: loading, refetch } = useBusService({ areaId, id });

  if (!id || !areaId) return null;

  if (loading) {
    return <LoadingSpinner loading />;
  }

  const refresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.warn('BUS detail refresh failed', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!service) return null;

  const { organisationalUnits, persons } = service;
  const topActions = getBusTopActions(service);
  const { firstTextBlocks, sortedTextBlocks } = splitBusTextBlocks(service);
  const hasAuthorities = !!organisationalUnits?.length;
  const hasPersons = !!persons?.length;
  const hasSortedTextBlocks = !!sortedTextBlocks?.length;

  return (
    <SafeAreaViewFlex>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={(contentWidth, contentHeight) =>
          contentHeight > device.height ? setShowBackToTop(true) : setShowBackToTop(false)
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      >
        {!!topActions.length && (
          <View style={styles.formContainer}>
            {topActions.map((action) => renderForm(headerTitle, action, rootRouteName))}
          </View>
        )}

        {firstTextBlocks?.map((textBlock, index) => {
          if (textBlock.textBlock) textBlock = textBlock.textBlock;

          return (
            <TextBlock
              key={textBlock.type?.id || uniqueId(textBlock.type.name)}
              bottomDivider={
                index == firstTextBlocks.length - 1 &&
                !hasAuthorities &&
                !hasPersons &&
                !hasSortedTextBlocks
              }
              textBlock={textBlock}
              openWebScreen={openWebScreen}
            />
          );
        })}

        {organisationalUnits?.map((ou, index) => (
          <Authority
            key={ou.id}
            data={ou}
            bottomDivider={
              index == organisationalUnits.length - 1 && !hasPersons && !hasSortedTextBlocks
            }
            openWebScreen={openWebScreen}
          />
        ))}

        {!!persons?.length && (
          <Persons
            data={{ id: details.id, persons }}
            bottomDivider={!hasSortedTextBlocks}
            openWebScreen={openWebScreen}
          />
        )}

        {sortedTextBlocks?.map((textBlock, index) => {
          if (textBlock.textBlock) textBlock = textBlock.textBlock;

          return (
            <TextBlock
              key={textBlock.type?.id || uniqueId(textBlock.name)}
              bottomDivider={index == sortedTextBlocks.length - 1}
              textBlock={textBlock}
              openWebScreen={openWebScreen}
            />
          );
        })}

        {showBackToTop && (
          <BackToTop
            onPress={() =>
              scrollViewRef.current.scrollTo({
                x: 0,
                y: 0,
                animated: true
              })
            }
          />
        )}
        <FeedbackFooter />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    marginTop: normalize(21),
    paddingHorizontal: normalize(14)
  }
});

DetailScreen.propTypes = {
  route: PropTypes.object.isRequired
};
