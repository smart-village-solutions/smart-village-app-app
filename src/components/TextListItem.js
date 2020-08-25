import PropTypes from 'prop-types';
import React from 'react';
import { ListItem } from 'react-native-elements';

import { colors, normalize } from '../config';
import { arrowRight } from '../icons';
import { Icon } from './Icon';
import { RegularText, BoldText } from './Text';
import { Touchable } from './Touchable';
import { trimNewLines } from '../helpers';

export class TextListItem extends React.PureComponent {
  render() {
    const { navigation, noSubtitle, item } = this.props;
    const { routeName, params, subtitle, title, bottomDivider, topDivider } = item;

    return (
      <ListItem
        title={noSubtitle || !subtitle ? null : <RegularText small>{subtitle}</RegularText>}
        subtitle={<BoldText noSubtitle={noSubtitle}>{trimNewLines(title)}</BoldText>}
        bottomDivider={bottomDivider !== undefined ? bottomDivider : true}
        topDivider={topDivider !== undefined ? topDivider : false}
        containerStyle={{
          backgroundColor: colors.transparent,
          paddingVertical: normalize(12)
        }}
        rightIcon={<Icon icon={arrowRight(colors.primary)} />}
        onPress={() =>
          navigation.navigate({
            routeName,
            params
          })
        }
        delayPressIn={0}
        Component={Touchable}
      />
    );
  }
}

TextListItem.propTypes = {
  navigation: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  noSubtitle: PropTypes.bool
};

TextListItem.defaultProps = {
  noSubtitle: false
};
