import PropTypes from 'prop-types';
import React from 'react';

import { Touchable, RegularText } from '../';
import { Button } from '../Button';

export const ConsulSortingButtons = (item) => {
  const {
    item: { title, type },
    orderType,
    onPress,
    buttonType
  } = item;

  switch (buttonType) {
    case 'type1':
      return (
        <Button onPress={onPress} title={title} invert={orderType !== type}>
          <RegularText underline={orderType === type} primary={orderType === type}>
            {title}
          </RegularText>
        </Button>
      );
    case 'type2':
      return (
        <Touchable onPress={onPress}>
          <RegularText underline={orderType === type} primary={orderType === type}>
            {title}
          </RegularText>
        </Touchable>
      );
    default:
      break;
  }
};

ConsulSortingButtons.propTypes = {
  item: PropTypes.object.isRequired
};
