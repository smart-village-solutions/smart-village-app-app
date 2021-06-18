import PropTypes from 'prop-types';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ListItem } from 'react-native-elements';
import { Query } from 'react-apollo';
import _isEmpty from 'lodash/isEmpty';
import _sortBy from 'lodash/sortBy';
import _remove from 'lodash/remove';
import deepRenameKeys from 'deep-rename-keys';

import { NetworkContext } from '../../NetworkProvider';
import { OrientationContext } from '../../OrientationProvider';
import { colors, consts, device, normalize } from '../../config';
import {
  BackToTop,
  Button,
  HeaderLeft,
  HtmlView,
  Icon,
  Link,
  LoadingContainer,
  SafeAreaViewFlex,
  Title,
  Touchable,
  Wrapper,
  WrapperRow,
  WrapperWithOrientation
} from '../../components';
import { share } from '../../icons';
import {
  graphqlFetchPolicy,
  matomoTrackingString,
  openShare,
  refreshTimeFor,
  trimNewLines
} from '../../helpers';
import { GET_DIRECTUS, GET_SERVICE } from '../../queries/BB-BUS/directus';
import { Authority } from '../../components/BB-BUS/Authority';
import { Persons } from '../../components/BB-BUS/Persons';
import { useMatomoTrackScreenView } from '../../hooks';

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

export const DetailScreen = ({ navigation }) => {
  const scrollViewRef = useRef();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { orientation, dimensions } = useContext(OrientationContext);
  const [refreshTime, setRefreshTime] = useState();
  const [accordion, setAccordion] = useState({});
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const rootRouteName = navigation.getParam('rootRouteName', '');
  const headerTitle = navigation.getParam('title', '');
  const details = navigation.getParam('data', '');
  const id = details.id;

  if (!id) return null;

  useMatomoTrackScreenView(matomoTrackingString([MATOMO_TRACKING.SCREEN_VIEW.BB_BUS, headerTitle]));

  useEffect(() => {
    const getRefreshTime = async () => {
      const time = await refreshTimeFor(`BBBUS-service-${id}`, consts.REFRESH_INTERVALS.BB_BUS);

      setRefreshTime(time);
    };

    getRefreshTime();
  }, []);

  if (!refreshTime) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const refresh = async (refetch) => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  // return true, if the accordion section of a type id is `true` or it is the initial rendering,
  // where `accordion` is empty and the current section is KURZTEXT.
  // this specific section should be open on initial render.
  const isOpenSection = (typeId, isKurztext) => {
    if (_isEmpty(accordion) && isKurztext) {
      accordion[typeId] = true;
    }

    return !!accordion[typeId];
  };

  /* eslint-disable complexity */
  /* NOTE: we need to check a lot for presence, so this is that complex */
  return (
    <Query query={GET_DIRECTUS} variables={GET_SERVICE(id)} fetchPolicy={fetchPolicy}>
      {({ data, loading, refetch }) => {
        if (loading) {
          return (
            <LoadingContainer>
              <ActivityIndicator color={colors.accent} />
            </LoadingContainer>
          );
        }

        const snake_caseData = data?.directus?.service?.data;

        if (!snake_caseData) return [];

        // workaround for having camelCase keys in `top10`
        // GraphQL is returning snake_case, see: https://github.com/d12/graphql-remote_loader/issues/36
        // transforming method thanks to: https://coderwall.com/p/iprsng/convert-snake-case-to-camelcase
        data = deepRenameKeys(snake_caseData, (key) =>
          key.replace(/_\w/g, (m) => m[1].toUpperCase())
        );

        if (!data || !data.length) return null;

        const { forms, textBlocks, authorities, persons } = data[0];
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
              textBlock.name.toUpperCase() === 'KURZTEXT' ||
              textBlock.name.toUpperCase() === 'VOLLTEXT'
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

        const renderForm = (form) => {
          // fix for multi nested result form Directus API
          if (form.forms) form = form.forms;

          const { links } = form;

          return links.map((link) => {
            // fix for multi nested result form Directus API
            if (link.links) link = link.links;

            const { id, name, url } = link;

            const openWebScreen = () =>
              navigation.navigate({
                routeName: 'Web',
                params: {
                  title: name,
                  webUrl: url,
                  rootRouteName
                }
              });

            return <Button key={id} title={`${name} online`} onPress={openWebScreen} invert />;
          });
        };

        const renderTextBlock = (textBlocks, textBlock, index) => {
          // fix for multi nested result form Directus API
          if (textBlock.textBlock) textBlock = textBlock.textBlock;

          const { name, externalLinks, text } = textBlock;
          const type = textBlock.type || {};
          // create a type id, if not present already
          // an id is needed for the accordion, but data from api are not existing in every case
          type.id = type.id || uniqueId(name);

          const isKurztext = name.toUpperCase() === 'KURZTEXT';

          // action to open source urls
          const openWebScreen = (webUrl) =>
            navigation.navigate({
              routeName: 'Web',
              params: {
                title: headerTitle,
                webUrl,
                rootRouteName
              }
            });

          return (
            <View key={type.id}>
              {!!name && (!!text || !!externalLinks?.length) && (
                <ListItem
                  title={<Title small>{name}</Title>}
                  bottomDivider={
                    isOpenSection(type.id, isKurztext) || index == textBlocks.length - 1
                  }
                  topDivider
                  containerStyle={styles.sectionTitle}
                  rightIcon={<Title>{isOpenSection(type.id, isKurztext) ? '－' : '＋'}</Title>}
                  onPress={() => {
                    // set the accordion part active/visible or not for the clicked element
                    // identified by text block type id
                    accordion[type.id] = !isOpenSection(type.id, isKurztext);
                    setAccordion({ ...accordion });
                  }}
                  delayPressIn={0}
                  Component={Touchable}
                />
              )}
              {isOpenSection(type.id, isKurztext) && (
                <WrapperWithOrientation noFlex>
                  <Wrapper>
                    {!!text && <HtmlView html={trimNewLines(text)} openWebScreen={openWebScreen} />}
                    {!!externalLinks?.length &&
                      externalLinks.map((externalLink) => {
                        // fix for multi nested result form Directus API
                        if (externalLink.externalLink) externalLink = externalLink.externalLink;

                        return (
                          <Link
                            url={externalLink.url}
                            openWebScreen={openWebScreen}
                            description={`Link: ${externalLink.name}`}
                            key={externalLink.url}
                          />
                        );
                      })}
                  </Wrapper>
                </WrapperWithOrientation>
              )}
            </View>
          );
        };

        // action to open source urls
        // TODO: refactor multiple methods for `openWebScreen` in this file
        const openWebScreen = (webUrl) =>
          navigation.navigate({
            routeName: 'Web',
            params: {
              title: details.name,
              webUrl,
              rootRouteName
            }
          });

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
                  onRefresh={() => refresh(refetch)}
                  colors={[colors.accent]}
                  tintColor={colors.accent}
                />
              }
            >
              {!!forms && !!forms.length && (
                <View style={styles.formContainer}>{forms.map((form) => renderForm(form))}</View>
              )}

              {!!firstTextBlocks &&
                firstTextBlocks.map((textBlock, index) =>
                  renderTextBlock(firstTextBlocks, textBlock, index)
                )}

              {!!authorities &&
                authorities.map((authority, index) => (
                  <Authority
                    key={authority.authority.id}
                    data={authority.authority}
                    accordion={accordion}
                    onPress={() => {
                      // set the accordion part active/visible or not for the clicked element
                      // identified by authority id
                      accordion[authority.authority.id] = !accordion[authority.authority.id];
                      setAccordion({ ...accordion });
                    }}
                    bottomDivider={
                      !!accordion[authority.authority.id] || index == authorities.length - 1
                    }
                    openWebScreen={openWebScreen}
                  />
                ))}

              {!!persons && !!persons.length && (
                <Persons
                  data={{ id: details.id, persons }}
                  accordion={accordion}
                  onPress={() => {
                    // set the accordion part active/visible or not for the clicked element
                    // identified by service id
                    accordion[details.id] = !accordion[details.id];
                    setAccordion({ ...accordion });
                  }}
                  openWebScreen={openWebScreen}
                  orientation={orientation}
                  dimensions={dimensions}
                />
              )}

              {!!sortedTextBlocks &&
                sortedTextBlocks.map((textBlock, index) =>
                  renderTextBlock(sortedTextBlocks, textBlock, index)
                )}

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
      }}
    </Query>
  );
  /* eslint-enable complexity */
};

