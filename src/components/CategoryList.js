import PropTypes from 'prop-types';
import React from 'react';
import { SectionList, View } from 'react-native';
import _filter from 'lodash/filter';

import { device, consts, texts } from '../config';

import { RegularText } from './Text';
import { Title, TitleContainer, TitleShadow } from './Title';
import { Wrapper } from './Wrapper';
import { CategoryListItem } from './CategoryListItem';

export class CategoryList extends React.PureComponent {
  keyExtractor = (item, index) => `index${index}-id${item.id}`;

  renderSectionHeader = ({ section: { title, data } }) => {
    const { hasSectionHeader } = this.props;

    if (!data?.length || !hasSectionHeader) return null;

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
    const { data, navigation, noSubtitle, refreshControl, hasSectionHeader } = this.props;

    // Sorting data alphabetically
    data.sort((a, b) => a.title.localeCompare(b.title));

    const sectionedData = [
      {
        title: texts.categoryTitles.pointsOfInterest,
        data: _filter(
          data,
          (category) => category.pointsOfInterestTreeCount > 0 && !category.parent
        )
      },
      {
        title: texts.categoryTitles.tours,
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
        ListHeaderComponent={
          hasSectionHeader &&
          !!texts.categoryList.intro && (
            <Wrapper>
              <RegularText>{texts.categoryList.intro}</RegularText>
            </Wrapper>
          )
        }
        stickySectionHeadersEnabled
        refreshControl={refreshControl}
      />
    );
  }
}

CategoryList.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  noSubtitle: PropTypes.bool,
  refreshControl: PropTypes.object,
  hasSectionHeader: PropTypes.bool
};

CategoryList.defaultProps = {
  noSubtitle: false,
  hasSectionHeader: true
};
