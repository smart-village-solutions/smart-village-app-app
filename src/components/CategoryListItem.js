import _upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Badge, ListItem } from 'react-native-elements';

import { colors, consts, Icon, IconUrl, normalize } from '../config';

import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';

export class CategoryListItem extends React.PureComponent {
  render() {
    const { categoryTitles, index, item, navigation, noSubtitle = false, section } = this.props;
    const {
      bottomDivider,
      iconName,
      params,
      pointsOfInterestTreeCount,
      routeName: name,
      subtitle,
      title,
      topDivider,
      toursTreeCount
    } = item;
    const { categoryTitlesPointsOfInterest } = categoryTitles;
    const count =
      section.title === categoryTitlesPointsOfInterest ? pointsOfInterestTreeCount : toursTreeCount;

    const IconKey = iconName ? _upperFirst(iconName) : undefined;
    const SelectedIcon = IconKey && Icon[IconKey] ? Icon[IconKey] : null;

    return (
      <ListItem
        bottomDivider={
          bottomDivider !== undefined
            ? bottomDivider
            : item.toursTreeCount > 0
            ? index < section.data.length - 1 // do not show a bottomDivider after last entry
            : true
        }
        topDivider={topDivider !== undefined ? topDivider : false}
        containerStyle={styles.container}
        onPress={() => navigation.push(name, params)}
        delayPressIn={0}
        Component={Touchable}
        accessibilityLabel={`(${title}) ${consts.a11yLabel.poiCount} ${count} ${consts.a11yLabel.button}`}
      >
        {iconName ? (
          SelectedIcon ? (
            <SelectedIcon color={colors.darkText} />
          ) : (
            <IconUrl iconName={iconName} />
          )
        ) : null}

        <ListItem.Content>
          {noSubtitle || !subtitle ? null : <RegularText small>{subtitle}</RegularText>}
          <BoldText noSubtitle={noSubtitle}>{title}</BoldText>
        </ListItem.Content>

        <Badge value={count} badgeStyle={styles.badge} textStyle={styles.badgeText} />

        <Icon.ArrowRight color={colors.darkText} size={normalize(18)} />
      </ListItem>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    paddingHorizontal: 0,
    paddingVertical: normalize(15.8)
  },
  badge: {
    backgroundColor: colors.transparent,
    borderWidth: 0,
    flex: 1
  },
  badgeText: {
    color: colors.darkText,
    fontSize: normalize(14),
    fontFamily: 'bold',
    lineHeight: normalize(20)
  }
});

CategoryListItem.propTypes = {
  categoryTitles: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  item: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  noSubtitle: PropTypes.bool,
  section: PropTypes.object.isRequired
};