const styles = StyleSheet.create({
  headerRight: {
    alignItems: 'center'
  },
  iconLeft: {
    paddingLeft: normalize(14),
    paddingRight: normalize(7)
  },
  iconRight: {
    paddingLeft: normalize(7),
    paddingRight: normalize(14)
  },
  sectionTitle: {
    backgroundColor: colors.transparent,
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12)
  },
  formContainer: {
    marginTop: normalize(21),
    paddingHorizontal: normalize(14)
  }
});

DetailScreen.navigationOptions = ({ navigation, navigationOptions }) => {
  const shareContent = navigation.getParam('shareContent', '');

  const { headerRight } = navigationOptions;

  return {
    headerLeft: <HeaderLeft navigation={navigation} />,
    headerRight: (
      <WrapperRow style={styles.headerRight}>
        {!!shareContent && (
          <TouchableOpacity
            onPress={() => openShare(shareContent)}
            accessibilityLabel={consts.a11yLabel.shareIcon}
            accessibilityHint={consts.a11yLabel.shareHint}
          >
            {device.platform === 'ios' ? (
              <Icon
                name="ios-share"
                iconColor={colors.lightestText}
                style={headerRight ? styles.iconLeft : styles.iconRight}
              />
            ) : (
              <Icon
                xml={share(colors.lightestText)}
                style={headerRight ? styles.iconLeft : styles.iconRight}
              />
            )}
          </TouchableOpacity>
        )}
        {!!headerRight && headerRight}
      </WrapperRow>
    )
  };
};

DetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
