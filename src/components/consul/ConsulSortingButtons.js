import PropTypes from 'prop-types';
import React from 'react';

import { Touchable, RegularText } from '../';
import { Button } from '../Button';
import { BoldText } from '../Text';

export const ConsulSortingButtons = (item) => {
  const {
    item: { title, type },
    orderType,
    onPress,
    buttonType
  } = item;

  switch (buttonType) {
    case 'type1':
      return <Button onPress={onPress} title={title} invert={orderType !== type} />;
    case 'type2':
      return (
        <Touchable onPress={onPress}>
          {orderType === type ? (
            <BoldText underline primary>
              {title}
            </BoldText>
          ) : (
            <RegularText placeholder>{title}</RegularText>
          )}
        </Touchable>
      );
    default:
      break;
  }
};

ConsulSortingButtons.propTypes = {
  item: PropTypes.object.isRequired
};
