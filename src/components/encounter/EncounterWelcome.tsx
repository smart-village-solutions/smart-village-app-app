import { NavigationProp } from '@react-navigation/core';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ScrollView, StyleSheet, View } from 'react-native';

import { texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { usePullToRefetch, useRefreshTime } from '../../hooks';
import { parseEncounterWelcome } from '../../jsonValidation';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';
import { Button } from '../Button';
import { Image } from '../Image';
import { LoadingSpinner } from '../LoadingSpinner';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

type StaticContentArgs<T = unknown> = {
  publicJsonFile: string;
  refreshTimeKey?: string;
  refreshInterval?: string;
  parseFromJson?: (json: unknown) => T;
};

const useStaticContent = <T,>({
  publicJsonFile,
  parseFromJson,
  refreshInterval,
  refreshTimeKey
}: StaticContentArgs<T>): {
  data: T;
  error: boolean;
  loading: boolean;
  refetch: () => Promise<unknown>;
} => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [error, setError] = useState(false);

  const refreshTime = useRefreshTime(refreshTimeKey ?? publicJsonFile, refreshInterval);

  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });

  const { data, error: queryError, loading, refetch } = useQuery(
    getQuery(QUERY_TYPES.PUBLIC_JSON_FILE),
    {
      variables: { name: publicJsonFile },
      fetchPolicy,
      skip: !refreshTime
    }
  );

  const refetchCallback = useCallback(async () => {
    setError(false);
    return await refetch?.();
  }, [refetch]);

  const publicJsonFileData = useMemo(() => {
    try {
      if (data) {
        const json = JSON.parse(data?.publicJsonFile?.content);

        return parseFromJson ? parseFromJson(json) : json;
      }
    } catch (error) {
      setError(true);
      console.warn(error, data);
    }
  }, [data, parseFromJson]);

  return {
    data: publicJsonFileData,
    error: error || !!queryError,
    loading: loading || (!publicJsonFileData && !error),
    refetch: refetchCallback
  };
};

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: NavigationProp<any>;
};

export const EncounterWelcome = ({ navigation }: Props) => {
  const { data, error, loading, refetch } = useStaticContent({
    publicJsonFile: 'encounterWelcome',
    parseFromJson: parseEncounterWelcome
  });

  const onPress = useCallback(() => {
    navigation.navigate(ScreenName.EncounterRegistration);
  }, [navigation]);

  const RefreshControl = usePullToRefetch(refetch);

  if (!data && loading) {
    return <LoadingSpinner loading />;
  }

  if (error) {
    return (
      <SafeAreaViewFlex>
        <Wrapper>
          <RegularText>{texts.encounter.errorLoadingUser}</RegularText>
        </Wrapper>
      </SafeAreaViewFlex>
    );
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView refreshControl={RefreshControl}>
        <WrapperWithOrientation>
          <View style={styles.imageContainer}>
            <Image source={{ uri: data.imageUrl }} />
          </View>
          <SectionHeader title={data.welcomeTitle} />
          <Wrapper>
            <RegularText>{data.welcomeText}</RegularText>
          </Wrapper>
          <Wrapper>
            <Button title={texts.encounter.registerNow} onPress={onPress} />
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center'
  }
});
