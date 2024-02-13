import _remove from 'lodash/remove';
import _sortBy from 'lodash/sortBy';
import PropTypes from 'prop-types';
import React, { useContext, useRef, useState } from 'react';
import { useQuery } from 'react-apollo';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { BBBusClient } from '../../BBBusClient';
import { BackToTop, Button, SafeAreaViewFlex } from '../../components';
import { Authority } from '../../components/BB-BUS/Authority';
import { Persons } from '../../components/BB-BUS/Persons';
import { TextBlock } from '../../components/BB-BUS/TextBlock';
import { FeedbackFooter } from '../../components/FeedbackFooter';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { colors, consts, device, normalize } from '../../config';
import { matomoTrackingString, openLink, rootRouteName } from '../../helpers';
import { useMatomoTrackScreenView, useOpenWebScreen } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { GET_SERVICE } from '../../queries/BB-BUS';
import { SettingsContext } from '../../SettingsProvider';

const { MATOMO_TRACKING } = consts;

const uniqueId = (name) => name.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);

const TEXT_BLOCKS_SORTER = {
  Kurztext: 0,
  Volltext: 1,
  Ansprechpartner: 2,
  'Erforderliche Unterlagen': 3,
  Voraussetzungen: 4,
  Bearbeitungsdauer: 5,
  Verfahrensablauf: 6,
  Formulare: 7,
  Fristen: 8,
  'Kosten (Gebühren, Auslagen, etc.)': 9,
  'Rechtsgrundlage(n)': 10,
  'Hinweise (Besonderheiten)': 11,
  Urheber: 12,
  'Weiterführende Informationen': 13,
  Ansprechpunkt: 14,
  'Zuständige Stelle': 15
};

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
    return (
      <FormButton
        headerTitle={headerTitle}
        key={link.url}
        link={link}
        name={name}
        rootRouteName={rootRouteName}
      />
    );
  });
};

const parseTextBlocks = (service) => {
  const { textBlocks } = service;
  let firstTextBlocks;
  let sortedTextBlocks;

  if (textBlocks) {
    sortedTextBlocks = _sortBy(textBlocks, (textBlock) => {
      return TEXT_BLOCKS_SORTER[textBlock.type.name];
    });

    // filter text blocks we want to render before authorities and persons
    firstTextBlocks = _remove(sortedTextBlocks, (textBlock) => {
      return (
        textBlock.type.name.toUpperCase() === 'KURZTEXT' ||
        textBlock.type.name.toUpperCase() === 'VOLLTEXT'
      );
    });

    // filter text blocks, we do not want to render
    _remove(sortedTextBlocks, (textBlock) => {
      return (
        textBlock.type.name.toUpperCase() === 'TEASER' ||
        textBlock.type.name.toUpperCase() === 'FACHLICH FREIGEGEBEN DURCH' ||
        textBlock.type.name.toUpperCase() === 'FACHLICH FREIGEGEBEN AM'
      );
    });
  }

  return { firstTextBlocks, sortedTextBlocks };
};

// eslint-disable-next-line complexity
export const DetailScreen = ({ route }) => {
  const scrollViewRef = useRef();
  const { isConnected } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [client] = useState(BBBusClient(globalSettings?.settings?.busBb?.uri));

  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? '';
  const details = route?.params?.data ?? '';
  const areaId = route.params?.areaId ?? globalSettings?.settings?.busBb?.v2?.areaId?.toString();
  const id = details.id;

  useMatomoTrackScreenView(matomoTrackingString([MATOMO_TRACKING.SCREEN_VIEW.BB_BUS, headerTitle]));

  const openWebScreen = useOpenWebScreen(headerTitle, undefined, rootRouteName);

  const { data, loading, refetch } = useQuery(GET_SERVICE, {
    variables: { externalIds: id, areaId },
    client,
    fetchPolicy: 'network-only',
    skip: !id || !areaId
  });

  if (!id || !areaId) return null;

  if (loading) {
    return <LoadingSpinner loading />;
  }

  const refresh = async () => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };

  const service = data?.publicServiceTypes?.[0];

  if (!service) return null;

  const { organisationalUnits, persons } = service;

  const forms = organisationalUnits?.map((ou) => ou.forms).flat();

  const { firstTextBlocks, sortedTextBlocks } = parseTextBlocks(service);

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
        {!!forms?.length && (
          <View style={styles.formContainer}>
            {forms.map((form) => renderForm(headerTitle, form, rootRouteName))}
          </View>
        )}

        {firstTextBlocks?.map((textBlock, index) => {
          if (textBlock.textBlock) textBlock = textBlock.textBlock;

          return (
            <TextBlock
              key={textBlock.type?.id || uniqueId(textBlock.type.name)}
              bottomDivider={index == firstTextBlocks.length - 1}
              textBlock={textBlock}
              openWebScreen={openWebScreen}
            />
          );
        })}

        {organisationalUnits?.map((ou, index) => (
          <Authority
            key={ou.id}
            data={ou}
            bottomDivider={index == organisationalUnits.length - 1}
            openWebScreen={openWebScreen}
          />
        ))}

        {!!persons?.length && (
          <Persons data={{ id: details.id, persons }} openWebScreen={openWebScreen} />
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
