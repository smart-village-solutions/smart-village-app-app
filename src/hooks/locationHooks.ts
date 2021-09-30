import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

const requestAndFetchPosition = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status === Location.PermissionStatus.GRANTED) {
    return await Location.getCurrentPositionAsync({});
  }
};

export const usePosition = (enabled: boolean) => {
  const [position, setPosition] = useState<Location.LocationObject>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (enabled) {
      setLoading(true);
      requestAndFetchPosition()
        .then((result) => {
          if (mounted && result) {
            setPosition(result);
          }
        })
        .finally(() => setLoading(false));
    }
    return () => {
      mounted = false;
    };
  }, [enabled]);

  return { loading, position: enabled ? position : undefined };
};
