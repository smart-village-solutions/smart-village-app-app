import PropTypes from 'prop-types';
import React from 'react';
import { SectionList, View } from 'react-native';

import { TitleShadow, Title, TitleContainer } from '../../Title';
import { consts, device } from '../../../config';

import { ConsulListItem } from './ConsulListItem';

const renderSectionHeader = ({ section: { title, data } }) => {
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

export const ConsulListComponent = ({ data, navigation }) => {
  return (
    <SectionList
      sections={data}
      keyExtractor={(item, index) => item + index}
      renderItem={({ item }) => <ConsulListItem item={item} navigation={navigation} />}
      renderSectionHeader={renderSectionHeader}
    />
  );
};

ConsulListComponent.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired
};
