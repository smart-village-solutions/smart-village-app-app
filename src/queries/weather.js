import gql from 'graphql-tag';

export const GET_WEATHER = gql`
  query WeatherMap {
    weatherMap {
      current
      hourly
      daily
      alerts
    }
  }
`;

export const GET_WEATHER_CURRENT = gql`
  query WeatherMapCurrent {
    weatherMap {
      current
    }
  }
`;
