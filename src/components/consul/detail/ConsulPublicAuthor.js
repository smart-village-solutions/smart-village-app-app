import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { normalize, texts } from '../../../config';
import { momentFormatUtcToLocal } from '../../../helpers';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { VolunteerAvatar } from '../../volunteer';
import { WrapperRow } from '../../Wrapper';

export const ConsulPublicAuthor = ({ authorData, onPress }) => {
  const { publicAuthor, commentsCount, publicCreatedAt, userId } = authorData;

  return (
    <WrapperRow style={styles.userInfoContainer}>
      <VolunteerAvatar
        item={{ user: { display_name: publicAuthor ? publicAuthor.username : 'Privat' } }}
      />

      <View style={styles.authorStyle}>
        <RegularText>{publicAuthor ? publicAuthor.username : 'Privat'}</RegularText>

        <WrapperRow>
          {!!publicCreatedAt && (
            <RegularText smallest>{momentFormatUtcToLocal(publicCreatedAt)}</RegularText>
          )}

          {!!commentsCount && (
            <>
              <RegularText> · </RegularText>
              <RegularText smallest>
                {commentsCount}{' '}
                {commentsCount > 1 || commentsCount === 0
                  ? texts.consul.comments
                  : texts.consul.comment}
              </RegularText>
            </>
          )}

          {!!onPress && (
            <>
              {publicAuthor?.id === userId && (
                <>
                  <RegularText> · </RegularText>
                  <Touchable onPress={onPress}>
                    <RegularText primary smallest>
                      {texts.consul.startNew.editButtonLabelOnDetailScreen}
                    </RegularText>
                  </Touchable>
                </>
              )}
            </>
          )}
        </WrapperRow>
      </View>
    </WrapperRow>
  );
};

ConsulPublicAuthor.propTypes = {
  authorData: PropTypes.object.isRequired,
  onPress: PropTypes.func,
  canEdit: PropTypes.boolean
};

const styles = StyleSheet.create({
  authorStyle: {
    marginLeft: normalize(6)
  },
  userInfoContainer: {
    alignItems: 'center'
  }
});
