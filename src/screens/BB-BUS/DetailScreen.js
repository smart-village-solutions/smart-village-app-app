import deepRenameKeys from 'deep-rename-keys';
import _remove from 'lodash/remove';
import _sortBy from 'lodash/sortBy';
import PropTypes from 'prop-types';
import React, { useContext, useRef, useState } from 'react';
import { useQuery } from 'react-apollo';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { BackToTop, Button, SafeAreaViewFlex } from '../../components';
import { Authority } from '../../components/BB-BUS/Authority';
import { Persons } from '../../components/BB-BUS/Persons';
import { TextBlock } from '../../components/BB-BUS/TextBlock';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { colors, consts, device, normalize } from '../../config';
import { graphqlFetchPolicy, matomoTrackingString } from '../../helpers';
import { useMatomoTrackScreenView, useOpenWebScreen, useRefreshTime } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { GET_DIRECTUS, GET_SERVICE } from '../../queries/BB-BUS/directus';

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
  'Kosten (Gebühren, Auslagen,etc.)': 9,
  'Rechtsgrundlage(n)': 10,
  'Hinweise (Besonderheiten)': 11,
  Urheber: 12,
  'Weiterführende Informationen': 13,
  Ansprechpunkt: 14,
  'Zuständige Stelle': 15
};

const FormButton = ({ link, rootRouteName }) => {
  const { id, name, url } = link;

  const openWebScreen = useOpenWebScreen(name, url, rootRouteName);

  return <Button key={id} title={`${name} online`} onPress={openWebScreen} invert />;
};

const renderForm = (form, rootRouteName) => {
  // fix for multi nested result form Directus API
  if (form.forms) form = form.forms;

  const { links } = form;

  return links.map((link) => {
    // fix for multi nested result form Directus API
    if (link.links) link = link.links;

    return <FormButton key={link.id} link={link} rootRouteName={rootRouteName} />;
  });
};

const parseData = (data) => {
  const snake_caseData = data?.directus?.service?.data;

  if (!snake_caseData) return;

  // workaround for having camelCase keys in `top10`
  // GraphQL is returning snake_case, see: https://github.com/d12/graphql-remote_loader/issues/36
  // transforming method thanks to: https://coderwall.com/p/iprsng/convert-snake-case-to-camelcase
  return deepRenameKeys(snake_caseData, (key) => key.replace(/_\w/g, (m) => m[1].toUpperCase()));
};

const parseTextBlocks = (data) => {
  const { textBlocks } = data[0];
  let firstTextBlocks;
  let sortedTextBlocks;

  if (textBlocks) {
    sortedTextBlocks = _sortBy(textBlocks, (textBlock) => {
      // fix for multi nested result form Directus API
      if (textBlock.textBlock) textBlock = textBlock.textBlock;

      return TEXT_BLOCKS_SORTER[textBlock.name];
    });

    // filter text blocks we want to render before authorities and persons
    firstTextBlocks = _remove(sortedTextBlocks, (textBlock) => {
      // fix for multi nested result form Directus API
      if (textBlock.textBlock) textBlock = textBlock.textBlock;

      return (
        textBlock.name.toUpperCase() === 'KURZTEXT' || textBlock.name.toUpperCase() === 'VOLLTEXT'
      );
    });

    // filter text blocks, we do not want to render
    _remove(sortedTextBlocks, (textBlock) => {
      // fix for multi nested result form Directus API
      if (textBlock.textBlock) textBlock = textBlock.textBlock;

      return (
        textBlock.name.toUpperCase() === 'FACHLICH FREIGEGEBEN DURCH' ||
        textBlock.name.toUpperCase() === 'FACHLICH FREIGEGEBEN AM'
      );
    });
  }

  return { firstTextBlocks, sortedTextBlocks };
};

// eslint-disable-next-line complexity
export const DetailScreen = ({ route }) => {
  const scrollViewRef = useRef();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? '';
  const details = route?.params?.data ?? '';
  const id = details.id;

  useMatomoTrackScreenView(matomoTrackingString([MATOMO_TRACKING.SCREEN_VIEW.BB_BUS, headerTitle]));

  // TODO: why are there two different names for the web screens?
  const openWebScreen = useOpenWebScreen(headerTitle, undefined, rootRouteName);
  const openWebScreenDetailName = useOpenWebScreen(details.name, undefined, rootRouteName);

  const refreshTime = useRefreshTime(`BBBUS-service-${id}`, consts.REFRESH_INTERVALS.BB_BUS);

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const { data, loading, refetch } = useQuery(GET_DIRECTUS, {
    variables: GET_SERVICE(id),
    fetchPolicy,
    skip: !id || !refreshTime
  });

  if (!id) return null;

  if (!refreshTime || loading) {
    return <LoadingSpinner loading />;
  }

  const refresh = async () => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };

  const parsedData = parseData(data);

  if (!parsedData?.length) return null;

  const { forms, authorities, persons } = parsedData[0];

  const { firstTextBlocks, sortedTextBlocks } = parseTextBlocks(parsedData);

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
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        {!!forms && !!forms.length && (
          <View style={styles.formContainer}>
            {forms.map((form) => renderForm(form, rootRouteName))}
          </View>
        )}

        {firstTextBlocks?.map((textBlock, index) => {
          if (textBlock.textBlock) textBlock = textBlock.textBlock;

          return (
            <TextBlock
              key={textBlock.type?.id || uniqueId(textBlock.name)}
              bottomDivider={index == firstTextBlocks.length - 1}
              textBlock={textBlock}
              openWebScreen={openWebScreen}
            />
          );
        })}

        {authorities?.map((authority, index) => (
          <Authority
            key={authority.authority.id}
            data={authority.authority}
            bottomDivider={index == authorities.length - 1}
            openWebScreen={openWebScreenDetailName}
          />
        ))}

        {!!persons?.length && (
          <Persons data={{ id: details.id, persons }} openWebScreen={openWebScreenDetailName} />
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

FormButton.propTypes = {
  link: PropTypes.object.isRequired,
  rootRouteName: PropTypes.string.isRequired
};
