import _filter from 'lodash/filter';
import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, SectionList, View } from 'react-native';

import { colors, consts, device, texts } from '../config';

import { CategoryListItem } from './CategoryListItem';
import { LoadingContainer } from './LoadingContainer';
import { Title, TitleContainer, TitleShadow } from './Title';

export class CategoryList extends React.PureComponent {
  keyExtractor = (item, index) => `index${index}-id${item.id}`;

  renderSectionHeader = ({ section: { title, data } }) => {
    const { hasSectionHeader } = this.props;

    if (!title || !data?.length || !hasSectionHeader) return null;

    return (
      <View>
        <TitleContainer>
          <Title accessibilityLabel={`${title} ${consts.a11yLabel.heading}`}>{title}</Title>
        </TitleContainer>
        {device.platform === 'ios' && <TitleShadow />}
      </View>
    );
  };

  render() {
    const {
      categoryTitles = {},
      data,
      navigation,
      noSubtitle,
      refreshControl,
      ListFooterComponent,
      ListHeaderComponent
    } = this.props;
    const {
      categoryTitlesPointsOfInterest = texts.categoryTitles.pointsOfInterest,
      categoryTitlesTours = texts.categoryTitles.tours
    } = categoryTitles;

    if (!data?.length) {
      return (
        <LoadingContainer>
          <ActivityIndicator color={colors.refreshControl} />
        </LoadingContainer>
      );
    }

    // Sorting data alphabetically
    data.sort((a, b) => a.title.localeCompare(b.title));

    const sectionedData = [
      {
        title: categoryTitlesPointsOfInterest,
        data: _filter(
          data,
          (category) => category.pointsOfInterestTreeCount > 0 && !category.parent
        )
      },
      {
        title: categoryTitlesTours,
        data: _filter(data, (category) => category.toursTreeCount > 0 && !category.parent)
      }
    ];

    return (
      <SectionList
        keyExtractor={this.keyExtractor}
        sections={sectionedData}
        initialNumToRender={data.length > 1 ? data.length : 2}
        renderItem={({ item, index, section }) => (
          <CategoryListItem
            navigation={navigation}
            noSubtitle={noSubtitle}
            item={item}
            index={index}
            section={section}
          />
        )}
        renderSectionHeader={this.renderSectionHeader}
        ListFooterComponent={ListFooterComponent}
        ListHeaderComponent={ListHeaderComponent}
        stickySectionHeadersEnabled
        refreshControl={refreshControl}
      />
    );
  }
}

CategoryList.propTypes = {
  navigation: PropTypes.object.isRequired,
  categoryTitles: PropTypes.object,
  data: PropTypes.array,
  noSubtitle: PropTypes.bool,
  refreshControl: PropTypes.object,
  hasSectionHeader: PropTypes.bool,
  ListFooterComponent: PropTypes.object,
  ListHeaderComponent: PropTypes.object
};

CategoryList.defaultProps = {
  noSubtitle: false,
  hasSectionHeader: true
};
