import _kebabCase from 'lodash/kebabCase';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import {
  Button,
  DropdownSelect,
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
import { readFromStore, SELECTED_CITY, storeSelectedCity } from '../helpers';
import { useStaticContent } from '../hooks';
import { SettingsContext } from '../SettingsProvider';
import { DropdownProps } from '../types';

export const CitySelectionScreen = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { citySelection = {} } = settings;

  const { data: citiesData, loading: citiesLoading } = useStaticContent<Array<string>>({
    refreshTimeKey: `publicJsonFile-${citySelection.cityListName}`,
    name: `${citySelection.cityListName}`,
    type: 'json'
  });

  const { data: htmlContent, loading: htmlLoading } = useStaticContent<string>({
    refreshTimeKey: `publicHtmlFile-${citySelection.htmlFileName}`,
    name: `${citySelection.htmlFileName}`,
    type: 'html'
  });

  const [dropdownData, setDropdownData] = useState<DropdownProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [storedCity, setStoredCity] = useState<string | null>(null);

  const contentName = useMemo(
    () => (storedCity ? `city-${_kebabCase(storedCity)}` : null),
    [storedCity]
  );

  useEffect(() => {
    const fetchStoredCity = async () => {
      const city = await readFromStore(SELECTED_CITY);
      setStoredCity(city);
      setLoading(false);
    };

    fetchStoredCity();
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
        // Select the stored city if present; otherwise select the first item
        selected: storedCity ? city === storedCity : index === 0
      })) || [];

    setDropdownData(items);
  }, [citiesData, storedCity]);

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
            setStoredCity(null);
            await storeSelectedCity(null);
            updateDropdownData();
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
              storeSelectedCity(selectedCity);
              setStoredCity(selectedCity);
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

      {!!contentName && <ServiceTiles staticJsonName={contentName} />}
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  paddingLeft: {
    paddingLeft: normalize(16)
  }
});
