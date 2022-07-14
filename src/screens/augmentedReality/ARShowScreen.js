import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { LoadingSpinner, RegularText, SafeAreaViewFlex } from '../../components';

export const ARShowScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const data = route?.params?.data ?? [];
  const [object, setObject] = useState();
  const index = route?.params?.index;

  useEffect(() => {
    parser();
  }, []);

  const parser = async () => {
    await objectParser({ item: data?.[index], setObject, setIsLoading });
  };

  if (isLoading || !object) return <LoadingSpinner loading />;

  return (
    <SafeAreaViewFlex>
      <RegularText>AR Show Screen</RegularText>
      <RegularText onPress={() => navigation.goBack()}>Zurück</RegularText>
    </SafeAreaViewFlex>
  );
};

const objectParser = async ({ item, setObject, setIsLoading }) => {
  let parsedObject = {};

  item?.localUris?.forEach((item) => {
    parsedObject[item.type] = item.uri;
  });

  setObject(parsedObject);
  setIsLoading(false);
};

ARShowScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
