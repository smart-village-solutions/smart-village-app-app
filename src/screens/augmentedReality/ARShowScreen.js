import PropTypes from 'prop-types';
import React from 'react';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RegularText, SafeAreaViewFlex } from '../../components';
import { LoadingSpinner, RegularText } from '../../components';

export const ARShowScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const data = route?.params?.data ?? [];
  const [object, setObject] = useState();
  const index = route?.params?.index;

  useEffect(() => {
    parser();
  }, []);

  const parser = async () => {
    await objectParser({ item: data[index], setObject });
    setIsLoading(false);
  };

  if (isLoading || !object) return <LoadingSpinner loading />;

export const ARShowScreen = ({ navigation }) => {
  return (
    <SafeAreaViewFlex>
      <RegularText>AR Show Screen</RegularText>
      <RegularText onPress={() => navigation.goBack()}>Zurück</RegularText>
    </SafeAreaViewFlex>
  );
};

const objectParser = async ({ item, setObject }) => {
  let parsedObject = {};

  item.localUris?.find((item) => {
    if (item.type === 'vrx') {
      parsedObject.vrx = item.uri;
    }
    if (item.type === 'png') {
      parsedObject.png = item.uri;
    }
    if (item.type === 'mp3') {
      parsedObject.mp3 = item.uri;
    }
  });

  setObject(parsedObject);
};
ARShowScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
};
