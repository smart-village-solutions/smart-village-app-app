import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

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
import { colors, Icon, normalize, texts } from '../config';
import { useCitySelection, useStaticContent } from '../hooks';
import { DropdownProps } from '../types';
import { SettingsContext } from '../SettingsProvider';

export const CitySelectionScreen = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { citySelection = {} } = settings;

  const { data: citiesData, loading: citiesLoading } = useStaticContent<Array<string>>({
    refreshTimeKey: `publicJsonFile-${citySelection.cityListName}`,
    name: `${citySelection.cityListName}`,
    type: 'json'
  });

  const { data: htmlContent, loading: htmlLoading } = useStaticContent({
    refreshTimeKey: `publicHtmlFile-${citySelection.htmlFileName}`,
    name: `${citySelection.htmlFileName}`,
    type: 'html'
  });

  const [dropdownData, setDropdownData] = useState<DropdownProps[]>([]);

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
      dropdownData?.[0]?.selected
        ? null
        : dropdownData[dropdownData.findIndex((item) => item.selected)]?.value
    );
  }, [dropdownData]);

  const updateDropdownData = useCallback(() => {
    const items =
      citiesData?.map((city, index) => ({
        id: index,
        index: index,
        value: city,
        selected: index === 0 || city === storedCity
      })) || [];

    setDropdownData(items);
  }, [citiesData]);

  const onResetPress = useCallback(() => {
    Alert.alert(
      texts.citySelection.alerts.resetAlertTitle,
      texts.citySelection.alerts.resetAlertMessage,
      [
        {
          text: texts.citySelection.alerts.cancel,
          style: 'cancel'
        },
        {
          text: texts.citySelection.alerts.ok,
          onPress: async () => {
            setSelectedCity(null);
            setContentName(null);
            updateDropdownData();
            await resetCity();
          }
        }
      ]
    );
  }, [updateDropdownData]);

  if (loading || htmlLoading || citiesLoading) {
    return <LoadingSpinner loading />;
  }

  if (!storedCity && !contentName) {
    return (
      <SafeAreaViewFlex>
        <Wrapper>
          <HtmlView html={htmlContent} />

          {!!dropdownData?.length && (
            <DropdownSelect data={dropdownData} setData={setDropdownData} />
          )}
        </Wrapper>
        <Wrapper noPaddingTop>
          <Button
            disabled={!selectedCity}
            title={texts.citySelection.next}
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
            <Icon.Pen color={colors.darkText} size={normalize(18)} style={styles.paddingLeft} />
          </Touchable>
        </WrapperRow>
      </Wrapper>

      <ServiceTiles staticJsonName={contentName} />
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  paddingLeft: {
    paddingLeft: normalize(16)
  }
});
