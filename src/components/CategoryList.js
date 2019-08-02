import PropTypes from 'prop-types';
import React from 'react';
import { ListItem } from 'react-native-elements';
import { ActivityIndicator, SectionList, View } from 'react-native';
import _filter from 'lodash/filter';

import { colors, device, normalize, texts } from '../config';
import { arrowRight } from '../icons';
import { Icon } from './Icon';
import { RegularText, BoldText } from './Text';
import { Touchable } from './Touchable';
import { Title, TitleContainer, TitleShadow } from './Title';
import { Wrapper } from './Wrapper';

export class CategoryList extends React.PureComponent {
  state = {
    listEndReached: false
  };

  keyExtractor = (item, index) => `index${index}-id${item.id}`;

  renderItem = ({ item, index, section }) => {
    const { navigation, noSubtitle } = this.props;
    const {
      routeName,
      params,
      subtitle,
      title,
      pointsOfInterestCount,
      toursCount,
      bottomDivider,
      topDivider
    } = item;

    const count = pointsOfInterestCount > 0 ? pointsOfInterestCount : toursCount;

    return (
      <ListItem
        title={noSubtitle || !subtitle ? null : <RegularText small>{subtitle}</RegularText>}
        subtitle={<BoldText noSubtitle={noSubtitle}>{`${title} (${count})`}</BoldText>}
        bottomDivider={
          bottomDivider !== undefined
            ? bottomDivider
            : item.toursCount > 0
              ? index < section.data.length - 1 // do not show a bottomDivider after last tours entry
              : true
        }
        topDivider={topDivider !== undefined ? topDivider : false}
        containerStyle={{
          backgroundColor: colors.transparent,
          paddingVertical: normalize(12)
        }}
        rightIcon={<Icon icon={arrowRight(colors.primary)} />}
        onPress={() =>
          navigation.navigate({
            routeName,
            params,
            key: 'Category'
          })
        }
        delayPressIn={0}
        Component={Touchable}
      />
    );
  };

  renderSectionHeader = ({ section: { title } }) => (
    <View>
      <TitleContainer>
        <Title>{title}</Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
    </View>
  );

  render() {
    const { listEndReached } = this.state;
    const { data } = this.props;

    const sectionedData = [
      {
        title: texts.categoryTitles.tours,
        data: _filter(data, (category) => category.toursCount > 0)
      },
      {
        title: texts.categoryTitles.pointsOfInterest,
        data: _filter(data, (category) => category.pointsOfInterestCount > 0)
      }
    ];

    return (
      <SectionList
        keyExtractor={this.keyExtractor}
        sections={sectionedData}
        renderItem={this.renderItem}
        renderSectionHeader={this.renderSectionHeader}
        ListHeaderComponent={
          <Wrapper>
            <RegularText>{texts.categoryList.intro}</RegularText>
          </Wrapper>
        }
        ListFooterComponent={
          data.length > 10 &&
          !listEndReached && <ActivityIndicator style={{ margin: normalize(14) }} />
        }
        onEndReached={() => this.setState({ listEndReached: true })}
        removeClippedSubviews
        stickySectionHeadersEnabled={false}
      />
    );
  }
}

CategoryList.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  noSubtitle: PropTypes.bool
};

CategoryList.defaultProps = {
  noSubtitle: false
};
