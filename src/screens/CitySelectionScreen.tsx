import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  Button,
  DropdownSelect,
  EmptyMessage,
  HtmlView,
  LoadingSpinner,
  SafeAreaViewFlex,
  ServiceTiles,
  Title,
  Touchable,
  Wrapper,
  WrapperRow
} from '../components';
import { colors, Icon, normalize } from '../config';
import { addToStore, readFromStore, removeFromStore } from '../helpers';
import { useStaticContent } from '../hooks';
import { DropdownProps } from '../types';

const SELECTED_CITY = 'selectedCity';

const useCitySelection = () => {
  const [storedCity, setStoredCity] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadStoredCity = useCallback(async () => {
    setLoading(true);
    const city = await readFromStore(SELECTED_CITY);
    setStoredCity(city);
    setLoading(false);

    return city;
  }, []);

  const storeCity = useCallback(async (city: string | null) => {
    if (city) {
      await addToStore(SELECTED_CITY, city);
      setStoredCity(city);
    }
  }, []);

  const resetCity = useCallback(async () => {
    await removeFromStore(SELECTED_CITY);
    setStoredCity(null);
  }, []);

  return { storeCity, storedCity, loadStoredCity, loading, resetCity };
};

export const CitySelectionScreen = () => {
  const { data: citiesData, loading: citiesLoading } = useStaticContent<Array<string>>({
    refreshTimeKey: 'cities',
    name: 'cities',
    type: 'json'
  });

  const { data: htmlContent, loading: htmlLoading } = useStaticContent({
    refreshTimeKey: 'cityHtmlContent',
    name: 'cityHtmlContent',
    type: 'html'
  });

  const initiallySelectedItem = {
    id: 0,
    index: 0,
    value: 'z.B. Stuttgart',
    selected: true
  };
  const [dropdownData, setDropdownData] = useState<DropdownProps[]>([initiallySelectedItem]);

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [contentName, setContentName] = useState<string | null>(null);
  const { storeCity, loadStoredCity, storedCity, loading, resetCity } = useCitySelection();

  useEffect(() => {
    const setContentNameWithCity = async () => {
      const city = await loadStoredCity();
      if (city) {
        setContentName(`city${city}`);
      }
    };

    setContentNameWithCity();
  }, []);

  useEffect(() => {
    if (citiesData?.length) {
      updateDropdownData();
    }
  }, [citiesData]);

  useEffect(() => {
    setSelectedCity(
      dropdownData[0].selected
        ? null
        : dropdownData[dropdownData.findIndex((item) => item.selected)]?.value
    );
  }, [dropdownData]);

  const updateDropdownData = useCallback(() => {
    const cities =
      citiesData?.map((city, index) => ({
        id: index + 1,
        index: index + 1,
        value: city,
        selected: city === storedCity
      })) || [];

    setDropdownData([initiallySelectedItem, ...cities]);
  }, [citiesData]);

  const onResetPress = useCallback(() => {
    Alert.alert('Ort zurücksetzen', 'Möchten Sie den ausgewählten Ort wirklich zurücksetzen?', [
      {
        text: 'Abbrechen',
        style: 'cancel'
      },
      {
        text: 'OK',
        onPress: async () => {
          setSelectedCity(null);
          setContentName(null);
          updateDropdownData();
          await resetCity();
        }
      }
    ]);
  }, [updateDropdownData]);

  if (loading || htmlLoading || citiesLoading) {
    return <LoadingSpinner loading />;
  }

  if (dropdownData?.length < 2) {
    return <EmptyMessage title="Orte nicht verfügbar" />;
  }

  if (!storedCity && !contentName) {
    return (
      <SafeAreaViewFlex>
        <Wrapper>
          <HtmlView html={htmlContent} />

          <DropdownSelect
            data={dropdownData}
            placeholder="z.B. Stuttgart"
            setData={setDropdownData}
          />
        </Wrapper>
        <Wrapper noPaddingTop>
          <Button
            disabled={!selectedCity}
            title="Weiter"
            onPress={() => {
              storeCity(selectedCity);
              setSelectedCity(selectedCity);
              setContentName(`city${selectedCity}`);
            }}
          />
        </Wrapper>
      </SafeAreaViewFlex>
    );
  }

  return (
    <SafeAreaViewFlex>
      <Wrapper noPaddingBottom>
        <WrapperRow itemsCenter>
          <Title>{storedCity}</Title>

          <Touchable onPress={onResetPress}>
            <Icon.Pen
              color={colors.darkText}
              size={normalize(18)}
              style={{ paddingLeft: normalize(16) }}
            />
          </Touchable>
        </WrapperRow>
      </Wrapper>

      <ServiceTiles staticJsonName={contentName} />
    </SafeAreaViewFlex>
  );
};
