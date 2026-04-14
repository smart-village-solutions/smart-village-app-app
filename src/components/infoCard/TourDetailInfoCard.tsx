import * as Location from 'expo-location';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { colors, Icon, normalize, texts } from '../../config';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

type Props = {
  currentPosition?: Location.LocationObject;
  tourStopData: {
    location?: {
      geoLocation?: {
        latitude?: number;
        longitude?: number;
      };
    };
  };
};

export const TourDetailInfoCard = ({ currentPosition, tourStopData }: Props) => {
  const [localPosition, setLocalPosition] = useState<Location.LocationObject | undefined>(
    currentPosition
  );

  // Re-fetch the device position every 10 seconds so displayed data stays up-to-date.
  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const position = await Location.getCurrentPositionAsync({});
        setLocalPosition(position);
      } catch {
        // Position unavailable — keep last known value.
      }
    };

    fetchPosition();

    const interval = setInterval(fetchPosition, 10_000);

    return () => clearInterval(interval);
  }, []);

  const lat1 = localPosition?.coords.latitude;
  const lon1 = localPosition?.coords.longitude;
  const lat2 = tourStopData?.location?.geoLocation?.latitude;
  const lon2 = tourStopData?.location?.geoLocation?.longitude;

  // Tracks the device's current compass heading in degrees (0 = North).
  const [deviceHeading, setDeviceHeading] = useState<number>(0);

  // Stores the cumulative rotation to always animate along the shortest arc.
  const cumulativeRotation = useRef<number>(0);
  // useState ensures the Animated.Value is stable across renders without accessing .current during render.
  const [arrowRotation] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const subscribe = async () => {
      try {
        subscription = await Location.watchHeadingAsync((headingData) => {
          // trueHeading is -1 when unavailable (e.g. no GPS fix), fall back to magHeading.
          const heading =
            headingData.trueHeading >= 0 ? headingData.trueHeading : headingData.magHeading;
          setDeviceHeading(heading);
        });
      } catch {
        // Heading unavailable (missing permissions or unsupported hardware) — arrow stays hidden.
      }
    };

    subscribe();

    return () => {
      subscription?.remove();
    };
  }, []);

  const distanceText = useMemo(() => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;

    const deg2rad = (deg: number) => deg * (Math.PI / 180);
    const R = 6371000; // metres
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    const metres = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    if (metres < 1000) {
      return `${Math.round(metres)} m`;
    }

    return `${(metres / 1000).toFixed(1)} km`;
  }, [lat1, lon1, lat2, lon2]);

  // Absolute bearing from current position to the tour stop (degrees from North, clockwise).
  const absoluteBearing = useMemo(() => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;

    const deg2rad = (deg: number) => deg * (Math.PI / 180);
    const rad2deg = (rad: number) => rad * (180 / Math.PI);
    const dLon = deg2rad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(deg2rad(lat2));
    const x =
      Math.cos(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) -
      Math.sin(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.cos(dLon);

    return (rad2deg(Math.atan2(y, x)) + 360) % 360;
  }, [lat1, lon1, lat2, lon2]);

  // Relative bearing: how many degrees the arrow must rotate from "straight up"
  // (= device's forward direction) to point at the destination.
  const relativeBearing = useMemo(() => {
    if (absoluteBearing == null) return null;

    return (absoluteBearing - deviceHeading + 360) % 360;
  }, [absoluteBearing, deviceHeading]);

  // Animate arrow along the shortest arc whenever relativeBearing changes.
  useEffect(() => {
    if (relativeBearing == null) return;

    // Find delta to the new angle, clamped to [-180, 180] to take the short way around.
    let delta = relativeBearing - (cumulativeRotation.current % 360);
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    cumulativeRotation.current += delta;

    Animated.timing(arrowRotation, {
      toValue: cumulativeRotation.current,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [relativeBearing, arrowRotation]);

  // Human-readable label for the absolute compass direction to the destination.
  const directionLabel = useMemo(() => {
    if (absoluteBearing == null) return null;

    if (absoluteBearing >= 337.5 || absoluteBearing < 22.5) return texts.tour.directions.north;
    if (absoluteBearing < 67.5) return texts.tour.directions.northEast;
    if (absoluteBearing < 112.5) return texts.tour.directions.east;
    if (absoluteBearing < 157.5) return texts.tour.directions.southEast;
    if (absoluteBearing < 202.5) return texts.tour.directions.south;
    if (absoluteBearing < 247.5) return texts.tour.directions.southWest;
    if (absoluteBearing < 292.5) return texts.tour.directions.west;

    return texts.tour.directions.northWest;
  }, [absoluteBearing]);

  return (
    <View>
      {!!distanceText && (
        <>
          <Wrapper>
            <WrapperRow itemsCenter>
              <Icon.NamedIcon name="route" color={colors.primary} style={styles.margin} />
              <View>
                <RegularText small>{texts.tour.distance}</RegularText>
                <BoldText small>{distanceText}</BoldText>
              </View>
            </WrapperRow>
          </Wrapper>

          <Divider style={styles.divider} />
        </>
      )}

      {directionLabel != null && (
        <>
          <Wrapper>
            <WrapperRow itemsCenter>
              {/* Arrow rotates continuously to point at the destination relative to where
                  the device is currently facing. */}
              <Animated.View
                style={[
                  styles.margin,
                  {
                    transform: [
                      {
                        rotate: arrowRotation.interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '360deg'],
                          extrapolate: 'extend'
                        })
                      }
                    ]
                  }
                ]}
              >
                <Icon.NamedIcon name="arrow-narrow-up" color={colors.primary} />
              </Animated.View>
              <View>
                <RegularText small>{texts.tour.direction}</RegularText>
                <BoldText small>{directionLabel}</BoldText>
              </View>
            </WrapperRow>
          </Wrapper>

          <Divider style={styles.divider} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.placeholder
  },
  margin: {
    marginRight: normalize(12)
  }
});
