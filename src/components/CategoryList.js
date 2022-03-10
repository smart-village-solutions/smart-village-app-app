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
    if (!data?.length) return null;

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
      data,
      navigation,
      noSubtitle,
      refreshControl,
      scrollEnabled,
      noSectionHeader
    } = this.props;

    const sectionedData = [
      {
        title: texts.categoryTitles.pointsOfInterest,
        data: _filter(data, (category) => category.pointsOfInterestCount > 0)
      },
      {
        title: texts.categoryTitles.tours,
        data: _filter(data, (category) => category.toursCount > 0)
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
        renderSectionHeader={noSectionHeader ? null : this.renderSectionHeader}
        ListHeaderComponent={
          !!texts.categoryList.intro && (
            <Wrapper>
              <RegularText>{texts.categoryList.intro}</RegularText>
            </Wrapper>
          )
        }
        stickySectionHeadersEnabled
        refreshControl={refreshControl}
        scrollEnabled={scrollEnabled}
      />
    );
  }
}

CategoryList.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  noSubtitle: PropTypes.bool,
  refreshControl: PropTypes.object,
  scrollEnabled: PropTypes.bool,
  noSectionHeader: PropTypes.bool
};

CategoryList.defaultProps = {
  noSubtitle: false,
  noSectionHeader: false
};
