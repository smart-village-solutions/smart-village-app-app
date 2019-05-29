import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';

import {
  DiagonalGradient,
  PointOfInterest,
  Wrapper,
  WrapperRow,
  WrapperPreice
} from '../../components';

export const PriceCard = () => (
  <WrapperPreice>
    <View
      style={{
        width: 100,
        height: 100,
        backgroundColor: '#3f745f',
        marginBottom: 10
      }}
    />
    <View
      style={{
        width: 100,
        height: 100,
        backgroundColor: '#3f745f',
        marginBottom: 10
      }}
    />
    <View
      style={{
        width: 100,
        height: 100,
        backgroundColor: '#3f745f',
        marginBottom: 10
      }}
    />
    <View
      style={{
        width: 100,
        height: 100,
        backgroundColor: '#3f745f',
        marginBottom: 10
      }}
    />
  </WrapperPreice>
);

//
/* <PricingCard
color="#fff"
title="Erwachsene"
price="EUR 2,50"
button={{ buttonStyle= color:  '#3f745f' }}
containerStyle={{ backgroundColor: '#3f745f' }}
/>
<PricingCard
color="#fff"
title="Ermäßigung"
price="EUR 1,50"
button={{ title: 'GET STARTED', icon: 'flight-takeoff' }}
containerStyle={{ backgroundColor: '#3f745f' }}
/>
<PricingCard
color="#fff"
title="Familien"
price="EUR 6,50"
info={['1 User', 'Basic Support', 'All Core Features']}
button={{ title: 'GET STARTED', icon: 'flight-takeoff' }}
containerStyle={{ backgroundColor: '#3f745f' }}
/>
<PricingCard
color="#fff"
title="Kurzbesuch"
price="EUR 1,00"
info={['1 User', 'Basic Support', 'All Core Features']}
button={{ title: 'GET STARTED', icon: 'flight-takeoff' }}
containerStyle={{ backgroundColor: '#3f745f' }}
/> */
