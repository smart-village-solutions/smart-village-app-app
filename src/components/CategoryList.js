import _filter from 'lodash/filter';
import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, SectionList, StyleSheet } from 'react-native';

import { colors, normalize, texts } from '../config';

import { CategoryListItem } from './CategoryListItem';
import { LoadingContainer } from './LoadingContainer';
import { SectionHeader } from './SectionHeader';

export class CategoryList extends React.PureComponent {
  keyExtractor = (item, index) => `index${index}-id${item.id}`;

  renderSectionHeader = ({ section: { title, data } }) => {
    const { hasSectionHeader = true } = this.props;

    if (!title || !data?.length || !hasSectionHeader) return null;

    return <SectionHeader title={title} containerStyle={styles.sectionHeaderContainer} />;
  };

  render() {
    const {
      categoryTitles = {},
      data,
      ListFooterComponent,
      ListHeaderComponent,
      navigation,
      noSubtitle = false,
      queryVariables,
      refreshControl
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
          (category) =>
            !!category.pointsOfInterestTreeCount && (!category.parent || queryVariables.ids)
        )
      },
      {
        title: categoryTitlesTours,
        data: _filter(
          data,
          (category) => !!category.toursTreeCount && (!category.parent || queryVariables.ids)
        )
      }
    ];

    return (
      <SectionList
        keyExtractor={this.keyExtractor}
        sections={sectionedData}
        renderItem={({ item, index, section }) => (
          <CategoryListItem
            navigation={navigation}
            noSubtitle={noSubtitle}
            item={item}
            index={index}
            section={section}
            categoryTitles={{ categoryTitlesPointsOfInterest, categoryTitlesTours }}
          />
        )}
        renderSectionHeader={this.renderSectionHeader}
        ListFooterComponent={ListFooterComponent}
        ListHeaderComponent={ListHeaderComponent}
        stickySectionHeadersEnabled
        refreshControl={refreshControl}
        contentContainerStyle={styles.contentContainer}
      />
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: normalize(16)
  },
  sectionHeaderContainer: {
    paddingLeft: 0,
    paddingRight: 0
  }
});

CategoryList.propTypes = {
  categoryTitles: PropTypes.object,
  data: PropTypes.array,
  hasSectionHeader: PropTypes.bool,
  ListFooterComponent: PropTypes.object,
  ListHeaderComponent: PropTypes.object,
  navigation: PropTypes.object.isRequired,
  noSubtitle: PropTypes.bool,
  queryVariables: PropTypes.object,
  refreshControl: PropTypes.object
};
