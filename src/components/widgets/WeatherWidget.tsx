import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { normalize } from '../../config';
import { Image } from '../Image';
import { BoldText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow } from '../Wrapper';

// type WeatherData = {
//   icon: string;
//   temperature: number;
// };

// const isNumber = (value: any): value is number => {
//   return typeof value === 'number';
// };

// const isString = (value: any): value is string => {
//   return typeof value === 'string';
// };

// const parseResponse = (json: any) => {
//   const parsedResponse: Partial<WeatherData> = {};

//   const icon = json?.current?.weather?.[0]?.icon;
//   if (isString(icon))
//     parsedResponse.icon = icon;

//   const temp = json?.current?.temp;
//   if (isNumber(temp)){
//     parsedResponse.temperature = temp;
//   }

//   return parsedResponse;
// };

// const fetchWeatherData = async (setWeatherData: React.Dispatch<React.SetStateAction<Partial<WeatherData>>>) => {
//   const apiKey = secrets[namespace as (keyof typeof secrets)].openWeatherApiKey;

//   //bad belzig
//   const lon = 12.6;
//   const lat = 52.133331;

//   const requestPath =
//     `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&exclude=minutely`;

//   // const response = await fetch(requestPath).catch((e) => console.log({e}));
//   const response = { json: () => {
//     return {current: {weather: [{icon: 'test'}]}};
//   }};

//   if (response) {
//     const json = await response.json();
//     console.log(json?.current);
//     console.log(json?.hourly);
//     console.log(json?.daily);
//     const weatherData = parseResponse(json);

//     setWeatherData(weatherData);
//   }
// };

export const WeatherWidget = ({ navigation }: { navigation: NavigationScreenProp<never> }) => {
  // const [weatherData, setWeatherData] = useState<Partial<WeatherData>>({});
  //lat={lat}&lon={lon}&exclude={part}&appid={API key}

  // useEffect(() => {
  //   fetchWeatherData(setWeatherData);
  // }, [setWeatherData]);

  // console.log({weatherData, widget: true});

  const icon = '09n';
  const temperature = 12.5;

  return (
    <Touchable
      onPress={() => navigation?.navigate('Weather', { weatherData: { icon, temperature } })}
      style={styles.widget}
    >
      <Wrapper>
        <WrapperRow center>
          <View style={styles.iconContainer}>
            <Image
              source={{ uri: `http://openweathermap.org/img/wn/${icon}@2x.png` }}
              style={styles.icon}
            />
          </View>
          <View>
            <BoldText primary big>
              {temperature}°C
            </BoldText>
            <BoldText primary small>
              Wetter
            </BoldText>
          </View>
        </WrapperRow>
      </Wrapper>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  icon: {
    aspectRatio: 1,
    resizeMode: 'contain',
    width: normalize(44)
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  widget: {
    alignItems: 'center'
  }
});
