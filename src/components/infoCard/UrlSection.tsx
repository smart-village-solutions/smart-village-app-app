import React, { Fragment } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Divider } from 'react-native-elements';

import { colors, consts, Icon, normalize } from '../../config';
import { openLink } from '../../helpers';
import { WebUrl } from '../../types';
import { RegularText } from '../Text';
import { WrapperRow, WrapperVertical } from '../Wrapper';

type Props = {
  webUrls: WebUrl[];
};

export const UrlSection = ({ webUrls }: Props) => (
  <>
    {webUrls.map((item, index) => {
      const { url, description } = item;
      const a11yText = consts.a11yLabel;

      if (!url) {
        return null;
      }

      return (
        <Fragment key={index}>
          <TouchableOpacity
            accessibilityLabel={`
              ${a11yText.website} (${description || url}) ${a11yText.button} ${a11yText.webViewHint}
            `}
            onPress={() => openLink(url)}
          >
            <WrapperVertical>
              <WrapperRow centerVertical>
                <Icon.Url style={styles.margin} />
                {!description || !!description?.startsWith('url') ? (
                  <RegularText primary>{url}</RegularText>
                ) : (
                  <RegularText primary>{description}</RegularText>
                )}
              </WrapperRow>
            </WrapperVertical>
          </TouchableOpacity>

          <Divider style={styles.divider} />
        </Fragment>
      );
    })}
  </>
);

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.placeholder
  },
  margin: {
    marginRight: normalize(12),
    marginTop: normalize(-1)
  }
});
