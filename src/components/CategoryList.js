import PropTypes from 'prop-types';
import React from 'react';
import { SectionList, View } from 'react-native';
import _filter from 'lodash/filter';

import { device, texts } from '../config';
import { RegularText } from './Text';
import { Title, TitleContainer, TitleShadow } from './Title';
import { Wrapper } from './Wrapper';
import { CategoryListItem } from './CategoryListItem';

export class CategoryList extends React.PureComponent {
  keyExtractor = (item, index) => `index${index}-id${item.id}`;

  renderSectionHeader = ({ section: { title } }) => (
    <View>
      <TitleContainer>
        <Title>{title}</Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
    </View>
  );

  render() {
    const { data, navigation, noSubtitle, refreshControl } = this.props;

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
        initialNumToRender={data.length}
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
          <Wrapper>
            <RegularText>{texts.categoryList.intro}</RegularText>
          </Wrapper>
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
  refreshControl: PropTypes.object
};

CategoryList.defaultProps = {
  noSubtitle: false
};
