import PropTypes from 'prop-types';
import React from 'react';

import { Wrapper, WrapperRow } from '../../Wrapper';
import { texts } from '../../../config';
import { RegularText } from '../../Text';
import { momentFormatUtcToLocal } from '../../../helpers';
import { Touchable } from '../../Touchable';

const text = texts.consul;

export const ConsulPublicAuthorComponent = ({ authorData, onPress }) => {
  const { publicAuthor, commentsCount, publicCreatedAt, userId } = authorData;

  return (
    <Wrapper>
      <WrapperRow>
        <RegularText primary>{publicAuthor ? publicAuthor.username : 'Privat'}</RegularText>
        <RegularText> · </RegularText>
        <RegularText smallest>{momentFormatUtcToLocal(publicCreatedAt)}</RegularText>
        <RegularText> · </RegularText>
        <RegularText smallest>
          {commentsCount} {commentsCount > 1 || commentsCount === 0 ? text.comments : text.comment}
        </RegularText>
        {publicAuthor && publicAuthor.id === userId && (
          <>
            <RegularText> · </RegularText>
            <Touchable onPress={onPress}>
              <RegularText primary smallest>
                {text.startNew.updateButtonLabel}
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
