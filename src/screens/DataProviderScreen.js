import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView } from 'react-native';

import { HeaderLeft, Logo, RegularText, Wrapper } from '../components';
import { CrossDataSection } from '../components/CrossDataSection';
import { texts } from '../config';

export const DataProviderScreen = ({ navigation }) => {
  const dataProviderId = navigation.getParam('dataProviderId');
  const dataProviderName = navigation.getParam('dataProviderName');
  const logo = navigation.getParam('logo');

  if (!dataProviderId || !dataProviderName) {
    return (
      <Wrapper>
        <RegularText>{texts.errors.unexpected}</RegularText>
      </Wrapper>
    );
  }

  return (
    <ScrollView>
      {!!logo && (
        <Wrapper>
          <Logo source={{ uri: logo }} />
        </Wrapper>
      )}

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
