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

  // Watch device position continuously so distance and bearing update as the user moves.
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const subscribe = async () => {
      try {
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5 },
          (position) => {
            setLocalPosition(position);
          }
        );
      } catch {
        // Position unavailable — keep last known value.
      }
    };

    subscribe();

    return () => {
      subscription?.remove();
    };
  }, []);

  const lat1 = localPosition?.coords.latitude;
  const lon1 = localPosition?.coords.longitude;
  const lat2 = tourStopData?.location?.geoLocation?.latitude;
  const lon2 = tourStopData?.location?.geoLocation?.longitude;

  // Tracks the device's current compass heading in degrees (0 = North).
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  // True only after the first successful heading callback — prevents showing a
  // direction based on the default 0° heading when heading is unavailable.
  const [headingAvailable, setHeadingAvailable] = useState<boolean>(false);

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
          setHeadingAvailable(true);
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
  // Only computed when heading data is confirmed available, so the default 0°
  // heading never silently produces a misleading direction.
  const relativeBearing = useMemo(() => {
    if (absoluteBearing == null || !headingAvailable) return null;

    return (absoluteBearing - deviceHeading + 360) % 360;
  }, [absoluteBearing, deviceHeading, headingAvailable]);

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

  // Human-readable label for the relative direction to the destination (updates with device heading).
  const directionLabel = useMemo(() => {
    if (relativeBearing == null) return null;

    if (relativeBearing >= 337.5 || relativeBearing < 22.5) return texts.tour.directions.north;
    if (relativeBearing < 67.5) return texts.tour.directions.northEast;
    if (relativeBearing < 112.5) return texts.tour.directions.east;
    if (relativeBearing < 157.5) return texts.tour.directions.southEast;
    if (relativeBearing < 202.5) return texts.tour.directions.south;
    if (relativeBearing < 247.5) return texts.tour.directions.southWest;
    if (relativeBearing < 292.5) return texts.tour.directions.west;

    return texts.tour.directions.northWest;
  }, [relativeBearing]);

  return (
    <View>
      {!!distanceText && (
        <>
          <Wrapper>
            <WrapperRow itemsCenter>
              <Icon.RoutePlanner color={colors.primary} style={styles.margin} />
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
                <Icon.ArrowUp color={colors.primary} />
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
