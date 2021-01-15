import _isArray from 'lodash/isArray';

import { DailyWeatherData, SimpleWeatherData, WeatherAlert, WeatherMap } from '../types';

type TemperatureData = {
  day: number;
  min: number;
  max: number;
  night: number;
  eve: number;
  morn: number;
};

const isTemperatureData = (data: unknown): data is TemperatureData => {
  return (
    typeof (data as TemperatureData)?.day === 'number' &&
    typeof (data as TemperatureData)?.min === 'number' &&
    typeof (data as TemperatureData)?.max === 'number' &&
    typeof (data as TemperatureData)?.night === 'number' &&
    typeof (data as TemperatureData)?.eve === 'number' &&
    typeof (data as TemperatureData)?.morn === 'number'
  );
};

const validateAlert = (data: unknown): data is WeatherAlert => {
  return (
    typeof (data as WeatherAlert).description === 'string' &&
    typeof (data as WeatherAlert).event === 'string' &&
    typeof (data as WeatherAlert).start === 'number' &&
    typeof (data as WeatherAlert).end === 'number'
  );
};

const validateDailyWeatherData = (data: unknown): data is DailyWeatherData => {
  return (
    typeof (data as DailyWeatherData)?.dt === 'number' &&
    isTemperatureData((data as DailyWeatherData).temp) &&
    typeof (data as DailyWeatherData)?.weather?.[0]?.icon === 'string'
  );
};

const validateSimpleWeatherData = (data: unknown): data is SimpleWeatherData => {
  return (
    typeof (data as SimpleWeatherData)?.dt === 'number' &&
    typeof (data as SimpleWeatherData)?.temp === 'number' &&
    typeof (data as SimpleWeatherData)?.weather?.[0]?.icon === 'string'
  );
};

export const hasHourlyWeather = (data: unknown): data is { hourly: SimpleWeatherData[] } => {
  return (
    _isArray((data as WeatherMap).hourly) &&
    (data as WeatherMap).hourly.reduce(
      (previousValue: boolean, currentValue) =>
        previousValue && validateSimpleWeatherData(currentValue),
      true
    )
  );
};

export const hasDailyWeather = (data: unknown): data is { daily: DailyWeatherData[] } => {
  return (
    _isArray((data as WeatherMap).daily) &&
    (data as WeatherMap).daily.reduce(
      (previousValue: boolean, currentValue) =>
        previousValue && validateDailyWeatherData(currentValue),
      true
    )
  );
};

export const parseValidAlerts = (data: unknown): WeatherAlert[] | undefined => {
  if (_isArray((data as WeatherMap).alerts)) {
    return (data as WeatherMap).alerts?.filter((alert) => validateAlert(alert));
  }
};
