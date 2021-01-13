export type DailyWeatherData = {
  dt: number;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  weather: [
    {
      icon: string;
    }
  ];
};

export type SimpleWeatherData = {
  dt: number;
  temp: number;
  weather: [
    {
      icon: string;
    }
  ];
};

export type WeatherAlert = {
  event: string;
  start: number;
  end: number;
  description: string;
};

export type WeatherMap = {
  current: SimpleWeatherData;
  hourly: SimpleWeatherData[];
  daily: DailyWeatherData[];
  alerts: WeatherAlert[] | null;
};
