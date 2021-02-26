import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView } from 'react-native';

import { HeaderLeft, RegularText, Wrapper } from '../components';
import { CrossDataSection } from '../components/CrossDataSection';
import { texts } from '../config';

export const DataProviderScreen = ({ navigation }) => {
  const dataProviderId = navigation.getParam('dataProviderId');
  const dataProviderName = navigation.getParam('dataProviderName');

  if (!dataProviderId || !dataProviderName) {
    return (
      <Wrapper>
        <RegularText>{texts.errors.unexpected}</RegularText>
      </Wrapper>
    );
  }

  return (
    <ScrollView>
      <CrossDataSection
        dataProviderId={dataProviderId}
        dataProviderName={dataProviderName}
        navigation={navigation}
      />
    </ScrollView>
  );
};

DataProviderScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};

DataProviderScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
