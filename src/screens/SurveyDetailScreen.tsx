import { RouteProp } from '@react-navigation/core';
import React from 'react';
import { useQuery } from 'react-apollo';
import { ScrollView, StyleSheet } from 'react-native';

import {
  BoldText,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { combineLanguages } from '../helpers';
import { usePullToRefetch, useSurveyLanguages } from '../hooks';
import { DETAILED_SURVEY } from '../queries/survey';
import { Survey } from '../types';

type Props = {
  route: RouteProp<any, any>;
};

const useSurvey = (id?: string) => {
  const { data, loading, refetch } = useQuery<{ surveys: Survey[] }>(DETAILED_SURVEY, {
    fetchPolicy: 'cache-and-network',
    variables: { id },
    skip: !id?.length
  });

  return { loading, refetch, survey: data?.surveys[0] };
};

export const SurveyDetailScreen = ({ route }: Props) => {
  const { loading, refetch, survey } = useSurvey(route.params?.id);
  const languages = useSurveyLanguages();

  const RefreshControl = usePullToRefetch(loading, refetch);

  if (!survey) {
    return null;
  }

  const title = combineLanguages(languages, survey.title);
  const description = combineLanguages(languages, survey.description);
  const questionTitle = combineLanguages(languages, survey.questionTitle);
  const responseOptions = survey.responseOptions.map((responseOption) => ({
    title: combineLanguages(languages, responseOption.title),
    id: responseOption.id
  }));

  return (
    <SafeAreaViewFlex>
      <ScrollView refreshControl={RefreshControl}>
        <WrapperWithOrientation>
          {!!title?.length && <SectionHeader title={title} />}
          {!!description?.length && (
            <Wrapper>
              <RegularText>{description}</RegularText>
            </Wrapper>
          )}
          {!!questionTitle?.length && (
            <Wrapper>
              <BoldText>{questionTitle}</BoldText>
            </Wrapper>
          )}
          {responseOptions.map((responseOption) => (
            <Wrapper key={responseOption.id} style={styles.noPaddingBottom}>
              <RegularText>{responseOption.title}</RegularText>
            </Wrapper>
          ))}
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  noPaddingBottom: {
    paddingBottom: 0
  }
});
