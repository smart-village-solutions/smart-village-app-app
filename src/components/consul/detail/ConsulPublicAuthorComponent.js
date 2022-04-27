import PropTypes from 'prop-types';
import React from 'react';

import { Wrapper, WrapperRow } from '../../Wrapper';
import { texts } from '../../../config';
import { RegularText } from '../../Text';
import { momentFormatUtcToLocal } from '../../../helpers';
import { Touchable } from '../../Touchable';

export const ConsulPublicAuthorComponent = ({ authorData, onPress }) => {
  const { publicAuthor, commentsCount, publicCreatedAt, userId } = authorData;

  return (
    <Wrapper>
      <WrapperRow>
        <RegularText primary>{publicAuthor ? publicAuthor.username : 'Privat'}</RegularText>
        <RegularText> · </RegularText>

        {!!publicCreatedAt && (
          <>
            <RegularText smallest>{momentFormatUtcToLocal(publicCreatedAt)}</RegularText>
            <RegularText> · </RegularText>
          </>
        )}

        <RegularText smallest>
          {commentsCount}{' '}
          {commentsCount > 1 || commentsCount === 0 ? texts.consul.comments : texts.consul.comment}
        </RegularText>

        {publicAuthor && publicAuthor.id === userId && (
          <>
            <RegularText> · </RegularText>
            <Touchable onPress={onPress}>
              <RegularText primary smallest>
                {texts.consul.startNew.updateButtonLabelOnDetailScreen}
              </RegularText>
            </Touchable>
          </>
        )}
      </WrapperRow>
    </Wrapper>
  );
};

ConsulPublicAuthorComponent.propTypes = {
  authorData: PropTypes.object.isRequired,
  onPress: PropTypes.func
};
