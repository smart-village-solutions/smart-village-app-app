import Svg, { Path, Defs, LinearGradient, Stop, Text } from 'react-native-svg';

/* Use this if you are using Expo
import { Svg } from 'expo';
const { Circle, Rect } = Svg;
*/

import React from 'react';
import { View, StyleSheet } from 'react-native';

export default class SvgShape extends React.Component {
  render() {
    const { navigation } = this.props;
    const title = navigation.getParam('title', 0);
    return (
      <View style={{ borderWidth: 3, borderColor: 'red' }}>
        <Svg
          width="100%"
          height="100%"
          version="1.1"
          viewBox="0 0 500 482.4193"
          xmlns="http://www.w3.org/2000/Svg"
        >
          <Defs>
            <LinearGradient
              id="a"
              x2="1"
              gradientTransform="translate(83.053 -47.951) rotate(60) scale(667.79)"
              gradientUnits="userSpaceOnUse"
            >
              <Stop stopColor="#028143" offset="0" />
              <Stop stopColor="#26798e" offset="1" />
            </LinearGradient>
          </Defs>

          <Path
            d="m1.1369e-13 -3.1264e-13l500 2.2737e-13v475s-138.99-19.341-284-1-216 1-216 1z"
            fill="url(#a)"
          />
          <Text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">
            {title}
          </Text>
        </Svg>
      </View>
    );
  }
}

// how to place text on top of svg https://stackoverflow.com/questions/5546346/how-to-place-and-center-text-in-an-svg-rectangle
/** width="500"
          height="482.42"
          version="1.1"
          viewBox="17053026e-20 -3126388e-19 500 482.4193" : The ‘viewBox’ attribute, in conjunction with the ‘preserveAspectRatio’ attribute, provides the capability to stretch an SVG viewport to fit a particular container element.
          xmlns="http://www.w3.org/2000/Svg" */
