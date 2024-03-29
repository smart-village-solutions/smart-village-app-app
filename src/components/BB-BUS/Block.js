import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, normalize } from '../../config';
import { Title } from '../Title';
import { Touchable } from '../Touchable';

export const Block = ({ bottomDivider, children, initiallyOpen, title }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const onPress = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  return (
    <>
      <ListItem
        bottomDivider={isOpen || bottomDivider}
        topDivider
        containerStyle={styles.sectionTitle}
        onPress={onPress}
        delayPressIn={0}
        Component={Touchable}
      >
        <ListItem.Content>
          <Title small>{title}</Title>
        </ListItem.Content>

        <Title>{isOpen ? '－' : '＋'}</Title>
      </ListItem>
      {isOpen && children}
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    backgroundColor: colors.transparent,
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12)
  }
});

Block.propTypes = {
  bottomDivider: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  initiallyOpen: PropTypes.bool,
  title: PropTypes.string.isRequired
};
