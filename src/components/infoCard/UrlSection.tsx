import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { NewIcon, normalize } from '../../config';
import { openLink } from '../../helpers';
import { WebUrl } from '../../types';
import { RegularText } from '../Text';
import { InfoBox } from '../Wrapper';

type Props = {
  openWebScreen: (link: string) => void;
  webUrls: WebUrl[];
};

export const UrlSection = ({ openWebScreen, webUrls }: Props) => (
  <>
    {webUrls.map((item, index) => {
      const { url, description } = item;

      if (!url) {
        return null;
      }

      return (
        <InfoBox key={index}>
          <NewIcon.Url style={styles.margin} />
          <TouchableOpacity
            accessibilityLabel={`(Webseite) ${
              description || url
            } (Taste) (Öffnet Webseite in der aktuellen App)`}
            onPress={() => openLink(url, openWebScreen)}
          >
            {!description || !!description?.startsWith('url') ? (
              <RegularText primary>{url}</RegularText>
            ) : (
              <RegularText primary>{description}</RegularText>
            )}
          </TouchableOpacity>
        </InfoBox>
      );
    })}
  </>
);

const styles = StyleSheet.create({
  margin: {
    marginRight: normalize(10)
  }
});
