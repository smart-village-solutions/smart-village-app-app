import { NavigationProp } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Pdf from 'react-native-pdf';

import { RegularText, SafeAreaViewFlex, WrapperRow } from '../components';
import { colors, consts, Icon, normalize } from '../config';
import { onDownloadAndSharePdf } from '../helpers';
import { useTrackScreenViewAsync } from '../hooks';
import { NetworkContext } from '../NetworkProvider';

const { MATOMO_TRACKING } = consts;

type PdfScreenProps = {
  navigation: NavigationProp<any>;
  route: { params: { pdfUrl: string; title: string; injectedJavaScript: string } };
};

export const PdfScreen = ({ navigation, route }: PdfScreenProps) => {
  const { isConnected } = useContext(NetworkContext);
  const trackScreenViewAsync = useTrackScreenViewAsync();
  const pdfUrl = route.params?.pdfUrl ?? '';
  const title = route.params?.title ?? '';
  const [pageCount, setPageCount] = useState<string>();

  // NOTE: we cannot use the `useMatomoTrackScreenView` hook here, as we need the `pdfUrl`
  //       dependency
  useEffect(() => {
    isConnected && pdfUrl && trackScreenViewAsync(`${MATOMO_TRACKING.SCREEN_VIEW.PDF} / ${pdfUrl}`);
  }, [pdfUrl]);

  useEffect(() => {
    if (title) {
      navigation.setOptions({
        headerRight: () => (
          <WrapperRow style={styles.headerRight}>
            <TouchableOpacity onPress={() => onDownloadAndSharePdf({ title, url: pdfUrl })}>
              <Icon.ArrowDownCircle color={colors.lightestText} style={styles.icon} />
            </TouchableOpacity>
          </WrapperRow>
        )
      });
    }
  }, [title]);

  if (!pdfUrl) return null;

  return (
    <SafeAreaViewFlex>
      <Pdf
        onPageChanged={(page, numberOfPages) => setPageCount(`${page}/${numberOfPages}`)}
        source={{ uri: pdfUrl, cache: true }}
        style={styles.pdf}
      />

      {!!pageCount && (
        <View style={styles.pageCountCountainer}>
          <RegularText>{pageCount}</RegularText>
        </View>
      )}
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    alignItems: 'center',
    paddingRight: normalize(7)
  },
  icon: {
    paddingHorizontal: normalize(10)
  },
  pageCountCountainer: {
    backgroundColor: colors.gray40,
    borderRadius: normalize(10),
    marginLeft: normalize(5),
    marginTop: normalize(5),
    padding: 10,
    position: 'absolute'
  },
  pdf: {
    flex: 1
  }
});
